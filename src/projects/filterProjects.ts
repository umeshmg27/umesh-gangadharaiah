import type { Project } from "../content/models";

export function filterProjects(
  projects: readonly Project[],
  query: string,
): readonly Project[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return projects;

  return projects.filter((project) =>
    `${project.title} ${project.description}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
