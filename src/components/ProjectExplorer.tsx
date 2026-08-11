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
const projectIds = new Set(projectRecords.map((project) => project.id));
const legacyProjectIds = new Map([["nd-alphax", "nd-nexusone"]]);

function projectCountText(count: number, archiveOpen: boolean): string {
  if (!archiveOpen) return `Showing ${count} featured projects.`;
  return `Showing ${count} ${count === 1 ? "project" : "projects"}.`;
}

function projectIdFromHash(): string | null {
  const requestedProjectId = window.location.hash.startsWith("#project-")
    ? window.location.hash.slice("#project-".length)
    : "";
  const projectId = legacyProjectIds.get(requestedProjectId) ?? requestedProjectId;

  return projectIds.has(projectId) ? projectId : null;
}

function archivedProjectIdFromHash(): string | null {
  const projectId = projectIdFromHash();

  return projectId && archivedProjectIds.has(projectId) ? projectId : null;
}

function canonicalizeLegacyProjectHash(projectId: string): void {
  const requestedProjectId = window.location.hash.startsWith("#project-")
    ? window.location.hash.slice("#project-".length)
    : "";

  if (legacyProjectIds.get(requestedProjectId) === projectId) {
    window.history.replaceState(null, "", `#project-${projectId}`);
  }
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
  const pendingProjectIdRef = useRef<string | null>(projectIdFromHash());
  const [hashRequestVersion, setHashRequestVersion] = useState(0);
  const visibleProjects = state.archiveOpen
    ? filterProjects(projectRecords, state.query)
    : featuredProjects;

  const revealProjectFromHash = useCallback((): void => {
    const projectId = projectIdFromHash();

    if (!projectId) return;

    canonicalizeLegacyProjectHash(projectId);
    pendingProjectIdRef.current = projectId;
    setState((current) =>
      (current.archiveOpen || !archivedProjectIds.has(projectId)) &&
      current.query === ""
        ? current
        : { ...current, archiveOpen: true, query: "" },
    );
    setHashRequestVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    const projectId = projectIdFromHash();
    if (projectId) canonicalizeLegacyProjectHash(projectId);
    window.addEventListener("hashchange", revealProjectFromHash);

    return () =>
      window.removeEventListener("hashchange", revealProjectFromHash);
  }, [revealProjectFromHash]);

  useEffect(() => {
    const projectId = pendingProjectIdRef.current;

    if (!projectId || state.query !== "") return;

    const target = document.getElementById(`project-${projectId}`);
    if (!target) return;

    target.scrollIntoView({ block: "start" });
    const heading = target.querySelector<HTMLElement>("h3");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    pendingProjectIdRef.current = null;
  }, [hashRequestVersion, state.archiveOpen, state.query]);

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
          <p className={styles.eyebrow}>Projects I’ve worked on</p>
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
