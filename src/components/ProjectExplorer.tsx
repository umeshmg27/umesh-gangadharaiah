import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Project } from "../content/models";
import { projects } from "../content/projects";
import { filterProjects } from "../projects/filterProjects";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectExplorer.module.css";

type ProjectExplorerState = {
  archiveOpen: boolean;
  query: string;
  expandedIds: ReadonlySet<string>;
};

const projectRecords: readonly Project[] = projects;
const featuredProjects = projectRecords
  .filter((project) => project.featuredOrder !== undefined)
  .sort(
    (left, right) =>
      (left.featuredOrder ?? Number.POSITIVE_INFINITY) -
      (right.featuredOrder ?? Number.POSITIVE_INFINITY),
  );
const archivedProjectIds = new Set(
  projectRecords
    .filter((project) => project.featuredOrder === undefined)
    .map((project) => project.id),
);

function projectCountText(count: number, archiveOpen: boolean): string {
  if (!archiveOpen) return `Showing ${count} featured projects.`;
  return `Showing ${count} ${count === 1 ? "project" : "projects"}.`;
}

function archivedProjectIdFromHash(): string | null {
  const projectId = window.location.hash.startsWith("#project-")
    ? window.location.hash.slice("#project-".length)
    : "";

  return archivedProjectIds.has(projectId) ? projectId : null;
}

export default function ProjectExplorer() {
  const [state, setState] = useState<ProjectExplorerState>(() => {
    const archivedProjectId = archivedProjectIdFromHash();

    return {
      archiveOpen: archivedProjectId !== null,
      query: "",
      expandedIds: new Set<string>(),
    };
  });
  const archiveControlRef = useRef<HTMLButtonElement>(null);
  const pendingProjectIdRef = useRef<string | null>(
    archivedProjectIdFromHash(),
  );
  const visibleProjects = state.archiveOpen
    ? filterProjects(projectRecords, state.query)
    : featuredProjects;

  const revealArchivedProjectFromHash = useCallback((): void => {
    const projectId = archivedProjectIdFromHash();

    if (!projectId) return;

    pendingProjectIdRef.current = projectId;
    setState((current) =>
      current.archiveOpen && current.query === ""
        ? current
        : { ...current, archiveOpen: true, query: "" },
    );
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", revealArchivedProjectFromHash);

    return () =>
      window.removeEventListener("hashchange", revealArchivedProjectFromHash);
  }, [revealArchivedProjectFromHash]);

  useEffect(() => {
    const projectId = pendingProjectIdRef.current;

    if (!projectId || !state.archiveOpen || state.query !== "") return;

    const target = document.getElementById(`project-${projectId}`);
    if (!target) return;

    target.scrollIntoView({ block: "start" });
    const heading = target.querySelector<HTMLElement>("h3");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    pendingProjectIdRef.current = null;
  }, [state.archiveOpen, state.query]);

  function toggleArchive(): void {
    if (state.archiveOpen) {
      archiveControlRef.current?.focus();

      const projectId = window.location.hash.startsWith("#project-")
        ? window.location.hash.slice("#project-".length)
        : "";
      if (archivedProjectIds.has(projectId)) {
        window.history.replaceState(null, "", "#projects");
      }
    }

    setState((current) => ({
      ...current,
      archiveOpen: !current.archiveOpen,
      query: current.archiveOpen ? "" : current.query,
    }));
  }

  function updateQuery(event: ChangeEvent<HTMLInputElement>): void {
    setState((current) => ({ ...current, query: event.target.value }));
  }

  function toggleDetails(projectId: string): void {
    setState((current) => {
      const expandedIds = new Set(current.expandedIds);

      if (expandedIds.has(projectId)) expandedIds.delete(projectId);
      else expandedIds.add(projectId);

      return { ...current, expandedIds };
    });
  }

  return (
    <section
      aria-labelledby="projects-heading"
      className={styles.section}
      id="projects"
    >
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Selected work</p>
          <h2 className={styles.heading} id="projects-heading">
            Projects
          </h2>
        </div>

        <button
          aria-controls="project-results"
          aria-expanded={state.archiveOpen}
          className={styles.archiveControl}
          onClick={toggleArchive}
          ref={archiveControlRef}
          type="button"
        >
          {state.archiveOpen
            ? "Show featured projects"
            : `View all ${projectRecords.length} projects`}
        </button>
      </div>

      {state.archiveOpen ? (
        <div className={styles.searchControls}>
          <label className={styles.searchLabel} htmlFor="project-search">
            Search projects
          </label>
          <input
            aria-describedby="project-search-description"
            className={styles.searchInput}
            id="project-search"
            onChange={updateQuery}
            type="search"
            value={state.query}
          />
          <p className={styles.searchDescription} id="project-search-description">
            Search project titles and descriptions.
          </p>
        </div>
      ) : null}

      <p className={styles.resultCount}>
        {projectCountText(visibleProjects.length, state.archiveOpen)}
      </p>

      <div id="project-results">
        {visibleProjects.length > 0 ? (
          <div className={styles.grid}>
            {visibleProjects.map((project) => (
              <ProjectCard
                expanded={state.expandedIds.has(project.id)}
                key={project.id}
                onToggle={toggleDetails}
                project={project}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>No projects match your search.</p>
        )}
      </div>
    </section>
  );
}
