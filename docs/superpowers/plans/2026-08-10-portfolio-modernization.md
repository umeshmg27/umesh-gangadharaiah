# Portfolio Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Create React App portfolio with a fast, accessible, recruiter-first React site that preserves every active content record and publishes to GitHub Pages only from the current default `master` branch.

**Architecture:** A static Vite/React application imports immutable typed content at build time, with interaction state owned by focused components. Content and asset parity gates run before legacy files are deleted; deterministic unit, accessibility, browser, build, and published-site checks protect the migration.

**Tech Stack:** Node.js 24.14.0, npm 11.3.0, React 19.2.8, TypeScript 6.0.3, Vite 8.1.5, Vitest 4.1.10, Testing Library, Playwright 1.61.1, Axe 4.12.1, CSS Modules, Sharp 0.35.3, EmailJS, and GitHub Pages.

---

## Inputs and Non-Negotiable Contracts

- Approved design: `docs/superpowers/specs/2026-08-10-portfolio-modernization-design.md`.
- Working branch: `ugangadh/feat/portfolio-modernization`.
- Canonical URL: `https://umeshmg27.github.io/umesh-gangadharaiah/`.
- GitHub Pages base path: `/umesh-gangadharaiah/`.
- Preserve exactly 12 projects, 25 active recognition records, four career
  records, four expertise areas, and four approved impact metrics.
- Initial projects: four approved featured records. Initial recognition:
  six approved highlights.
- Keep the existing EmailJS service, template, and public client identifiers;
  move them from the legacy component without printing them in logs or docs.
- TypeScript remains at 6.0.3 because the selected
  `typescript-eslint@8.65.0` supports TypeScript below 6.1, not TypeScript 7.
- Production deployment is restricted to the current default branch, `master`.
  Pull requests may run validation, but feature branches never publish Pages.
- Pages uses GitHub's first-party artifact workflow and `github-pages`
  environment; it does not write a generated tree to a deployment branch.

### Legacy Content Hashes

Record these before migration and verify them until typed-content parity passes:

```text
0a238c7af4e7369616398abda116dacde9ae74ee3b7862e709b23d2e8cce9d3e  src/components/Main.tsx
a8be211a65ea95927119d38aefacec9b0b9120fe259c7cc6ebdd26c85e6f8676  src/components/Expertise.tsx
6eaffb00535832985315f69794311b19521dae22977fd3a7d3e8cd0f05c6e58d  src/components/Project.tsx
6c864cc78bb25a4263b0f9f06764579cd309a28d88f6e0e1967fdbbe525e2bca  src/components/Timeline.tsx
eeb313bb3418bdc12e4c9bfde0408cc6097a4495d5d2b4e00494d00dddb8b5cf  src/components/Contact.tsx
dfa8adac8f2ae19e162a5564a5feda2ed09266c6061f5eed7984d42de6f7f773  public/assets/json/mentorandteam.json
```

## Locked File Structure

### Root and tooling

- Modify: `package.json`, `package-lock.json`, `tsconfig.json`, `README.md`
- Create: `.nvmrc`, `index.html`, `vite.config.ts`,
  `vitest.config.ts`, `eslint.config.mjs`, `playwright.config.ts`,
  `tsconfig.app.json`, `tsconfig.node.json`
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`
- Create: `scripts/verify-legacy-hashes.mjs`,
  `scripts/optimize-images.mjs`, `scripts/verify-assets.mjs`,
  `scripts/verify-dist.mjs`, `scripts/audit-external-links.mjs`,
  `scripts/smoke-pages.mjs`, `scripts/smoke-pages.test.ts`
- Create: `tests/fixtures/legacy-content.sha256`,
  `tests/fixtures/active-assets.json`

### Application entry and global presentation

- Replace: `src/index.tsx` with `src/main.tsx`
- Replace: `src/react-app-env.d.ts` with `src/vite-env.d.ts`
- Modify: `src/App.tsx`, `src/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`

### Typed content

- Create: `src/content/models.ts`, `src/content/profile.ts`,
  `src/content/impact.ts`, `src/content/expertise.ts`,
  `src/content/projects.ts`, `src/content/career.ts`,
  `src/content/recognitions.ts`
- Create: `src/content/contentIntegrity.test.ts`
- Create: `src/content/editorialCorrections.test.ts`

### Focused behavior

- Create: `src/content/createWordBoundaryPreview.ts`,
  `src/content/createWordBoundaryPreview.test.ts`,
  `src/projects/filterProjects.ts`,
  `src/projects/filterProjects.test.ts`
- Create: `src/theme/theme.ts`, `src/theme/theme.test.ts`
- Create: `src/contact/emailjsConfig.ts`,
  `src/contact/sendContactMessage.ts`

### Components

- Create: `src/components/Header.tsx`, `src/components/Header.module.css`,
  `src/components/Header.test.tsx`
- Create: `src/components/Hero.tsx`, `src/components/Hero.module.css`
- Create: `src/components/SocialLinks.tsx`
- Create: `src/components/ImpactSummary.tsx`,
  `src/components/ImpactSummary.module.css`
- Create: `src/components/ExpertiseSection.tsx`,
  `src/components/ExpertiseSection.module.css`
- Create: `src/components/CareerTimeline.tsx`,
  `src/components/CareerTimeline.module.css`
- Create: `src/components/ProjectExplorer.tsx`,
  `src/components/ProjectExplorer.module.css`,
  `src/components/ProjectExplorer.test.tsx`
- Create: `src/components/ProjectCard.tsx`,
  `src/components/ProjectCard.module.css`
- Create: `src/components/RecognitionGallery.tsx`,
  `src/components/RecognitionGallery.module.css`,
  `src/components/RecognitionGallery.test.tsx`
- Create: `src/components/RecognitionCard.tsx`,
  `src/components/RecognitionCard.module.css`
- Create: `src/components/ContactForm.tsx`,
  `src/components/ContactForm.module.css`,
  `src/components/ContactForm.test.tsx`
- Create: `src/components/ResponsivePortfolioImage.tsx`,
  `src/components/ResponsivePortfolioImage.module.css`
- Modify: `src/components/Footer.tsx`
- Create: `src/components/Footer.module.css`

### Browser and deployment verification

- Create: `e2e/portfolio.spec.ts`, `e2e/accessibility.spec.ts`
- Create: `public/site.webmanifest`
- Create: `public/assets/social/umesh-gangadharaiah-social-card.png`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`,
  `public/icons/apple-touch-icon.png`

## Task 1: Establish the Reproducible Vite Baseline

**Files:**
- Modify: `package.json`, `package-lock.json`, `tsconfig.json`
- Create: `.nvmrc`, `vite.config.ts`, `vitest.config.ts`,
  `eslint.config.mjs`, `tsconfig.app.json`, `tsconfig.node.json`,
  `index.html`, `src/main.tsx`, `src/vite-env.d.ts`,
  `src/test/setup.ts`
