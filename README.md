# Umesh Gangadharaiah — Portfolio

Static React and TypeScript portfolio for Umesh Gangadharaiah, built with Vite
and published at
[umeshmg27.github.io/umesh-gangadharaiah](https://umeshmg27.github.io/umesh-gangadharaiah/).
The site is a single responsive page with recruiter-focused summaries and
keyboard-, touch-, and mouse-accessible project and recognition archives.

## Repository map

- `src/content/models.ts` defines the readonly content contracts.
- `src/content/profile.ts`, `impact.ts`, `expertise.ts`, `career.ts`,
  `projects.ts`, and `recognitions.ts` contain the build-time portfolio data.
- `src/components/` contains presentation and interaction behavior.
- `src/assets/portfolio/` contains the committed portrait, project, and
  recognition fallbacks and responsive WebP variants.
- `tests/fixtures/active-assets.json` locks the active asset inventory, hashes,
  dimensions, variants, and the two approved remote project images.
- `index.html` and `public/` contain the static metadata, manifest, icons,
  robots policy, and social preview card.

Content is imported into the bundle; there is no CMS, backend, database, or
runtime content fetch. Runtime third-party requests are limited to the two
approved Cisco-hosted project images and contact form submission through
EmailJS. The site has no analytics, visitor or chat metrics, or telemetry
upload. Its theme preference is stored only in the visitor's browser.

## Pinned development environment

Use exactly Node.js `24.14.0` and npm `11.3.0`. The versions are pinned in
`.nvmrc`, `package.json`, and both GitHub Actions workflows.

```bash
node --version
npm --version
npm ci
npm run dev
```

The version commands must print `v24.14.0` and `11.3.0`. Open the repository
subpath URL printed by Vite. Use `npm ci`, not `npm install`, for a frozen
lockfile install.

Run the complete deterministic gate before review or publication:

```bash
npm run check
```

`check` runs typed-content integrity, ESLint, unit tests, the Playwright/Axe
suite across phone, tablet, laptop, and wide viewports, generated-asset
verification, and a production build with distribution metadata checks.

To inspect the production build locally:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

The preview must be available at
`http://127.0.0.1:4173/umesh-gangadharaiah/`. With that preview running,
`npm run test:e2e` reuses it for browser acceptance.

## Preserved content contract

The integrity gate currently requires exactly 13 projects, 25 recognition
records, five career entries, four expertise areas, and five impact metrics.
The impact metrics are displayed in this order:

1. `Up to 5–6×` — reported defect-resolution throughput.
2. `50,000+` — policy objects indexed.
3. `Sub-second` — policy retrieval.
4. `300+ hours` — manual effort saved.
5. `70%` — manual effort reduced.

The initial featured projects are ordered by `featuredOrder`:

1. ND — NexusOne.
2. NDO - Search & Explore Feature.
3. Unified Backup and Restore - Cisco Nexus Dashboard.
4. Cisco NDO - Simplified L4L7 Service Chaining.

`ND — NexusOne` is a generalized, first-person account of release feature work.
It describes Umesh's role, agent-assisted planning, documentation, validation,
testing, and reliability work without publishing internal architecture,
interfaces, repositories, release information, or operational data. Its local
image was re-encoded without authoring metadata before publication.

`AI-Assisted Engineering Workflows` is the primary Impact story. Its four
plain-language workflows cover finding and fixing bugs, planning features before
coding, documenting complex systems, and simulating and validating behavior.
The same four flows are available as structured details in the project archive.
They describe reusable AI Agents, Skills, Model Context Protocol integrations,
sanitized or synthetic inputs, human-reviewed decisions, and deterministic
validation without publishing proprietary product names, repositories, issue
identifiers, customer information, operational data, or implementation details.
Its cover is a local CSS illustration, so it adds no image or runtime network
dependency. The `Up to 5–6×` result remains explicitly qualified as reported;
it is not inferred from private catalog counts.

Recognition dates are derived from each record ID's `DDMMYY` suffix. The
initial highlights are the six newest recognitions:

1. `damo-211224` (Leadership) — Ownership towards NDO ESG triages.
2. `priyanka-181224` (Mentorship) — Cisco KT Sessions.
3. `alfan-141124` (Innovation) — The right help at the right time.
4. `srid-181024` (Mentorship) — Release ownership and triages.
5. `rohi-171024` (Leadership) — Feature Ownership.
6. `atul-180724` (Innovation) — Driving ESG IT.

All recognition views are ordered newest first; equal dates preserve source
order. The full project archive and project search preserve source order.

## Maintaining content safely

For a project, add or edit its typed record in `src/content/projects.ts` and
keep its ID unique. Add `publicUrl` only after verifying a real public HTTPS
destination. Omit it when a destination is missing or uncertain; never use
`#` as a placeholder. A project without `publicUrl` deliberately renders as a
non-link card. Assign `featuredOrder` only when intentionally changing the
initial featured selection.

For a recognition, add or edit its typed record in
`src/content/recognitions.ts`, keep the ID unique, and use one of the categories
declared in `src/content/models.ts`. End the ID with the recognition date in
`DDMMYY` form; this controls the visible date, newest-first category views, and
the six newest highlights. Existing `highlightOrder` values are preserved as
legacy editorial metadata and do not control the current highlighted selection.

For local imagery, use imported relative asset references and update
`tests/fixtures/active-assets.json` with the reviewed relative source and
target paths, SHA-256, dimensions, and responsive widths. Do not embed
`/umesh-gangadharaiah/` or any other deployment base path in content; Vite
applies its configured base to imported assets. If an inventory change is
intentional, update the exact count and ordering assertions with it rather
than weakening them, then run `npm run check`.

The normal post-cleanup asset gate is:

```bash
npm run verify:assets
```

It validates the committed fallback originals and generated targets without
the removed historical source tree. The fixture still records those historical
source paths as a migration audit, but all 36 legacy originals were removed
after their optimized targets were committed. Consequently, source mode and
the optimizer are regeneration tools, not commands for a normal checkout.

Only after restoring every fixture-listed historical source at its recorded
relative path may a maintainer run:

```bash
node scripts/verify-assets.mjs --source
node scripts/optimize-images.mjs
npm run verify:assets
```

Source mode verifies the restored source hashes and dimensions. The optimizer
then copies byte-identical fallbacks and deterministically regenerates both
WebP variants. It fails closed when any required historical source is absent
or changed.

EmailJS public client configuration lives in
`src/contact/emailjsConfig.ts`. Keep the configuration centralized there; do
not reproduce its values in documentation or logs. Contact input and provider
details must not be logged, and failed submissions must leave the visitor's
input available for retry.

## External audit

Run the bounded best-effort network audit separately from deterministic checks:

```bash
npm run audit:external
```

It reports status or a redacted `unavailable` result for the approved external
destinations. It is intentionally fail-soft and exits successfully when a
third party is unavailable, so review its output; an exit code of zero is not
proof that every remote destination responded.

## GitHub Pages publication

`.github/workflows/deploy-pages.yml` is the production workflow. A push to
`master` or a manual dispatch can start it, but every job has a
`refs/heads/master` guard. It builds a verified `dist` artifact, deploys through
the `github-pages` environment, and then runs the live smoke check. Pull-request
validation in `.github/workflows/ci.yml` has read-only repository permission
and cannot deploy.

Configure GitHub once after the workflow is present on `master`:

1. Open **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open **Settings** → **Environments** → **github-pages**.
4. Restrict deployment branches and tags to the selected branch `master`.

To rerun production from the GitHub web interface:

1. Open **Actions** → **Deploy portfolio to Pages**.
2. Select **Run workflow**, choose `master`, and select **Run workflow** again.
3. Wait for **Build verified Pages artifact**, **Deploy verified Pages
   artifact**, and **Verify published portfolio** to succeed.
4. Open **Settings** → **Pages** → **Visit site**.

Choosing any non-`master` ref results in skipped publishing jobs. Do not create
or force-push a deployment branch.

After publication, verify the canonical page and its built metadata/assets:

```bash
npm run smoke:pages
```

A smoke failure leaves the release handoff incomplete. Roll back with a normal
revert of the source commit, land that revert on `master`, wait for the guarded
workflow to deploy it (or manually rerun the workflow on `master`), and run
`npm run smoke:pages` again. Git history is the rollback record; do not reset or
rewrite it.
