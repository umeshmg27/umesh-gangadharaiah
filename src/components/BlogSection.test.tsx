import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { BlogSource } from "../blog/blogSource";
import BlogSection from "./BlogSection";
import blogCss from "./BlogSection.module.css?raw";

const source = {
  owner: "umeshmg27",
  gistId: "0123456789abcdef0123456789abcdef",
} as const satisfies BlogSource;

const manifest = {
  schemaVersion: 2,
  updatedAt: "2026-08-16T10:30:00Z",
  posts: [
    {
      slug: "older-note",
      title: "An older note",
      summary: "A concise summary of the older technical note.",
      category: "ongoing-projects",
      publishedOn: "2026-08-14",
      tags: ["Debugging"],
      format: "html",
      file: "2026-08-14-older-note.html",
      readingMinutes: 2,
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
  ],
} as const;

function responseFor(body: string, url: string, status = 200): Response {
  const response = new Response(body, { status });
  Object.defineProperty(response, "url", { configurable: true, value: url });
  return response;
}

function createFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/raw/blog-index.json")) {
      return responseFor(JSON.stringify(manifest), url);
    }
    if (url.includes("2026-08-16-agent-assisted-debugging.md")) {
      return responseFor(
        "## The approach\n\nI kept the evidence small and the review human-owned.",
        url,
      );
    }
    if (url.includes("2026-08-14-older-note.html")) {
      return responseFor("<h2>Older finding</h2><p>Useful context.</p>", url);
    }
    return responseFor("not found", url, 404);
  });
}

beforeEach(() => {
  window.history.replaceState(null, "", "/umesh-gangadharaiah/");
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("shows an honest empty state without making a request when no Gist is configured", () => {
  const fetchImpl = vi.fn();
  render(<BlogSection fetchImpl={fetchImpl} source={null} />);

  const blog = screen.getByRole("region", { name: "Blog" });
  expect(within(blog).getByText("Technical writing")).toBeInTheDocument();
  expect(
    within(blog).getByText(
      "Project updates, technical investigations, and practical experiments—written to share useful ideas without internal details.",
    ),
  ).toBeInTheDocument();
  expect(
    within(blog).getByText(
      "I’m working on the first note. This is where I’ll share practical lessons from building, debugging, and automating software.",
    ),
  ).toBeInTheDocument();
  expect(fetchImpl).not.toHaveBeenCalled();
});

test("loads newest-first summaries with clean links that contain no Gist identity", async () => {
  const fetchImpl = createFetch();
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  const blog = screen.getByRole("region", { name: "Blog" });
  expect(within(blog).getByRole("status")).toHaveTextContent("Loading notes");
  const cards = await within(blog).findAllByRole("article");

  expect(cards.map((card) => card.dataset.blogSlug)).toEqual([
    "agent-assisted-debugging",
    "older-note",
  ]);
  const newest = cards[0];
  expect(within(newest).getByText("16 August 2026")).toHaveAttribute(
    "datetime",
    "2026-08-16",
  );
  expect(within(newest).getByText("4 min read")).toBeInTheDocument();
  expect(within(newest).getByText("Technical Reports")).toBeInTheDocument();
  expect(within(newest).getByRole("list", { name: "Tags" })).toHaveTextContent(
    "AI AgentsDebugging",
  );
  const readLink = within(newest).getByRole("link", { name: "Read post" });
  expect(readLink).toHaveAttribute("href", "#/blog/agent-assisted-debugging");
  expect(readLink.getAttribute("href")).not.toContain(source.gistId);
  expect(document.body).not.toHaveTextContent(source.gistId);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test("filters through clean category routes and preserves that context for the post", async () => {
  const user = userEvent.setup();
  const fetchImpl = createFetch();
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  const categories = await screen.findByRole("navigation", {
    name: "Blog categories",
  });
  const allNotes = within(categories).getByRole("link", {
    name: "All Notes (2)",
  });
  const ongoing = within(categories).getByRole("link", {
    name: "Ongoing Projects (1)",
  });
  const technical = within(categories).getByRole("link", {
    name: "Technical Reports (1)",
  });
  const experiments = within(categories).getByRole("link", {
    name: "Notes & Experiments (0)",
  });

  expect(allNotes).toHaveAttribute("aria-current", "page");
  expect(ongoing).toHaveAttribute("href", "#/blog/category/ongoing-projects");
  expect(technical).toHaveAttribute("href", "#/blog/category/technical-reports");
  expect(experiments).toHaveAttribute(
    "href",
    "#/blog/category/notes-and-experiments",
  );

  await user.click(technical);
  expect(window.location.hash).toBe("#/blog/category/technical-reports");
  expect(technical).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("heading", { name: "Agent-assisted debugging" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "An older note" })).not.toBeInTheDocument();
  expect(fetchImpl).toHaveBeenCalledTimes(1);

  const readPost = screen.getByRole("link", { name: "Read post" });
  expect(readPost).toHaveAttribute(
    "href",
    "#/blog/category/technical-reports/agent-assisted-debugging",
  );
  await user.click(readPost);
  const back = await screen.findByRole("link", {
    name: "Back to Technical Reports",
  });
  expect(back).toHaveAttribute("href", "#/blog/category/technical-reports");

  await user.click(back);
  expect(window.location.hash).toBe("#/blog/category/technical-reports");
  await waitFor(() =>
    expect(
      screen.getByRole("link", { name: "Technical Reports (1)" }),
    ).toHaveFocus(),
  );

  await user.click(
    screen.getByRole("link", { name: "Notes & Experiments (0)" }),
  );
  expect(screen.getByText("No Notes & Experiments yet.")).toBeVisible();
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});

test("opens a clean post route, focuses its heading, and returns to the index", async () => {
  const user = userEvent.setup();
  const fetchImpl = createFetch();
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  const newestCard = (await screen.findByRole("heading", {
    name: "Agent-assisted debugging",
  })).closest("article");
  expect(newestCard).not.toBeNull();
  const readLink = within(newestCard!).getByRole("link", { name: "Read post" });
  await user.click(readLink);

  const heading = await screen.findByRole("heading", {
    name: "Agent-assisted debugging",
    level: 3,
  });
  expect(window.location.hash).toBe("#/blog/agent-assisted-debugging");
  expect(window.location.href).not.toContain(source.gistId);
  expect(heading).toHaveAttribute("tabindex", "-1");
  await waitFor(() => expect(heading).toHaveFocus());
  expect(await screen.findByText("The approach")).toBeInTheDocument();
  expect(await screen.findByText(/review human-owned/u)).toBeInTheDocument();
  expect(fetchImpl).toHaveBeenCalledTimes(2);

  await user.click(screen.getByRole("link", { name: "Back to All Notes" }));
  expect(window.location.hash).toBe("#/blog");
  await waitFor(() =>
    expect(screen.getByRole("link", { name: "All Notes (2)" })).toHaveFocus(),
  );
  expect(await screen.findByRole("heading", { name: "An older note" })).toBeVisible();
});

test("moves focus to the post shell immediately instead of waiting for its body", async () => {
  const user = userEvent.setup();
  let resolveBody: ((response: Response) => void) | undefined;
  const bodyResponse = new Promise<Response>((resolve) => {
    resolveBody = resolve;
  });
  const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/raw/blog-index.json")) {
      return responseFor(JSON.stringify(manifest), url);
    }
    return bodyResponse;
  });
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  const cardHeading = await screen.findByRole("heading", {
    name: "Agent-assisted debugging",
  });
  await user.click(
    within(cardHeading.closest("article")!).getByRole("link", { name: "Read post" }),
  );

  const postHeading = screen.getByRole("heading", {
    level: 3,
    name: "Agent-assisted debugging",
  });
  expect(screen.getByRole("status")).toHaveTextContent("Loading note");
  await waitFor(() => expect(postHeading).toHaveFocus());

  await act(async () => {
    resolveBody?.(
      responseFor(
        "## The approach\n\nThe body arrived after focus.",
        `https://gist.githubusercontent.com/${source.owner}/${source.gistId}/raw/2026-08-16-agent-assisted-debugging.md?v=2026-08-16T10%3A30%3A00Z`,
      ),
    );
  });
  expect(await screen.findByText("The body arrived after focus.")).toBeVisible();
  expect(postHeading).toHaveFocus();
});