- Delete after replacement: `public/index.html`, `src/index.tsx`,
  `src/react-app-env.d.ts`, `src/setupTests.ts`,
  `src/reportWebVitals.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Prove the legacy production command is tied to CRA**

Run:

```bash
npm run build
```

Expected before the migration: the command invokes `react-scripts build`.
Record its exit code and do not treat the old output as the final gate.

- [ ] **Step 2: Pin the runtime**

Create `.nvmrc`:

```text
24.14.0
```

Add to `package.json`:

```json
{
  "engines": {
    "node": "24.14.0",
    "npm": "11.3.0"
  },
  "packageManager": "npm@11.3.0"
}
```

- [ ] **Step 3: Install the compatible exact toolchain without deleting legacy UI packages**

Run with npm 11.3.0:

```bash
npm uninstall react-scripts gh-pages
npm install --save-exact lucide-react@1.27.0
npm install --save-dev --save-exact vite@8.1.5 @vitejs/plugin-react@6.0.4 typescript@6.0.3 @types/node@24.13.3 vitest@4.1.10 jsdom@29.1.1 @testing-library/react@16.3.2 @testing-library/dom@10.4.1 @testing-library/user-event@14.6.1 @testing-library/jest-dom@7.0.0 eslint@9.39.5 @eslint/js@9.39.5 typescript-eslint@8.65.0 eslint-plugin-react-hooks@7.1.1 eslint-plugin-react-refresh@0.5.3 eslint-plugin-jsx-a11y@6.10.2 globals@17.7.0
```

Removing CRA before TypeScript 6 avoids CRA's obsolete TypeScript peer range;
removing `gh-pages` drops the unused branch publisher now replaced by the
first-party Pages workflow. Every legacy UI/content component remains
available to Vite. Expected: `package-lock.json` is regenerated by npm 11.3.0
without `--force` or `--legacy-peer-deps`.

- [ ] **Step 4: Replace CRA scripts with deterministic scripts**

Set the `scripts` object to:

```json
{
  "dev": "vite",
  "start": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint . --max-warnings=0",
  "test": "npm run test:unit",
  "test:unit": "vitest run",
  "test:watch": "vitest",
  "verify:legacy": "node scripts/verify-legacy-hashes.mjs",
  "check": "npm run verify:legacy && npm run lint && npm run test && npm run build"
}
```

Keep `sass` and all packages imported by the legacy components until Task 12.
Later tasks add scripts only when their backing files exist.

- [ ] **Step 5: Add Vite, TypeScript, Vitest, and ESLint configuration**

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/umesh-gangadharaiah/",
  plugins: [react()],
  build: { outDir: "dist" },
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      clearMocks: true,
      restoreMocks: true,
      css: true,
    },
  }),
);
```

Use project references in `tsconfig.json`. Set `target: "ES2022"`,
`moduleResolution: "Bundler"`, `jsx: "react-jsx"`, `strict: true`,
`noEmit: true`, and the Vitest/jest-dom types in `tsconfig.app.json`.
Scope `tsconfig.node.json` to Vite, Vitest, Playwright, ESLint, and scripts.

Create a flat `eslint.config.mjs` from `@eslint/js`,
`typescript-eslint`, `react-hooks`, `react-refresh`, and
`jsx-a11y`; lint `src/**/*.{ts,tsx}`, config files, and scripts while
ignoring `dist`, `coverage`, and `node_modules`.

The baseline config may temporarily exclude only this named migration set:
`Navigation.tsx`, `Main.tsx`, `Expertise.tsx`, `Timeline.tsx`, `Project.tsx`,
`Recognition.tsx`, `RecognitionModel.tsx`, `Contact.tsx`, `FadeIn.tsx`, the old
`Footer.tsx`, and `components/index.js`. Store the exact paths in a visibly
named `legacyMigrationFiles` constant with a removal comment pointing to Task
12. Do not weaken rules for new files. Task 5 removes `Footer.tsx` from the
list when it is replaced, and Task 12 deletes the remaining files and the
entire exception constant before the final lint gate.

- [ ] **Step 6: Replace the CRA entry without changing the rendered page**

Create root `index.html` with `<div id="root"></div>` and
`<script type="module" src="/src/main.tsx"></script>`. Create
`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root application mount");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `src/vite-env.d.ts` with
`/// <reference types="vite/client" />`. Delete the superseded CRA entry
files only after Vite renders the current app.

- [ ] **Step 7: Replace the stale CRA test and verify the new harness**

Replace `src/App.test.tsx` with a smoke test that renders `App` and
asserts the existing `Umesh`, `Career`, `Projects`, and `Contact Me`
text. Run:

```bash
npm run test:unit -- src/App.test.tsx
npm run lint
npm run build
```

Expected: each command exits 0 and `dist/index.html` exists.

- [ ] **Step 8: Commit the toolchain migration**

```bash
git add .nvmrc package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts vitest.config.ts eslint.config.mjs index.html src/main.tsx src/vite-env.d.ts src/test/setup.ts src/App.test.tsx public/index.html src/index.tsx src/react-app-env.d.ts src/setupTests.ts src/reportWebVitals.ts
git commit -m "$(cat <<'EOF'
Migrate portfolio build to Vite

Replace the deprecated CRA shell with a pinned Vite, TypeScript,
Vitest, and ESLint baseline while preserving the current rendered
portfolio for the content migration.
EOF
)"
```

## Task 2: Lock Legacy Content Before Moving It

**Files:**
- Create: `scripts/verify-legacy-hashes.mjs`
- Create: `tests/fixtures/legacy-content.sha256`

- [ ] **Step 1: Write the failing hash-verification script**

Create a script that reads each line of
`tests/fixtures/legacy-content.sha256`, calculates SHA-256 with
`node:crypto`, and exits non-zero for a missing file or mismatch.
Before the fixture exists, run:

```bash
npm run verify:legacy
```

Expected: FAIL because the fixture is absent.

- [ ] **Step 2: Add the exact approved legacy hashes**

Write the six hash lines from **Legacy Content Hashes** to
`tests/fixtures/legacy-content.sha256`. The script must print:

```text
Verified 6 legacy content sources.
```

- [ ] **Step 3: Run the gate**

```bash
npm run verify:legacy
```

Expected: PASS with the exact six-file message.

- [ ] **Step 4: Commit the preservation gate**

```bash
git add scripts/verify-legacy-hashes.mjs tests/fixtures/legacy-content.sha256 package.json
git commit -m "$(cat <<'EOF'
Guard legacy portfolio content hashes

Record the active source files before migration so content changes
cannot be confused with structural extraction or cleanup.
EOF
)"
```

## Task 3: Centralize the Complete Typed Content Model

**Files:**
- Create: `src/content/models.ts`, `src/content/profile.ts`,
  `src/content/impact.ts`, `src/content/expertise.ts`,
  `src/content/projects.ts`, `src/content/career.ts`,
  `src/content/recognitions.ts`
