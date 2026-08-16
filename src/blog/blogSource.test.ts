import { expect, test, vi } from "vitest";

import {
  buildRawGistFileUrl,
  fetchBlogManifest,
  fetchBlogPost,
  parseBlogRoute,
  validateBlogManifest,
  type BlogSource,
} from "./blogSource";

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
      updatedOn: "2026-08-16",
      tags: ["AI Agents", "Debugging"],
      format: "markdown",
      file: "2026-08-16-agent-assisted-debugging.md",
      readingMinutes: 4,
    },
  ],
} as const;

function responseFor(body: string, url: string, init?: ResponseInit): Response {
  const response = new Response(body, init);
  Object.defineProperty(response, "url", { configurable: true, value: url });
  return response;
}

test("validates a strict manifest and sorts posts newest first", () => {
  const validated = validateBlogManifest(manifest);

  expect(validated.posts.map(({ slug }) => slug)).toEqual([
    "agent-assisted-debugging",
    "older-note",
  ]);
  expect(validated.posts[0]).toMatchObject({
    category: "technical-reports",
    format: "markdown",
    publishedOn: "2026-08-16",
    readingMinutes: 4,
  });
});

test.each([
  ["an unexpected root field", { ...manifest, gistId: "not-public-copy" }],
  [
    "a duplicate slug",
    { ...manifest, posts: [manifest.posts[0], { ...manifest.posts[1], slug: "older-note" }] },
  ],
  [
    "a path-like filename",
    { ...manifest, posts: [{ ...manifest.posts[0], file: "../older-note.html" }] },
  ],
  [
    "a mismatched extension",
    { ...manifest, posts: [{ ...manifest.posts[0], format: "markdown" }] },
  ],
  [
    "an invalid calendar date",
    { ...manifest, posts: [{ ...manifest.posts[0], publishedOn: "2026-02-30" }] },
  ],
  [
    "too many tags",
    { ...manifest, posts: [{ ...manifest.posts[0], tags: ["One", "Two", "Three", "Four", "Five"] }] },
  ],
  [
    "an unsupported category",
    { ...manifest, posts: [{ ...manifest.posts[0], category: "miscellaneous" }] },
  ],
  ["the previous manifest schema", { ...manifest, schemaVersion: 1 }],
  [
    "a missing category",
    {
      ...manifest,
      posts: [
        Object.fromEntries(
          Object.entries(manifest.posts[0]).filter(([key]) => key !== "category"),
        ),
      ],
    },
  ],
  [
    "a null category",
    { ...manifest, posts: [{ ...manifest.posts[0], category: null }] },
  ],
  [
    "a mixed-case category",
    { ...manifest, posts: [{ ...manifest.posts[0], category: "Ongoing-Projects" }] },
  ],
  [
    "a padded category",
    { ...manifest, posts: [{ ...manifest.posts[0], category: " ongoing-projects " }] },
  ],
  [
    "a markup category",
    { ...manifest, posts: [{ ...manifest.posts[0], category: "<b>notes</b>" }] },
  ],
])("rejects %s", (_label, candidate) => {
  expect(() => validateBlogManifest(candidate)).toThrow();
});

