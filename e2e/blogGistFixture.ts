export const e2eBlogGistId = "0123456789abcdef0123456789abcdef";
export const e2eBlogGistOrigin = "https://gist.githubusercontent.com";

const manifest = {
  schemaVersion: 2,
  updatedAt: "2026-08-16T10:30:00Z",
  posts: [
    {
      slug: "release-debugging-notes",
      title: "Release debugging notes",
      summary: "A compact checklist for narrowing down a difficult release failure.",
      category: "ongoing-projects",
      publishedOn: "2026-08-14",
      tags: ["Debugging", "Releases"],
      format: "markdown",
      file: "2026-08-14-release-debugging-notes.md",
      readingMinutes: 3,
    },
    {
      slug: "agent-assisted-debugging",
      title: "Agent-assisted debugging",
      summary: "How I used a careful workflow to narrow down a software fault.",
      category: "technical-reports",
      publishedOn: "2026-08-16",
      tags: ["AI Agents", "Debugging"],
      format: "markdown",
      file: "2026-08-16-agent-assisted-debugging.md",
      readingMinutes: 4,
    },
    {
      slug: "deterministic-simulation",
      title: "Designing a deterministic simulation",
      summary: "What made a small browser simulation useful for validating behavior.",
      category: "notes-and-experiments",
      publishedOn: "2026-08-15",
      tags: ["Simulation", "Validation"],
      format: "html",
      file: "2026-08-15-deterministic-simulation.html",
      readingMinutes: 5,
    },
    {
      slug: "test-design-checklist",
      title: "A practical test-design checklist",
      summary: "Questions I use to turn expected behavior into useful automated coverage.",
      category: "technical-reports",
      publishedOn: "2026-08-13",
      tags: ["Testing"],
      format: "markdown",
      file: "2026-08-13-test-design-checklist.md",
      readingMinutes: 2,
    },
  ],
} as const;

const bodies = new Map<string, string>([
  [
    "2026-08-16-agent-assisted-debugging.md",
    [
      "## The approach",
      "",
      "I kept the evidence focused, compared competing explanations, and kept the final decision human-owned.",
      "",
      "- Gather the smallest useful evidence set.",
      "- Validate the fix against the original behavior.",
      "",
      "[Read a public reference](https://example.com/reference)",
    ].join("\n"),
  ],
  [
    "2026-08-15-deterministic-simulation.html",
    "<h2>Why it helped</h2><p>The simulation made state changes visible and repeatable.</p>",
  ],
  [
    "2026-08-14-release-debugging-notes.md",
    "## Checklist\n\nReproduce, isolate, validate, and document the result.",
  ],
  [
    "2026-08-13-test-design-checklist.md",
    "## Questions\n\nWhat can fail, and how will the test prove it?",
  ],
]);

export function blogGistFixtureForUrl(
  requestUrl: URL,
): { readonly body: string; readonly contentType: string } | null {
  if (
    requestUrl.origin !== e2eBlogGistOrigin ||
    !requestUrl.pathname.startsWith(`/umeshmg27/${e2eBlogGistId}/raw/`)
  ) {
    return null;
  }

  const file = requestUrl.pathname.split("/").at(-1);
  if (file === "blog-index.json") {
    return {
      body: JSON.stringify(manifest),
      contentType: "application/json; charset=utf-8",
    };
  }

  const body = file ? bodies.get(file) : undefined;
  if (body === undefined) return null;
  return {
    body,
    contentType: file?.endsWith(".html")
      ? "text/html; charset=utf-8"
      : "text/markdown; charset=utf-8",
  };
}