- Test: `src/content/contentIntegrity.test.ts`

- [ ] **Step 1: Write the failing integrity test**

The test imports all seven modules and asserts:

```ts
expect(projects.map(({ id }) => id)).toEqual([
  "nd-alphax",
  "ndo-search-explore",
  "nexus-dashboard-unified-backup-restore",
  "ndo-l4l7-service-chaining",
  "aci-advanced-pbr",
  "codeshift-cicd-platform",
  "resource-allocation-manager",
  "kollect-curi-knowledge-bot",
  "ucs-config-tool",
  "dementia-detection-ieee",
  "flikrify",
  "telegram-data-storage",
]);

expect(recognitions.map(({ id }) => id)).toEqual([
  "priyanka-181224", "damo-211224", "srid-181024", "alfan-141124",
  "rohi-171024", "atul-180724", "rohi-110624", "srid-010424",
  "rohi-100324", "maru-181023", "moulie-120723", "ara-290923",
  "rohi-270923", "mou-120723", "pal-050723", "ara-020723",
  "rohi-030523", "pra-080323", "rohi-240123", "ash-290922",
  "ana-230922", "pra-140622", "mad-260522", "mad-230422",
  "yogi-070422",
]);

expect(career.map(({ id }) => id)).toEqual([
  "cisco-software-engineer-iii",
  "cisco-software-engineer-ii",
  "cisco-staff-engineer-intern",
  "cisco-intern",
]);
```

Also assert project count 12, recognition count 25, category counts
`Innovation: 14`, `Mentorship: 5`, `Leadership: 6`, four expertise
IDs, four exact metrics, unique IDs, no `publicUrl === "#"`, and the exact
featured/highlight order.

Run:

```bash
npm run test:unit -- src/content/contentIntegrity.test.ts
```

Expected: FAIL because the content modules do not exist.

- [ ] **Step 2: Define the domain contracts**

Create `src/content/models.ts`:

```ts
export type RecognitionCategory = "Innovation" | "Mentorship" | "Leadership";

export type LocalImageAsset = {
  kind: "local";
  alt: string;
  fallbackSrc: string;
  sources: readonly { src: string; width: number; type: "image/webp" }[];
  width: number;
  height: number;
};

export type RemoteImageAsset = {
  kind: "remote";
  alt: string;
  src: string;
  width: number;
  height: number;
};

export type ImageAsset = LocalImageAsset | RemoteImageAsset;

export type Project = {
  id: string;
  title: string;
  description: string;
  image: ImageAsset;
  publicUrl?: string;
  featuredOrder?: 1 | 2 | 3 | 4;
};

export type Recognition = {
  id: string;
  title: string;
  description: string;
  tags: readonly string[];
  category: RecognitionCategory;
  image: LocalImageAsset;
  highlightOrder?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type CareerEntry = {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  summary?: string;
  technologies: readonly string[];
  highlights: readonly string[];
};
```

Add focused `Profile`, `ImpactMetric`, and `ExpertiseArea` contracts in
the same file because they are all portfolio-content boundaries.

- [ ] **Step 3: Migrate profile, impact, expertise, and career**

- `profile.ts`: preserve the existing name, role, specialization, portrait,
  GitHub, LinkedIn, canonical URL, `#projects`, and `#contact`.
- `impact.ts`: use the exact values and order:
  `50,000+`, `Sub-second`, `300+ hours`, `70%`.
- `expertise.ts`: use IDs `backend-systems`, `generative-ai`,
  `devops-automation`, and `engineering-tools`; copy descriptions,
  labels, and both publication URLs exactly from
  `src/components/Expertise.tsx:9-102`.
- `career.ts`: copy only the four rendered records from
  `src/components/Timeline.tsx:47-117`; do not migrate unused arrays.

Use `as const satisfies readonly <Type>[]` on every exported array.
For local images, initially store the current base-relative fallback file and
an empty `sources` array. Never embed `/umesh-gangadharaiah/` in typed content;
Task 10 replaces these transitional references with imported optimized assets.

- [ ] **Step 4: Migrate all 12 projects without changing their descriptions**

Copy `src/components/Project.tsx:46-119` into `projects.ts` in source
order. Assign featured order 1–4 to:

1. `ndo-search-explore`
2. `nexus-dashboard-unified-backup-restore`
3. `ndo-l4l7-service-chaining`
4. `resource-allocation-manager`

Only `telegram-data-storage` receives a verified `publicUrl`. Treat the
seven hash destinations, mismatched IEEE URL, broken Flikrify URL, and image
binary URLs as absent project destinations. Preserve the two Cisco image URLs
as remote image sources for L4-L7 and Advanced PBR.

- [ ] **Step 5: Migrate all 25 active recognition records**

Copy `public/assets/json/mentorandteam.json` in exact order into
`recognitions.ts`. Use image stems as IDs. Assign highlight order:

```text
1 pal-050723
2 yogi-070422
3 priyanka-181224
4 pra-080323
5 rohi-171024
6 ara-290923
```

Preserve descriptions, category strings, tag arrays, and the combined
`moulie-120723` tag exactly. Do not perform grammar edits in this structural
commit. Recognition images follow the same transitional fallback/empty-source
rule until Task 10.

- [ ] **Step 6: Run content parity and legacy hash gates**

```bash
npm run verify:legacy
npm run test:unit -- src/content/contentIntegrity.test.ts
```

Expected: both pass; the test reports 12 projects, 25 recognitions, four
career records, four expertise areas, and four metrics.

- [ ] **Step 7: Commit the typed content**

```bash
git add src/content
git commit -m "$(cat <<'EOF'
Centralize typed portfolio content

Move every active profile, expertise, project, career, metric, and
recognition record into immutable build-time modules with exact parity
tests before changing presentation.
EOF
)"
```

- [ ] **Step 8: Apply the approved editorial cleanup as an isolated commit**

First add `editorialCorrections.test.ts` and make it fail on the unedited typed
content. Lock the correction allowlist to these presentation-only fields:

- Standardize tool labels: `Sonar Cube` → `SonarQube`, `VsCode` → `VS Code`,
  `PostMan` → `Postman`, and `PProf` → `pprof`.
- Correct the expertise phrases `emphasizes on maintaining` →
  `emphasizes maintaining`, `skillset` → `skill set`, and
  `curiosity driven` → `curiosity-driven`; repair punctuation around the
  examples without changing technologies or claims.
- Correct the `nd-alphax` phrase `Part of Desigin team` →
  `Part of the design team` and `datacenter` → `data center`.
- Normalize the four career date displays to `Aug 2024 – Present`,
  `Aug 2022 – Jul 2024`, `Aug 2021 – Jul 2022`, and
  `Jan 2021 – Jul 2021`; do not change the underlying month/year facts.
- Correct only recognition titles: both `Thanks you` prefixes → `Thank you`,
  `Congratulations for winning` → `Congratulations on winning`, and each
  `Innovation : Internal Tool` → `Innovation: Internal Tool`.