test("builds only fixed-origin raw Gist URLs and parses strict clean routes", () => {
  expect(buildRawGistFileUrl(source, "blog-index.json")).toBe(
    "https://gist.githubusercontent.com/umeshmg27/0123456789abcdef0123456789abcdef/raw/blog-index.json",
  );
  expect(
    buildRawGistFileUrl(
      source,
      "2026-08-16-agent-assisted-debugging.md",
      manifest.updatedAt,
    ),
  ).toBe(
    "https://gist.githubusercontent.com/umeshmg27/0123456789abcdef0123456789abcdef/raw/2026-08-16-agent-assisted-debugging.md?v=2026-08-16T10%3A30%3A00Z",
  );
  expect(parseBlogRoute("#/blog/agent-assisted-debugging")).toEqual({
    kind: "post",
    slug: "agent-assisted-debugging",
  });
  expect(parseBlogRoute("#/blog")).toEqual({ kind: "index" });
  expect(parseBlogRoute("#/blog/category/ongoing-projects")).toEqual({
    category: "ongoing-projects",
    kind: "category",
  });
  expect(
    parseBlogRoute("#/blog/category/technical-reports/agent-assisted-debugging"),
  ).toEqual({
    category: "technical-reports",
    kind: "post",
    slug: "agent-assisted-debugging",
  });
  expect(parseBlogRoute("#blog")).toEqual({ kind: "section" });
  expect(parseBlogRoute("#/blog/category/miscellaneous")).toEqual({
    kind: "invalid",
  });
  expect(parseBlogRoute("#/blog/category/miscellaneous/example")).toEqual({
    kind: "invalid",
  });
  expect(parseBlogRoute("#/blog/%2e%2e")).toEqual({ kind: "invalid" });
  expect(parseBlogRoute("#/blog/Uppercase")).toEqual({ kind: "invalid" });
  for (const invalidRoute of [
    "#/blog/category/ongoing-projects/",
    "#/blog/category/ongoing-projects/post/extra",
    "#/blog/category/Ongoing-Projects",
    "#/blog/category/%2e%2e/post",
    "#/blog/category/technical-reports/post?draft=true",
  ]) {
    expect(parseBlogRoute(invalidRoute)).toEqual({ kind: "invalid" });
  }
});

test("fetches the bounded manifest without credentials or a referrer", async () => {
  const indexUrl = buildRawGistFileUrl(source, "blog-index.json");
  const fetchImpl = vi.fn<typeof fetch>(async () =>
    responseFor(JSON.stringify(manifest), indexUrl, {
      headers: { "content-length": String(JSON.stringify(manifest).length) },
      status: 200,
    }),
  );

  const result = await fetchBlogManifest(source, { fetchImpl });

  expect(result.posts[0].slug).toBe("agent-assisted-debugging");
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(fetchImpl).toHaveBeenCalledWith(
    indexUrl,
    expect.objectContaining({
      cache: "default",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
    }),
  );
  expect(fetchImpl.mock.calls[0]?.[1]?.headers).toBeUndefined();
});

test("renders Markdown safely and secures approved external links", async () => {
  const validated = validateBlogManifest(manifest);
  const post = validated.posts[0];
  const postUrl = buildRawGistFileUrl(source, post.file, validated.updatedAt);
  const fetchImpl = vi.fn(async () =>
    responseFor(
      [
        "## What I learned",
        "",
        "A **repeatable** workflow.",
        "",
        "[Public reference](https://example.com/reference)",
        "",
        "<script>window.__blogXss = true</script>",
      ].join("\n"),
      postUrl,
      { status: 200 },
    ),
  );

  const rendered = await fetchBlogPost(source, validated, post, { fetchImpl });

  expect(rendered).toContain("<h4>What I learned</h4>");
  expect(rendered).toContain("<strong>repeatable</strong>");
  expect(rendered).toContain('href="https://example.com/reference"');
  expect(rendered).toContain('rel="noopener noreferrer"');
  expect(rendered).toContain('target="_blank"');
  expect(rendered).not.toContain("<script");
  expect(window).not.toHaveProperty("__blogXss");
});

test("renders a benign HTML fragment without weakening the strict policy", async () => {
  const validated = validateBlogManifest(manifest);
  const post = validated.posts[1];
  const postUrl = buildRawGistFileUrl(source, post.file, validated.updatedAt);
  const fetchImpl = vi.fn(async () =>
    responseFor(
      "<h2>What I learned</h2><p>A repeatable workflow with <strong>human review</strong>.</p>",
      postUrl,
      { status: 200 },
    ),
  );

  await expect(
    fetchBlogPost(source, validated, post, { fetchImpl }),
  ).resolves.toBe(
    "<h4>What I learned</h4><p>A repeatable workflow with <strong>human review</strong>.</p>",
  );
});

