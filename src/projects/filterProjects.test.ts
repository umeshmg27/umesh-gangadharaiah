import type { Project } from "../content/models";
import { projects } from "../content/projects";

import { filterProjects } from "./filterProjects";

function project(id: string, title: string, description: string): Project {
  return {
    id,
    title,
    description,
    image: {
      kind: "remote",
      alt: `${title} image metadata`,
      src: `https://assets.example.test/${id}.png`,
      width: 800,
      height: 600,
    },
    publicUrl: `https://destinations.example.test/${id}`,
  };
}

const policySearch = project(
  "internal-policy-id",
  "Realtime Policy Search",
  "Indexes C++ and [draft] policy objects.",
);
const backupRestore = project(
  "backup-destination",
  "Backup Restore",
  "Coordinates multi service workflows.",
);
const policyExplorer = project(
  "explorer-destination",
  "Policy Explorer",
  "Surfaces a second relevant result.",
);
const source = [policySearch, backupRestore, policyExplorer] as const;

function assertReadonlyReturnContract(): void {
  const result = filterProjects(source, "policy");
  // @ts-expect-error Search results are a readonly view of source records.
  result.push(policySearch);
}

void assertReadonlyReturnContract;

describe("filterProjects", () => {
  it("returns the original array reference for empty or whitespace-only queries", () => {
    expect(filterProjects(source, "")).toBe(source);
    expect(filterProjects(source, " \n\t ")).toBe(source);
  });

  it("matches titles and descriptions case-insensitively", () => {
    expect(filterProjects(source, "  REALTIME POLICY  ")).toEqual([policySearch]);
    expect(filterProjects(source, "MULTI SERVICE")).toEqual([backupRestore]);
  });

  it("uses simple multiword substring matching across the searchable text", () => {
    expect(filterProjects(source, "restore coordinates")).toEqual([backupRestore]);
  });

  it("treats special characters as literal text rather than regular expressions", () => {
    expect(filterProjects(source, "C++ and [DRAFT]")).toEqual([policySearch]);
    expect(filterProjects(source, ".*")).toEqual([]);
  });

  it("returns an empty array when no title or description matches", () => {
    expect(filterProjects(source, "no matching portfolio copy")).toEqual([]);
  });

  it("preserves source order and object identity without mutating the input", () => {
    const originalOrder = [...source];
    const result = filterProjects(source, "policy");

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(policySearch);
    expect(result[1]).toBe(policyExplorer);
    expect(source).toEqual(originalOrder);
    expect(source[0]).toBe(originalOrder[0]);
    expect(source[1]).toBe(originalOrder[1]);
    expect(source[2]).toBe(originalOrder[2]);
  });

  it("keeps featured and full portfolio matches in their existing source order", () => {
    const featured = projects.filter((project) => "featuredOrder" in project);
    const featuredMatches = filterProjects(featured, "cisco");
    const fullSourceMatches = filterProjects(projects, "tool");

    expect(featured.map(({ id }) => id)).toEqual([
      "nd-nexusone",
      "ndo-search-explore",
      "nexus-dashboard-unified-backup-restore",
      "ndo-l4l7-service-chaining",
    ]);
    expect(featuredMatches.map(({ id }) => id)).toEqual([
      "ndo-search-explore",
      "nexus-dashboard-unified-backup-restore",
      "ndo-l4l7-service-chaining",
    ]);
    expect(fullSourceMatches.map(({ id }) => id)).toEqual([
      "resource-allocation-manager",
      "ucs-config-tool",
    ]);
    expect(featuredMatches[0]).toBe(featured[1]);
    expect(featuredMatches[1]).toBe(featured[2]);
    expect(featuredMatches[2]).toBe(featured[3]);
    expect(fullSourceMatches[0]).toBe(projects[6]);
    expect(fullSourceMatches[1]).toBe(projects[8]);
  });

  it("matches public copy but not IDs, links, or image metadata", () => {
    expect(filterProjects(projects, "nd-nexusone")).toEqual([]);
    expect(filterProjects(projects, "NexusOne").map(({ id }) => id)).toEqual([
      "nd-nexusone",
    ]);
    expect(filterProjects(projects, "umeshmg27")).toEqual([]);
    expect(filterProjects(projects, "search-and-explore.jpg")).toEqual([]);
    expect(filterProjects(source, "assets.example.test")).toEqual([]);
    expect(filterProjects(source, "image metadata")).toEqual([]);
  });
});