Assert every recognition quotation body, tag, category, image ID, numeric
claim, publication URL, and project achievement paragraph outside the explicit
`nd-alphax` correction remains unchanged. Run:

```bash
npm run verify:legacy
npm run test:unit -- src/content/contentIntegrity.test.ts src/content/editorialCorrections.test.ts
git add src/content
git commit -m "$(cat <<'EOF'
Polish portfolio copy without changing facts

Correct the approved spelling, grammar, capitalization, and date
presentation while preserving every quoted recognition, metric, link,
identifier, and underlying career or project fact.
EOF
)"
```

## Task 4: Add Deterministic Text Preview and Project Search Behavior

**Files:**
- Create: `src/content/createWordBoundaryPreview.ts`,
  `src/content/createWordBoundaryPreview.test.ts`,
  `src/projects/filterProjects.ts`,
  `src/projects/filterProjects.test.ts`

- [ ] **Step 1: Write failing preview cases**

Cover empty text, non-positive limits, text exactly at a limit, text over the
180- and 400-character limits, multiple spaces, a long final word, and one
unbroken token longer than the limit. Assert normal shortened output ends at a
complete-word boundary, remains a source prefix, and adds no authored summary.
For the impossible no-boundary token case, assert a deterministic hard cut at
the limit; the active portfolio descriptions all contain spaces.

- [ ] **Step 2: Run the focused tests**

```bash
npm run test:unit -- src/content/createWordBoundaryPreview.test.ts src/projects/filterProjects.test.ts
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement the preview rule**

```ts
export function createWordBoundaryPreview(text: string, limit = 180): string {
  if (limit < 1) return "";
  const normalized = text.trim();
  if (normalized.length <= limit) return normalized;
  const candidate = normalized.slice(0, limit + 1);
  const boundary = Array.from(candidate.matchAll(/\s+/g)).at(-1)?.index ?? -1;
  return boundary > 0
    ? candidate.slice(0, boundary).trimEnd()
    : normalized.slice(0, limit);
}
```

- [ ] **Step 4: Implement stable source-order search**

```ts
import type { Project } from "../content/models";

export function filterProjects(
  projects: readonly Project[],
  query: string,
): readonly Project[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return projects;
  return projects.filter((project) =>
    (project.title + " " + project.description)
      .toLocaleLowerCase()
      .includes(normalized),
  );
}
```

- [ ] **Step 5: Run and commit**

```bash
npm run test:unit -- src/content/createWordBoundaryPreview.test.ts src/projects
git add src/content/createWordBoundaryPreview.ts src/content/createWordBoundaryPreview.test.ts src/projects
git commit -m "$(cat <<'EOF'
Add deterministic project discovery rules

Define reusable word-boundary excerpts and stable project-search behavior
before wiring disclosure into the interface.
EOF
)"
```

Expected: focused tests exit 0.

## Task 5: Build the Semantic Shell, Theme, Hero, and Impact Summary

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`, `index.html`,
  `src/components/Footer.tsx`
- Create: `src/theme/theme.ts`, `src/theme/theme.test.ts`,
  `src/styles/tokens.css`, `src/styles/global.css`,
  `src/components/Header.tsx`, `src/components/Header.module.css`,
  `src/components/Header.test.tsx`, `src/components/Hero.tsx`,
  `src/components/Hero.module.css`, `src/components/SocialLinks.tsx`,
  `src/components/ImpactSummary.tsx`,
  `src/components/ImpactSummary.module.css`,
  `src/components/ResponsivePortfolioImage.tsx`,
  `src/components/ResponsivePortfolioImage.module.css`,
  `src/components/Footer.module.css`

- [ ] **Step 1: Write failing semantic and theme tests**

Assert the new hero contains an `h1` named `Umesh Gangadharaiah`, plus
`header`, `nav`, `main`, and `footer`; five section anchors; a named 44×44
theme button; stored theme over system theme over dark fallback; Escape closes
the mobile menu and restores focus. Do not assert a single page-level `h1`
until the legacy sections are removed in Task 12.

Run:

```bash
npm run test:unit -- src/theme/theme.test.ts src/components/Header.test.tsx src/App.test.tsx
```

Expected: FAIL because the new shell does not exist.

- [ ] **Step 2: Implement the theme contract**

```ts
export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "portfolio-theme";

export function resolveInitialTheme(
  stored: string | null,
  prefersLight: boolean,
): Theme {
  if (stored === "dark" || stored === "light") return stored;
  return prefersLight ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
```

Add an inline head script in `index.html` that catches storage failures,
reads the same key, applies stored → system → dark before React mounts, and
never logs visitor data.

- [ ] **Step 3: Implement the header and navigation**

Use a skip link, sticky header, real anchor links, a 44×44 menu button, a
44×44 theme button, `aria-expanded`, `aria-controls`, Escape handling,
focus return, and destination-heading focus after mobile selection. Apply
`scroll-margin-top` in CSS; do not perform JavaScript scroll offsets.

- [ ] **Step 4: Implement hero, image wrapper, social links, impact, and footer**

Render only typed content. Use named GitHub/LinkedIn links with
`target="_blank"` and `rel="noopener noreferrer"`. Render the four impact
metrics in exact order and preserve the existing footer statement as plain
text without the broken attribution link. Add a basic
`ResponsivePortfolioImage` that renders local or remote typed image records,
accepts an empty local `sources` array, uses the fallback image, and exposes
explicit dimensions and eager/lazy loading. Task 10 adds generated sources and
the stable error fallback.
Remove `src/components/Footer.tsx` from `legacyMigrationFiles` as part of this
replacement; the new footer must pass the normal lint rules.

- [ ] **Step 5: Compose the semantic App shell**

`App` imports components directly, owns no records, and renders:

```tsx
<>
  <Header />
  <main id="main-content">
    <Hero />
    <ImpactSummary />
    <Expertise />
    <Timeline />
    <Project />
    <Recognition />
    <Contact />
  </main>
  <Footer />
</>
```

This intermediate composition deliberately keeps the five legacy content
sections and their styles mounted so Task 5 does not drop content. Tasks 6–9
replace each legacy section in place; Task 12 removes the superseded files.

- [ ] **Step 6: Run and commit**

```bash
npm run test:unit -- src/theme src/components/Header.test.tsx src/App.test.tsx
npm run lint
npm run build
git add index.html src/App.tsx src/App.test.tsx src/theme src/styles src/components/Header.tsx src/components/Header.module.css src/components/Hero.tsx src/components/Hero.module.css src/components/SocialLinks.tsx src/components/ImpactSummary.tsx src/components/ImpactSummary.module.css src/components/ResponsivePortfolioImage.tsx src/components/ResponsivePortfolioImage.module.css src/components/Footer.tsx src/components/Footer.module.css
git commit -m "$(cat <<'EOF'
Build accessible portfolio shell

Introduce semantic landmarks, recruiter-first identity and impact
content, named social links, and a pre-rendered accessible theme and
navigation experience.
EOF
)"
```

