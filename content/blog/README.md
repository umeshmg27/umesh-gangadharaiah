# Blog Gist template

The portfolio can read published technical notes from one public GitHub Gist.
The Gist ID is a public identifier: it is visible in the built JavaScript and
the browser Network panel, but it never appears in a Blog link or address-bar
route.

Create one public Gist owned by `umeshmg27` with these files:

- `blog-index.json`, based on `blog-index.template.json`.
- One lowercase `.md` or `.html` file per published note.

Copy the Gist ID into `.env.local` for local development:

```text
VITE_BLOG_GIST_ID=replace-with-the-public-gist-id
```

For GitHub Pages, create an Actions repository variable named `BLOG_GIST_ID`.
The deployment workflow maps that public value to `VITE_BLOG_GIST_ID` while it
builds the site. Never place a GitHub token, cookie, or credential in a `VITE_`
variable.

## Daily publishing

Use one post per day or meaningful update. For ongoing work, each dated post is
one journal entry—not a mutable project page. Give every entry the primary
category `ongoing-projects`, then use its tags for the public project or topic
name. This keeps each project easy to follow while preserving a chronological
record of what changed, what you learned, and what comes next.

1. Copy `_post-template.md` or `_post-template.html` into the Gist and rename it
   to a lowercase basename such as `2026-08-16-agent-assisted-debugging.md`.
2. Write only information that is already safe for a public audience. Abstract
   internal systems, customer data, repository and service names, issue IDs,
   hosts, logs, payloads, architecture, and unreleased work.
3. Add the matching record to `blog-index.json`. Use schema version 2, a unique
   lowercase slug, and exactly one category: `ongoing-projects`,
   `technical-reports`, or `notes-and-experiments`. Tags stay secondary and can
   identify a project across many daily entries.
4. Set the manifest `updatedAt` to the current UTC timestamp. This invalidates
   the cached post URL after the raw Gist index refreshes.
5. Validate the note locally before relying on it in public.

The index accepts at most 200 posts. Each record requires a title, summary,
approved category, real ISO publication date, one to four tags, a matching
`.md`/`.html` filename, and a reading time from 1 to 60 minutes. Cards are
sorted newest first; equal dates retain manifest order. Category routes are
clean and copyable, and opening a post from a category preserves that context
for the Back link.

Markdown and HTML both pass through a strict sanitizer. HTML must be a fragment,
not a complete document. Scripts, styles, forms, frames, SVG, images, media,
event handlers, inline styles, unsafe protocols, Gist links, and internal GitHub
links are rejected. The renderer permits HTTPS links and blocks known Gist,
local, and internal destinations, but it cannot prove that every hostname is
public; the author must review every external link before publishing. A
rejected or unavailable note fails gently without affecting the rest of the
portfolio.

The reader sends no authorization header, cookie, or referrer and performs no
polling. Raw Gist content is cached by the browser/CDN for a short period, so a
new edit may take a few minutes to appear.