test.each([
  ["script", "<p>Safe</p><script>window.__blogXss = true</script>"],
  ["event handler", '<p onmouseover="window.__blogXss = true">Unsafe</p>'],
  ["full document body", "<body><p>Not a fragment</p></body>"],
  ["embedded image", '<img src="https://example.com/tracker.png" alt="tracker">'],
  ["Gist link", '<a href="https://gist.github.com/example/id">Source</a>'],
  [
    "trailing-dot Gist link",
    '<a href="https://gist.github.com./example/id">Source</a>',
  ],
  [
    "multiple-trailing-dot Gist link",
    '<a href="https://gist.github.com../example/id">Source</a>',
  ],
  ["internal link", '<a href="https://wwwin-github.cisco.com/org/repo">Internal</a>'],
  [
    "trailing-dot internal link",
    '<a href="https://wwwin-github.cisco.com./org/repo">Internal</a>',
  ],
  ["trailing-dot localhost link", '<a href="https://localhost./private">Local</a>'],
])("rejects unsafe HTML containing a %s", async (_label, body) => {
  const validated = validateBlogManifest(manifest);
  const post = validated.posts[1];
  const postUrl = buildRawGistFileUrl(source, post.file, validated.updatedAt);
  const fetchImpl = vi.fn(async () => responseFor(body, postUrl, { status: 200 }));

  await expect(
    fetchBlogPost(source, validated, post, { fetchImpl }),
  ).rejects.toThrow();
  expect(window).not.toHaveProperty("__blogXss");
});

test.each([
  ["Gist", "https://gist.github.com./example/id"],
  ["internal GitHub", "https://wwwin-github.cisco.com./org/repo"],
  ["localhost", "https://localhost./private"],
  ["internal GitHub subdomain", "https://foo.wwwin-github.cisco.com/org/repo"],
  ["internal Cisco host", "https://internal.cisco.com/private"],
  ["GitHub Gist API", "https://api.github.com/gists/example-id"],
])("rejects a blocked %s link in Markdown", async (_label, href) => {
  const validated = validateBlogManifest(manifest);
  const post = validated.posts[0];
  const postUrl = buildRawGistFileUrl(source, post.file, validated.updatedAt);
  const fetchImpl = vi.fn(async () =>
    responseFor(`[Unsafe link](${href})`, postUrl, { status: 200 }),
  );

  await expect(
    fetchBlogPost(source, validated, post, { fetchImpl }),
  ).rejects.toThrow();
});

test("rejects non-successful, oversized, and off-origin responses", async () => {
  const indexUrl = buildRawGistFileUrl(source, "blog-index.json");

  await expect(
    fetchBlogManifest(source, {
      fetchImpl: vi.fn(async () => responseFor("missing", indexUrl, { status: 404 })),
    }),
  ).rejects.toThrow("temporarily unavailable");

  await expect(
    fetchBlogManifest(source, {
      fetchImpl: vi.fn(async () =>
        responseFor("{}", indexUrl, {
          headers: { "content-length": "999999" },
          status: 200,
        }),
      ),
    }),
  ).rejects.toThrow("too large");

  await expect(
    fetchBlogManifest(source, {
      fetchImpl: vi.fn(async () =>
        responseFor(JSON.stringify(manifest), "https://example.com/blog-index.json", {
          status: 200,
        }),
      ),
    }),
  ).rejects.toThrow("unexpected location");
});

test("rejects a chunked oversized response and honors caller cancellation", async () => {
  const indexUrl = buildRawGistFileUrl(source, "blog-index.json");
  const oversizedStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(70 * 1024).fill(97));
      controller.enqueue(new Uint8Array(70 * 1024).fill(97));
      controller.close();
    },
  });
  const oversizedResponse = new Response(oversizedStream, { status: 200 });
  Object.defineProperty(oversizedResponse, "url", {
    configurable: true,
    value: indexUrl,
  });

  await expect(
    fetchBlogManifest(source, {
      fetchImpl: vi.fn(async () => oversizedResponse),
    }),
  ).rejects.toThrow("too large");

  const controller = new AbortController();
  const stalledFetch = vi.fn<typeof fetch>(
    async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) {
          reject(new Error("missing request signal"));
          return;
        }
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      }),
  );
  const pending = fetchBlogManifest(source, {
    fetchImpl: stalledFetch,
    signal: controller.signal,
  });
  controller.abort();

  await expect(pending).rejects.toThrow("temporarily unavailable");
});