Expected: focused tests, lint, and build exit 0.

## Task 6: Rebuild Expertise and Career as Semantic Sections

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ExpertiseSection.tsx`,
  `src/components/ExpertiseSection.module.css`,
  `src/components/CareerTimeline.tsx`,
  `src/components/CareerTimeline.module.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Add failing section tests**

Assert all four expertise headings and both publication links render; career
renders a semantic ordered list with all four IDs, exact periods, Cisco
Systems, and the `300+ hours` claim.

- [ ] **Step 2: Implement expertise from typed content**

Use article cards with one section heading, nested card headings, paragraphs,
plain chips, and named publication links. Do not duplicate items solely for
mobile layout.

- [ ] **Step 3: Implement the career timeline**

Use `<ol>` and `<li>`; render role, organization, location, period,
technologies, summary, and highlights. Do not use the vertical-timeline
package or decorative icon semantics.

- [ ] **Step 4: Add both sections to App and verify**

```bash
npm run test:unit -- src/App.test.tsx
npm run lint
```

Expected: PASS with four expertise groups and four career records.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/components/ExpertiseSection.tsx src/components/ExpertiseSection.module.css src/components/CareerTimeline.tsx src/components/CareerTimeline.module.css
git commit -m "$(cat <<'EOF'
Rebuild expertise and career sections

Render every existing expertise and career record through semantic,
responsive content without template-specific timeline dependencies.
EOF
)"
```

## Task 7: Build the Searchable Project Explorer

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ProjectExplorer.tsx`,
  `src/components/ProjectExplorer.module.css`,
  `src/components/ProjectCard.tsx`,
  `src/components/ProjectCard.module.css`
- Test: `src/components/ProjectExplorer.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Assert four featured cards initially; `View all 12 projects` exposes all 12
in source order; search filters without re-ranking; collapse clears search;
cards without `publicUrl` contain no link; Telegram has one safe external
link; each card exposes full copy with a button using `aria-expanded` and
`aria-controls`.

- [ ] **Step 2: Run the tests and confirm failure**

```bash
npm run test:unit -- src/components/ProjectExplorer.test.tsx
```

Expected: FAIL because the explorer is missing.

- [ ] **Step 3: Implement ProjectCard**

Render responsive image, title, a deterministic 180-character excerpt from
`createWordBoundaryPreview`, explicit
`Read Project Details` disclosure, and optional public destination. Never
wrap the whole card in an anchor and never use hover as the disclosure
mechanism.

- [ ] **Step 4: Implement ProjectExplorer**

Own:

```ts
type ProjectExplorerState = {
  archiveOpen: boolean;
  query: string;
  expandedIds: ReadonlySet<string>;
};
```

Initial data is the four records sorted by `featuredOrder`. Archive mode uses
all 12 source-order records and `filterProjects`. Show result count as
ordinary text. Before hiding focused archive content, focus the collapse
button.

- [ ] **Step 5: Add the section to App, verify, and commit**

```bash
npm run test:unit -- src/projects src/components/ProjectExplorer.test.tsx
npm run lint
npm run build
git add src/App.tsx src/components/ProjectExplorer.tsx src/components/ProjectExplorer.module.css src/components/ProjectExplorer.test.tsx src/components/ProjectCard.tsx src/components/ProjectCard.module.css
git commit -m "$(cat <<'EOF'
Add searchable project disclosure

Lead with four approved projects while keeping all twelve records
searchable, source ordered, fully readable, and honest about missing
public destinations.
EOF
)"
```

Expected: focused tests, lint, and build exit 0.

## Task 8: Replace Recognition Autoplay with Filtered Disclosure

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/RecognitionGallery.tsx`,
  `src/components/RecognitionGallery.module.css`,
  `src/components/RecognitionCard.tsx`,
  `src/components/RecognitionCard.module.css`
- Test: `src/components/RecognitionGallery.test.tsx`

- [ ] **Step 1: Write failing recognition tests**

Assert six highlights in approved order; `View all 25 recognitions` exposes
the archive; category counts are 14/5/6; filters preserve source order and use
`aria-pressed`; full copy expands inline; no timer, carousel, autoplay, or
modal role exists.

- [ ] **Step 2: Confirm the test fails**

```bash
npm run test:unit -- src/components/RecognitionGallery.test.tsx
```

Expected: FAIL because the gallery is missing.

- [ ] **Step 3: Implement the gallery and cards**

Use state:

```ts
type RecognitionFilter = "all" | "Innovation" | "Mentorship" | "Leadership";
type RecognitionState = {
  archiveOpen: boolean;
  filter: RecognitionFilter;
  expandedIds: ReadonlySet<string>;
};
```

Use six `highlightOrder` records initially. Archive mode shows filters and
all matching source-order records. Use `createWordBoundaryPreview` with a
400-character limit, `Read Full Recognition` buttons, and inline details. Move
focus before hiding focused content.

- [ ] **Step 4: Add the section, verify, and commit**

```bash
npm run test:unit -- src/content/contentIntegrity.test.ts src/components/RecognitionGallery.test.tsx
npm run lint
npm run build
git add src/App.tsx src/components/RecognitionGallery.tsx src/components/RecognitionGallery.module.css src/components/RecognitionGallery.test.tsx src/components/RecognitionCard.tsx src/components/RecognitionCard.module.css
git commit -m "$(cat <<'EOF'
Add filtered recognition disclosure

Replace forced autoplay with six approved highlights and a complete,
category-filtered archive that preserves all twenty-five records.
EOF
)"
```

## Task 9: Make Contact Submission Recoverable

**Files:**
- Modify: `src/App.tsx`
- Create: `src/contact/emailjsConfig.ts`,
  `src/contact/sendContactMessage.ts`,
  `src/components/ContactForm.tsx`,
  `src/components/ContactForm.module.css`
- Test: `src/components/ContactForm.test.tsx`

- [ ] **Step 1: Write failing form-state tests**

Cover trimmed required fields, first-invalid focus, unique IDs, one provider
call after a double submit, disabled sending state, success clear, failure
retention, retry label, and polite status announcements.

- [ ] **Step 2: Confirm failure**

```bash
npm run test:unit -- src/components/ContactForm.test.tsx
```

Expected: FAIL because the form does not exist.

- [ ] **Step 3: Isolate the provider**

Move the existing public EmailJS client identifiers verbatim from
`src/components/Contact.tsx:30` into `emailjsConfig.ts`. Implement
`sendContactMessage` with `emailjs.send`; accept
`{ name, contact, message }`; map `contact` to the existing template's
`email` field; return a promise; log neither payload nor provider response.

- [ ] **Step 4: Implement the explicit form states**

```ts
type FieldErrors = Partial<Record<"name" | "contact" | "message", string>>;
type ContactStatus =
  | { kind: "idle" }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "failure" };
```