test("supports a direct clean route and reports an unknown slug without fetching a body", async () => {
  window.history.replaceState(null, "", "/umesh-gangadharaiah/#/blog/not-published");
  const fetchImpl = createFetch();
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  expect(await screen.findByRole("heading", { name: "Note not found" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Back to All Notes" })).toHaveAttribute(
    "href",
    "#/blog",
  );
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test("rejects a post route whose category does not match the manifest", async () => {
  window.history.replaceState(
    null,
    "",
    "/umesh-gangadharaiah/#/blog/category/ongoing-projects/agent-assisted-debugging",
  );
  const fetchImpl = createFetch();
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  expect(await screen.findByRole("heading", { name: "Note not found" })).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Back to Ongoing Projects" }),
  ).toHaveAttribute("href", "#/blog/category/ongoing-projects");
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test("fails gently and offers an explicit retry", async () => {
  const user = userEvent.setup();
  const indexUrl = `https://gist.githubusercontent.com/${source.owner}/${source.gistId}/raw/blog-index.json`;
  const fetchImpl = vi
    .fn()
    .mockResolvedValueOnce(responseFor("unavailable", indexUrl, 503))
    .mockResolvedValueOnce(responseFor(JSON.stringify(manifest), indexUrl));
  render(<BlogSection fetchImpl={fetchImpl} source={source} />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Notes are temporarily unavailable",
  );
  await user.click(screen.getByRole("button", { name: "Retry loading notes" }));
  expect(await screen.findByRole("heading", { name: "Agent-assisted debugging" })).toBeVisible();
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});

test("keeps cards responsive and article overflow contained", () => {
  expect(blogCss).toMatch(/\.grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  expect(blogCss).toMatch(/@media \(min-width: 48rem\)[\s\S]*\.grid\s*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  expect(blogCss).toMatch(/@media \(min-width: 64rem\)[\s\S]*\.grid\s*\{[^}]*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  expect(blogCss).toMatch(/\.postBody\s+pre[\s\S]*overflow-x:\s*auto/s);
  expect(blogCss).toMatch(/\.postBody\s+table[\s\S]*overflow-x:\s*auto/s);
  expect(blogCss).toMatch(/\.categoryList\s*\{[^}]*flex-wrap:\s*wrap/s);
  expect(blogCss).toMatch(/\.categoryLink\s*\{[^}]*min-height:\s*44px/s);
});