Trim and require all fields, focus the first invalid input, guard duplicate
submits, clear only after confirmed success, retain all values after failure,
and announce sending/success/failure in one polite live region.

- [ ] **Step 5: Add the section, verify, and commit**

```bash
npm run test:unit -- src/components/ContactForm.test.tsx
npm run lint
git add src/App.tsx src/contact src/components/ContactForm.tsx src/components/ContactForm.module.css src/components/ContactForm.test.tsx
git commit -m "$(cat <<'EOF'
Make contact submission recoverable

Preserve the existing EmailJS behavior while adding accessible
validation, duplicate-submit protection, visible status, and retained
input after provider failure.
EOF
)"
```

## Task 10: Optimize Active Images and Add Stable Fallbacks

**Files:**
- Modify: `package.json`, `package-lock.json`, content image references
- Create: `scripts/optimize-images.mjs`, `scripts/verify-assets.mjs`
- Create: `tests/fixtures/active-assets.json`
- Create: `src/assets/portfolio/portrait/**`,
  `src/assets/portfolio/projects/**`,
  `src/assets/portfolio/recognitions/**`
- Modify: `src/components/ResponsivePortfolioImage.tsx`,
  `src/components/ResponsivePortfolioImage.module.css`

- [ ] **Step 1: Install and pin Sharp**

```bash
npm install --save-dev --save-exact sharp@0.35.3
```

- [ ] **Step 2: Write the failing asset verifier**

Assert:

- 1 portrait, 10 local project originals, and 25 recognition originals.
- Exactly two remote project image records.
- Every local original and WebP variant exists.
- WebP widths match portrait 320/640, projects 640/960, and recognition
  480/960 without enlargement.
- No active local asset contains a hard-coded repository base path.

Before copying anything, create `tests/fixtures/active-assets.json` from the
exact source/target map in the design. Each of its 36 records contains record
ID, historical source path, fallback target path, source SHA-256, intrinsic
width/height, and expected WebP paths/widths. Add a `--source` verifier mode
that checks the fixture against the still-present legacy originals and exits 0.
The default mode checks the copied fallback bytes against those same hashes and
checks the generated variants. It must not require legacy source paths after
Task 12 deletes them.

Add these package scripts before running the failing gate:

```json
{
  "verify:assets": "node scripts/verify-assets.mjs",
  "check": "npm run verify:legacy && npm run lint && npm run test && npm run verify:assets && npm run build"
}
```

Run `node scripts/verify-assets.mjs --source`; expect PASS for all 36 source
hashes. Then run `npm run verify:assets`; expect FAIL before target copies and
variants exist.

- [ ] **Step 3: Implement deterministic optimization**

In `optimize-images.mjs`, read the locked fixture, copy every fallback original
byte-for-byte with `fs.copyFile`, and use:

```js
await sharp(source)
  .rotate()
  .resize({ width, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(target);
```

for each WebP target. Strip metadata through the Sharp pipeline. Commit
generated variants; do not run optimization during every production build.

- [ ] **Step 4: Copy active originals and generate variants**

Use the exact asset map in the design:

- portrait → `src/assets/portfolio/portrait/`
- 10 local projects → `src/assets/portfolio/projects/`
- 25 active recognitions → `src/assets/portfolio/recognitions/`

Use local `search-and-explore.jpg`; retain remote image records only for
L4-L7 and Advanced PBR.

- [ ] **Step 5: Enhance ResponsivePortfolioImage**

Extend the Task 5 wrapper to render `<picture>` for the generated local WebP
sources and fallback originals. Preserve explicit dimensions and
`loading="eager"` only for the portrait, lazy-load below-fold images, and
replace a failed image with a stable text fallback containing the existing alt
text.

- [ ] **Step 6: Update content references and verify**

```bash
node scripts/optimize-images.mjs
node scripts/verify-assets.mjs --source
npm run verify:assets
npm run test
npm run build
```

Expected: asset verifier reports 36 local originals and two remote images;
all commands exit 0.

- [ ] **Step 7: Commit generated assets separately**

```bash
git add package.json package-lock.json scripts/optimize-images.mjs scripts/verify-assets.mjs tests/fixtures/active-assets.json src/assets/portfolio src/content src/components/ResponsivePortfolioImage.tsx src/components/ResponsivePortfolioImage.module.css
git commit -m "$(cat <<'EOF'
Optimize active portfolio imagery

Add deterministic WebP variants, explicit dimensions, lazy loading,
and stable fallbacks for every active portrait, project, and
recognition image.
EOF
)"
```

## Task 11: Apply the Responsive Visual System and Browser Gates

**Files:**
- Modify: all new CSS files
- Create: `playwright.config.ts`, `e2e/portfolio.spec.ts`,
  `e2e/accessibility.spec.ts`
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install exact browser-test dependencies**

```bash
npm install --save-dev --save-exact @playwright/test@1.61.1 @axe-core/playwright@4.12.1
npx playwright install chromium
```

Add:

```json
{
  "test": "npm run test:unit && npm run test:e2e",
  "test:e2e": "playwright test"
}
```

Configure `playwright.config.ts` with `e2e` as `testDir`, the four approved
viewport projects, and a Vite preview web server. The server command is
`npm run build && npm run preview -- --host 127.0.0.1`; its readiness URL and
Playwright `baseURL` are
`http://127.0.0.1:4173/umesh-gangadharaiah/`. Reuse an existing server only
outside CI, capture traces on first retry, and never test against the live site
from the deterministic suite.

- [ ] **Step 2: Write failing viewport and accessibility tests**

Use 390×844, 768×1024, 1440×900, and 1920×1080 projects. Assert no
horizontal overflow, correct mobile/desktop navigation, 44-pixel interactive
targets, usable project/recognition disclosure, theme switching, reduced
motion, and no serious/critical Axe violations.

- [ ] **Step 3: Implement the shared tokens**

```css
:root {
  --content-max: 72rem;
  --header-height: 4rem;
  --page-gutter: clamp(1rem, 4vw, 3rem);
  --section-space: clamp(3.5rem, 8vw, 7rem);
  --focus-ring: 0 0 0 0.1875rem var(--color-focus);
}

.page-shell {
  width: min(calc(100% - 2 * var(--page-gutter)), var(--content-max));
  margin-inline: auto;
}

section[id] {
  scroll-margin-top: calc(var(--header-height) + 1rem);
}
```

Define dark navy/charcoal and warm off-white tokens with violet accent,
WCAG-AA text/control contrast, visible `:focus-visible`, system-first
typography, and `color-scheme`.

- [ ] **Step 4: Implement responsive component styles**

Default to one column. At 48rem use two-column contact and featured-project
grids. At 64rem use the two-column hero and three-column recognition grid.
Use auto-fit card grids, no fixed card height, project `aspect-ratio: 16 / 10`,
recognition `aspect-ratio: 4 / 3`, `min-width: 0`,
`overflow-wrap: anywhere`, and a reduced-motion media query.

- [ ] **Step 5: Run browser and unit gates**

```bash
npm run test
npm run lint
npm run build
```

Expected: all four viewports and Axe checks pass.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json playwright.config.ts e2e src/styles src/components
git commit -m "$(cat <<'EOF'
Apply responsive accessible visual system

Deliver the approved dark and light presentation across phone, tablet,
laptop, and wide layouts with keyboard, reduced-motion, reflow, and
automated accessibility gates.
EOF
)"
```

## Task 12: Upgrade React and Remove the Legacy Runtime

**Files:**
- Modify: `package.json`, `package-lock.json`
- Delete: legacy components, SCSS, JSON, dormant assets, CRA metadata listed
  in the design

- [ ] **Step 1: Prove the new component tree no longer imports legacy packages**

```bash
rg -n "@mui|@emotion|fontawesome|embla|vertical-timeline|bootstrap|react-scripts|from ['\"]emailjs['\"]|\\.scss" src
```

Expected: no matches in active source. If a match exists, replace that
consumer before continuing.

Also remove the `legacyMigrationFiles` constant and its ignore spread from
`eslint.config.mjs`, then run `rg -n "legacyMigrationFiles" eslint.config.mjs`
and require no matches. No legacy lint exclusion survives the migration.

- [ ] **Step 2: Upgrade React and exact matching types**

```bash
npm install --save-exact react@19.2.8 react-dom@19.2.8
npm install --save-dev --save-exact @types/react@19.2.17 @types/react-dom@19.2.3
```

- [ ] **Step 3: Remove obsolete packages**

Remove any remaining CRA-only packages, MUI/Emotion, Font Awesome, Bootstrap,
Embla, vertical timeline,
duplicate `emailjs`, web-vitals, Jest types, carousel/timeline type packages,
and Sass. Retain `@emailjs/browser`, React, Lucide,
Vite/test tooling, and Sharp. First-party Pages Actions replace the
branch-publishing package in Task 14.

- [ ] **Step 4: Prove parity, then delete superseded runtime files**

Before deletion, run `npm run verify:legacy` and
`npm run test:unit -- src/content/contentIntegrity.test.ts`; both must pass.
Then delete the legacy components/styles, dormant JSON, unused mock images,
background rasters, archive ZIP, stale recognition duplicates, Netlify
`_redirects`, and generic CRA manifest/icons listed in the design. Keep all
new typed content, the historical hash script/fixture, and active optimized
assets.

- [ ] **Step 5: Switch the permanent gate to typed-content integrity**

Remove `verify:legacy` from package scripts after the source files it checks
are intentionally deleted. Add:

```json
{
  "verify:content": "vitest run src/content/contentIntegrity.test.ts",
  "check": "npm run verify:content && npm run lint && npm run test && npm run verify:assets && npm run build"
}
```

Update `src/App.test.tsx` and the browser suite to assert exactly one page-level
`h1`, all five final section anchors, and representative records from all
preserved datasets. The hash fixture remains an immutable migration audit, but
is never treated as a post-deletion runtime gate.

- [ ] **Step 6: Run the full local gate**

```bash
npm ci
npm run verify:content
npm run check
```

Expected: all commands exit 0 under React 19.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Remove obsolete portfolio runtime

Upgrade to React 19 after the semantic replacement is verified, then
remove CRA, template components, dormant assets, and dependencies that
the modern portfolio no longer executes.
EOF
)"
```

## Task 13: Add Search, Structured Data, and the Social Preview

**Files:**
- Modify: `index.html`, `public/robots.txt`, `package.json`
- Create: `public/site.webmanifest`, `public/icons/**`,
  `public/assets/social/umesh-gangadharaiah-social-card.png`,
  `scripts/verify-dist.mjs`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing distribution verifier**

Parse `dist/index.html` and assert exact title, description, canonical URL,
`og:type`, Open Graph title/description/URL/image, X
`summary_large_image`, valid Person JSON-LD, root mount, manifest, and social
card. Assert the social card is exactly 1200×630 and all referenced local files
exist.

Add the verifier script and make it part of every production build:

```json
{
  "build": "tsc -b && vite build && npm run verify:dist",
  "verify:dist": "node scripts/verify-dist.mjs"
}
```

Run `npm run verify:dist`; expect FAIL until metadata is complete.

- [ ] **Step 2: Add exact static metadata**

Use:

```text
Title: Umesh Gangadharaiah | Backend Engineer
Description: Portfolio of Umesh Gangadharaiah, a backend engineer focused on distributed systems and infrastructure.
Canonical: https://umeshmg27.github.io/umesh-gangadharaiah/
Open Graph type: website
X card: summary_large_image
```

Add Person JSON-LD with only name, job title, canonical URL, GitHub, and
LinkedIn. Replace the generic manifest with portfolio-specific name, short
name, scope, start URL, and theme colors.

- [ ] **Step 3: Generate exactly one cohesive social card**

Before generation, invoke the imagegen skill and inspect the portrait. Use this
exact prompt with the portrait as the referenced image:

```text
Create a finished 1200×630 social link preview for Umesh Gangadharaiah's
portfolio. Use the supplied portrait faithfully. Match a restrained dark
navy and violet technical-editorial website. Include only this exact text:
"Umesh Gangadharaiah", "Backend Engineer", and
"Distributed Systems & Infrastructure". Make all text highly legible in
LinkedIn, Slack, iMessage, and X unfurls. Do not add logos, employers,
awards, metrics, or any other words.
```

Inspect the result for exact text and portrait fidelity. Retry once only if
the card is unusable; otherwise save it to the approved public path.

- [ ] **Step 4: Create icons and verify**

Derive the portfolio icons from the approved portrait/initial treatment
without inventing extra branding. Run:

```bash
npm run build
npm run verify:dist
```

Expected: metadata and asset assertions pass without executing React.

- [ ] **Step 5: Commit**

```bash
git add index.html public scripts/verify-dist.mjs package.json
git commit -m "$(cat <<'EOF'
Add portfolio search and sharing metadata

Ship canonical, structured, Open Graph, X, manifest, icon, and social
preview assets directly in the static HTML for reliable discovery and
link unfurls.
EOF
)"
```

## Task 14: Add Main-Only Pages Deployment and External Audits

**Files:**
- Create: `scripts/audit-external-links.mjs`,
  `scripts/smoke-pages.mjs`, `scripts/smoke-pages.test.ts`,
  `.github/workflows/ci.yml`,
  `.github/workflows/deploy-pages.yml`
- Modify: `package.json`

- [ ] **Step 1: Implement the best-effort external audit**

Check GitHub, LinkedIn, both publication URLs, Telegram, and the two remote
Cisco images with bounded timeouts. Report status and redirects, redact
response bodies, and exit 0 so transient third-party failures do not make the
deterministic build fail. Add:

```json
{
  "audit:external": "node scripts/audit-external-links.mjs"
}
```

- [ ] **Step 2: Implement the published-site smoke script**

Retry the canonical URL for up to ten minutes. Assert title, canonical and
Open Graph tags, root mount, one hashed JavaScript bundle, one local image,
and successful section hash navigation. Exit non-zero after the retry budget.
Add:

```json
{
  "smoke:pages": "node scripts/smoke-pages.mjs"
}
```

- [ ] **Step 3: Add pull-request validation with no deployment**

Create `ci.yml` with `pull_request.branches: [master]`, `contents: read`, and
one validation job. Use `actions/checkout@v6`, `actions/setup-node@v6`, Node
24.14.0, `npm install --global npm@11.3.0`, exact version assertions,
`npm ci`, `npx playwright install --with-deps chromium`, and `npm run check`.
It must not request `pages: write`, `id-token: write`, reference the
`github-pages` environment, upload a Pages artifact, or run a deploy action.

- [ ] **Step 4: Create the production Pages workflow**

Create `deploy-pages.yml` named **Deploy portfolio to Pages** with:

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: github-pages
  cancel-in-progress: false
```

Every job must use `if: github.ref == 'refs/heads/master'` so selecting any
other ref in the manual branch dropdown produces a skipped run and cannot
publish. The build job uses the same pinned setup and `npm run check`, then
runs the best-effort external audit, `actions/configure-pages@v5`, and
`actions/upload-pages-artifact@v4` with `path: dist`.

The deploy job needs the build job and uses:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
steps:
  - name: Deploy GitHub Pages artifact
    id: deployment
    uses: actions/deploy-pages@v4
```

Add a final live-smoke job after deploy that checks out `master` and runs
`npm run smoke:pages`. No workflow writes, creates, rebases, or force-pushes a
Git branch.

- [ ] **Step 5: Document the one-time setting and exact manual UI trigger**

After the source branch is merged:

1. Open `https://github.com/umeshmg27/umesh-gangadharaiah`.
2. Open **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**. This is
   a one-time replacement for the old `gh-pages` branch source.
4. Open **Settings** → **Environments** → **github-pages** and restrict
   deployment branches/tags to the selected branch `master`.
5. Open **Actions** → **Deploy portfolio to Pages**.
6. Select **Run workflow**, choose `master`, then select **Run workflow**.
7. Wait for the build, deploy, and live-smoke jobs to succeed.
8. Open **Settings** → **Pages** → **Visit site**.

A push to `master` also deploys automatically. The manual control is a safe
rerun of the same default-branch workflow, not a per-branch deployment. If the
UI branch selector is accidentally set to anything else, the job guard skips
all publishing work.

- [ ] **Step 6: Test workflow syntax and scripts**

```bash
npm run audit:external
npm run build
git diff --check
```

Exercise `smoke-pages.mjs` through focused tests with a temporary local HTTP
fixture for success, retry, and timeout behavior. Do not require the old live
site to satisfy metadata that has not been deployed yet.
Run `npm run test:unit -- scripts/smoke-pages.test.ts` and require it to pass.
Validate both workflow YAML files with a parser and inspect their effective
permissions. Expected: the deterministic build exits 0, PR CI has no deploy
permissions, and only the guarded `master` deploy job has Pages permissions.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/deploy-pages.yml scripts/audit-external-links.mjs scripts/smoke-pages.mjs scripts/smoke-pages.test.ts package.json package-lock.json
git commit -m "$(cat <<'EOF'
Deploy portfolio from the default branch

Validate pull requests without publishing, then build and deploy the
verified Pages artifact only from master with a manual UI rerun and a
post-deployment smoke gate.
EOF
)"
```

## Task 15: Replace the Template README and Run Final Acceptance

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace template documentation**

Document:

- What the portfolio contains and where typed content lives.
- Required Node 24.14.0 and npm 11.3.0.
- `npm ci`, `npm run dev`, `npm run check`, image optimization, external
  audit, preview, main-only Pages deployment, manual workflow rerun, one-time
  Pages source configuration, smoke check, and rollback.
- Exact 12/25/4 preservation contract and featured/highlight ordering.
- How to add a project or recognition record without reintroducing hard-coded
  base paths or unverified destinations.
- EmailJS public client configuration location without reproducing its values.

- [ ] **Step 2: Run the clean-install acceptance gate**

```bash
npm ci
npm run verify:content
npm run lint
npm run test
npm run verify:assets
npm run build
git diff --exit-code package-lock.json
git diff --check
git status --short
```

Expected: every command exits 0; only intentional README/plan work remains
before the final docs commit.

- [ ] **Step 3: Run local preview verification**

```bash
npm run preview -- --host 127.0.0.1
```

Verify the exact printed URL under `/umesh-gangadharaiah/`, then run the
Playwright suite against that preview. Confirm keyboard navigation, phone,
tablet, laptop, and wide layouts, themes, reduced motion, 200% zoom, missing
image fallback, and EmailJS failure behavior.

- [ ] **Step 4: Request code review**

Invoke `superpowers:requesting-code-review` and
`ai-playbook:regression-impact-review`. Address only evidence-backed
findings, rerun the affected focused tests, then rerun the full acceptance
gate.

- [ ] **Step 5: Commit the operational documentation**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Document portfolio development and publishing

Replace template guidance with pinned setup, content maintenance,
verification, main-only deployment, manual workflow rerun, smoke, and rollback
instructions for the modernized site.
EOF
)"
```

- [ ] **Step 6: Prepare the branch handoff**

Invoke `superpowers:finishing-a-development-branch`. If the user chooses a
pull request, invoke `ai-playbook:writing-pr-bodies`, push the branch, create
the PR, and verify the live file list and checks. Do not merge to `master` or
manually dispatch the production workflow until source review is complete and
the user authorizes deployment.

## Final Acceptance Checklist

- [ ] All 12 projects render; exactly four are featured initially.
- [ ] All 25 recognition records render; exactly six are highlighted initially.
- [ ] All four career and four expertise records render.
- [ ] The four impact metrics use exact approved wording and order.
- [ ] No project with a missing or invalid destination renders as a link.
- [ ] Project and recognition full text is available by keyboard, touch, and
  mouse without hover or autoplay.
- [ ] Contact failure retains visitor input and provider details are not logged.
- [ ] Dark/light, reduced motion, keyboard focus, 200% zoom, and four viewport
  projects pass.
- [ ] Active images are responsive, dimensioned, and verified.
- [ ] Canonical, JSON-LD, Open Graph, X, manifest, icon, and 1200×630 card
  checks pass from built HTML.
- [ ] `npm ci`, lint, unit tests, Playwright/Axe, assets, build, and lockfile
  gates exit 0.
- [ ] PR validation has no deploy permissions and no feature branch publishes
  Pages.
- [ ] The Pages source is **GitHub Actions**, and both the workflow job guard
  and `github-pages` environment restrict deployment to `master`.
- [ ] The main-only Pages workflow is green and `npm run smoke:pages` passes.
