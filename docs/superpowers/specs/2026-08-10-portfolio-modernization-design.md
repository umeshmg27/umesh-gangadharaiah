# Portfolio Modernization Design

Status: Approved in conversation on 2026-08-10

## Problem

The current portfolio contains credible engineering experience, measurable
outcomes, projects, and recognition, but presents them as a very long,
template-like single page. Important evidence is difficult to scan, several
interactive elements are inaccessible or misleading, mobile layouts are
unnecessarily tall, and the site lacks useful link-preview metadata. The
Create React App toolchain and deployment assumptions also make the repository
harder to maintain and reuse.

## Audience

The primary audience is recruiters and hiring managers. The secondary audience
is the broader professional community, including engineering peers and people
who encounter the site through shared links.

## Goals and Success Criteria

- Preserve every existing factual claim, date, name, career entry, project,
  recognition record, and active content asset.
- Make Umesh's positioning, strongest outcomes, and representative work clear
  within the first screen and the first few sections.
- Keep all 12 projects and all 25 active recognition records discoverable
  without requiring visitors to traverse every record by default.
- Provide usable interactions on keyboard, mouse, and touch devices.
- Produce a concise mobile experience without hiding substantive content.
- Preserve and improve the dark and light themes.
- Remove broken-link affordances and repair verified stale links without
  inventing destinations.
- Provide canonical, search, structured-data, Open Graph, and X metadata for
  reliable sharing from the existing GitHub Pages site.
- Make builds and GitHub Pages deployment reproducible.
- Require a passing production build, automated behavior tests, accessibility
  checks, responsive checks, asset checks, and published-site smoke checks.

## Scope

- Modernize the existing React and TypeScript application and build toolchain.
- Restructure the homepage into a recruiter-first narrative with progressive
  disclosure for the full portfolio archive.
- Centralize current content into typed, build-time data modules.
- Refresh the visual system and responsive behavior.
- Improve navigation, projects, recognition, themes, and the contact form.
- Optimize active images and remove unused code and dependency references when
  lossless preservation does not require them at runtime.
- Add automated testing, metadata, social preview, and GitHub Pages deployment.
- Correct grammar, spelling, accessible labels, and verified broken-link
  behavior while preserving the meaning and facts of the source content.

## Non-Goals

- No backend, CMS, authentication, analytics, database, or admin interface.
- No invented project outcomes, case-study details, biography, or contact data.
- No individual project routes in this phase.
- No removal of existing projects or active recognition records.
- No replacement of EmailJS with a different messaging service.
- No custom-domain migration.

## Information Architecture

The site remains one responsive homepage with stable section anchors:

1. **Header and navigation** — name/brand, section links, accessible theme
   control, and mobile menu.
2. **Hero** — portrait, existing role and specialization, concise positioning,
   GitHub and LinkedIn links, plus View Work and Contact actions.
3. **Impact summary** — four existing quantitative outcomes: 50,000+ indexed
   policy objects, sub-second retrieval, 300+ hours saved, and 70 percent less
   manual effort.
4. **Expertise** — four simplified areas: backend systems, GenAI, automation,
   and tools, using the current copy and skill labels.
5. **Featured work** — four representative projects chosen for clear ownership
   and measurable outcomes.
6. **All projects** — an explicit View All control reveals all 12 existing
   project records. A text search filters title, description, and existing
   technology text without introducing editorial categories.
7. **Career** — the complete four-entry career timeline.
8. **Recognition** — six selected highlights, two from each existing category,
   followed by filters for Innovation, Mentorship, and Leadership. All 25
   active records remain available.
9. **Contact** — the existing EmailJS-backed form with trustworthy status and
   recovery behavior.
10. **Footer** — social links, attribution, and a concise closing statement.

Stable section anchors allow visitors to share a meaningful part of the page.
The site does not add client-side routes solely for cosmetic separation.

### Approved Featured Content

The impact summary uses these exact existing claims, in this order:

1. `50,000+` — policy objects indexed.
2. `Sub-second` — policy retrieval.
3. `300+ hours` — manual effort saved.
4. `70%` — manual effort reduced.

The four featured projects are, in this order:

1. NDO - Search & Explore Feature.
2. Unified Backup and Restore - Cisco Nexus Dashboard.
3. Cisco NDO - Simplified L4L7 Service Chaining.
4. Resource Allocation Manager (RAM).

The six recognition highlights are, in this order. Image filenames identify
records whose titles are not unique:

1. Innovation — Congratulations for winning 2023 Asia-Pacific Stevie Bronze
   award (`pal-050723.jpeg`).
2. Innovation — Innovation : Internal Tool (`yogi-070422.jpeg`, the Codeshift
   record).
3. Mentorship — Cisco KT Sessions (`priyanka-181224.jpeg`).
4. Mentorship — Training interns (`pra-080323.jpeg`).
5. Leadership — Feature Ownership (`rohi-171024.jpeg`).
6. Leadership — Root Cause Analysis and Release (`ara-290923.jpeg`).

All-project cards show a mechanically derived preview of at most 180
characters, ending at the final complete word within that limit. An explicit
Read Project Details control reveals the unchanged full description. No new
summary copy is authored. View All preserves the current 12-record source
order, and text search filters that order without re-ranking results.

## Content Preservation Policy

The existing repository remains the factual source of truth. Migration uses
the following rules:

- Preserve 12 project records and their full descriptions.
- Preserve the four visible career entries and their dates and descriptions.
- Preserve the four visible expertise groups and all linked publications.
- Preserve the 25 records currently loaded from `mentorandteam.json`, including
  titles, descriptions, tags, categories, and active images.
- Preserve the portrait, active project imagery, active recognition imagery,
  GitHub profile, LinkedIn profile, and contact behavior.
- Keep dormant or duplicate source assets in version history, but do not import
  or ship them when they are not part of the active experience.
- Treat obvious spelling and grammar corrections as editorial cleanup only;
  do not change technical meaning, ownership, dates, people, organizations, or
  numerical claims.
- Do not render `#` destinations as links. A project without a verified public
  URL remains a complete, non-clickable portfolio card.
- Verify external destinations before changing them. If no correct destination
  can be established from repository evidence, preserve the text and remove
  the misleading link affordance.

## Visual System

The refreshed site keeps the current dark and violet identity while moving to
an understated, technical editorial style.

- Dark theme: deep charcoal/navy surfaces with restrained violet accents.
- Light theme: warm off-white surfaces with the same accent hierarchy.
- Typography: a fast system-first sans-serif stack with a restrained monospace
  accent for labels and technical details.
- Layout: generous whitespace, a readable content width, subtle borders, and
  disciplined card grids instead of heavy gradients or decorative effects.
- Hero: two columns on wide screens and one concise column on mobile.
- Motion: short entrance and state transitions only; no autoplay. Respect
  `prefers-reduced-motion` throughout.
- Interaction: visible hover and focus feedback, minimum 44-by-44-pixel targets
  for interactive controls, and no hover-only content.

## Technical Architecture

The application remains a static React and TypeScript site, built with Vite and
hosted at the existing GitHub Pages repository path.

- Replace deprecated Create React App scripts with a current supported Vite
  build and development setup.
- Pin Node.js `24.14.0` in `.nvmrc` and the package metadata. Preserve npm and
  `package-lock.json`, pin npm `11.3.0` in the `packageManager` field, and use
  `npm ci` for frozen-lockfile installs.
- Preserve TypeScript strictness and configure the GitHub Pages base path in
  one place.
- Import portfolio data at build time. Remove the recognition runtime fetch and
  all hard-coded `/umesh-gangadharaiah/` asset URLs from components and data.
- Keep UI state local to the components that own it: navigation state, theme,
  project filters, recognition filters, detail disclosure, and contact status.
- Use semantic HTML and focused styles for primary layout. Retain a dependency
  only when it materially improves an accessible interaction.
- Remove the obsolete carousel, vertical-timeline dependency, duplicate email
  package, unused imports, and stale template test after equivalent behavior is
  covered by the new implementation.
- Use GitHub Actions to install, test, build, and deploy the generated static
  output directly to GitHub Pages from the repository's current default branch,
  `master`. Pull requests may validate the build, but no feature branch may
  publish a Pages deployment.

No runtime server is required. The only external runtime operation remains the
existing EmailJS form submission.

## Component Boundaries

- `App` composes the page and owns no content records.
- `Header` owns navigation, mobile-menu state, and theme control.
- `Hero` presents identity, positioning, social links, and primary actions.
- `ImpactSummary` renders selected metrics from typed source data.
- `ExpertiseSection` renders the four existing expertise groups.
- `ProjectExplorer` owns featured/all presentation and text-search state.
- `CareerTimeline` renders all career entries with semantic ordered content.
- `RecognitionGallery` owns category filtering and selected/all disclosure.
- `ContactForm` owns validation, asynchronous submission, and user feedback.
- `Footer` renders the closing copy and named social links.

Data modules contain content only. Components contain presentation and
interaction only. No generic `utils`, `helpers`, or dumping-ground module is
introduced.

## Data Flow

Portfolio content is validated as typed local data during development and
imported directly into rendering components at build time. Filters derive a
visible subset from immutable arrays; they do not mutate source records.

Theme selection follows this order:

1. An explicitly stored visitor preference.
2. The operating system color-scheme preference.
3. The site's default theme.

The selected theme is stored only in browser storage as a device-local
preference.

Contact submission follows this sequence:

1. Validate name, contact method, and message.
2. Announce field errors and move focus to the first invalid field.
3. Disable duplicate submissions and show a sending state.
4. Submit through the existing EmailJS configuration.
5. On success, announce completion and clear the form.
6. On failure, announce a recoverable error and retain all entered content.

## Interaction Details

- Navigation uses real anchor destinations and accounts for the sticky header.
- The mobile menu closes after selection and returns focus predictably.
- Social icon links have descriptive accessible names and safe external-link
  attributes.
- Project cards always expose their substantive descriptions. Additional detail
  is revealed by an explicit, focusable control rather than hover.
- Projects without a public destination have no anchor wrapper or new-tab
  behavior.
- Project previews use the deterministic 180-character rule defined above;
  details are never dependent on hover.
- Recognition filters expose category counts and maintain a logical focus
  order. Full recognition copy opens through an accessible detail control.
- Theme control uses a labeled button and supports keyboard activation. A small
  pre-render initializer applies the stored or system theme before React mounts
  so the page does not flash the wrong theme.
- Motion and smooth scrolling are reduced or removed when the visitor requests
  reduced motion.

## Error Handling

Static portfolio data cannot fail at runtime because it is bundled at build
time. Content-count and asset-reference checks fail the development or build
gate instead of producing an incomplete published page.

EmailJS is treated as an unreliable external dependency. The form presents
idle, invalid, sending, success, and failure states; never clears input before
confirmed success; and never relies on console output as user feedback.

Missing images retain useful alternative text and a visually stable fallback.
External links open safely. Unverified or placeholder destinations are not
rendered as interactive links.

## Accessibility

- Use `header`, `nav`, `main`, `section`, and `footer` landmarks.
- Use one page-level heading and a consistent nested heading order.
- Give every control and icon-only link an accessible name.
- Associate every input with a unique label, description, and error message.
- Provide visible `:focus-visible` styles and logical keyboard order.
- Meet WCAG AA contrast for normal text and controls.
- Preserve content at 200 percent zoom without two-dimensional scrolling.
- Support keyboard and touch access to every detail currently revealed by
  hover.
- Respect reduced-motion and color-scheme preferences.
- Announce contact sending, success, and failure through a polite live region.
  Show project and recognition result counts as visible text instead of noisy
  live updates.

## Performance and Assets

- Resize and compress active raster images to their actual display needs while
  retaining source-quality originals in version history.
- Use responsive dimensions and explicit width and height. Generate optimized
  WebP variants for active raster images while retaining source PNG or JPEG
  files as fallbacks.
- Eager-load only the portrait or other first-viewport critical image; lazy-load
  below-the-fold project and recognition images.
- Eliminate unused image imports and runtime calls to externally hosted project
  thumbnails where a suitable local asset already exists.
- Use the existing local `search-and-explore.jpg` asset for NDO Search &
  Explore. Retain the current remote Cisco image URLs for Simplified L4L7 and
  Advanced PBR because the repository has no matching local source; provide a
  title-based fallback if either remote image fails.
- Validate local asset references without network access. External image and
  destination checks run as a separate best-effort audit and never make the
  production build nondeterministic.
- Avoid fixed-background and autoplay behavior that causes mobile paint or
  motion cost.
- Keep the dependency set small and remove packages made obsolete by the new
  semantic components.

## Search and Sharing

- Set a specific page title and description based only on existing role and
  expertise claims.
- Add the canonical GitHub Pages URL.
- Add Open Graph and X card title, description, type, URL, and a 1200-by-630
  custom social preview image. The card uses the portrait, the dark navy and
  violet visual system, the headline `Umesh Gangadharaiah`, and the existing
  lines `Backend Engineer` and `Distributed Systems & Infrastructure`. It adds
  no new factual claims.
- Add Person structured data containing only already-public profile facts and
  social links.
- Replace generic Create React App manifest content and icons with
  portfolio-specific metadata.
- Preserve indexability and provide a valid robots file.
- Verify the final HTML output contains share metadata without requiring
  client-side JavaScript.

## Testing and Verification

Automated coverage includes:

- Content integrity: 12 projects, 25 recognition records, four career entries,
  required section headings, and key factual metrics.
- Navigation: stable section targets, mobile-menu behavior, and theme control.
- Projects: four featured records, View All behavior, text search,
  descriptions, and non-link rendering for missing public destinations.
- Recognition: selected/all behavior, categories, full descriptions, and no
  forced autoplay.
- Theme: stored preference, system fallback, accessible control, and DOM state.
- Contact: validation, sending, success, failure, retained failure input, and
  duplicate-submit prevention.
- Metadata: canonical, structured data, Open Graph, X, and portfolio-specific
  manifest values.

Manual and browser verification includes:

- Keyboard-only navigation and visible focus.
- Screen-width checks for representative phone, tablet, laptop, and wide
  desktop layouts.
- Dark and light themes, reduced motion, and 200 percent zoom.
- Missing-image and EmailJS failure behavior.
- Production build output and direct loading from the GitHub Pages base path.
- Published URL, section anchors, external links, canonical URL, and social
  preview tags after deployment.

## Deployment

A GitHub Actions Pages workflow runs on pushes to the current default branch,
`master`, and by manual dispatch. A job-level branch guard and the
`github-pages` environment both restrict production deployment to `master`.
Feature branches and pull requests never publish Pages artifacts. The workflow
uses `actions/checkout@v6`, `actions/setup-node@v6`, the pinned Node and npm
versions, and these pre-deploy gates in order:

1. `npm ci`.
2. `npm run lint`.
3. `npm run test`.
4. `npm run build`.

Only a successful build job may upload `dist` with
`actions/upload-pages-artifact` and publish it with `actions/deploy-pages`.
The deploy job receives only `contents: read`, `pages: write`, and
`id-token: write`; it uses the `github-pages` environment and does not write to
any Git branch. The Vite base path and canonical URL both target the existing
repository Pages location. The workflow does not require a runtime server,
deploy token, or private content.

One repository setting changes from branch publishing to first-party Actions
publishing: Settings → Pages → Build and deployment → Source → GitHub Actions.
After the workflow exists on `master`, a maintainer can trigger or rerun the
production build entirely in the web UI:

1. Open the repository and select Actions.
2. Select **Deploy portfolio to Pages**.
3. Select **Run workflow**, choose `master`, and confirm **Run workflow**.
4. Wait for both the build and deploy jobs to succeed.
5. Open Settings → Pages → Visit site.

The workflow also deploys after a successful push to `master`; manual dispatch
provides the requested UI-controlled rerun. A defensive job condition prevents
a manually selected non-`master` ref from publishing.

After publication, `npm run smoke:pages` requests the published URL and asserts
the site title, canonical URL, Open Graph tags, application root, and one local
asset. This post-deploy check cannot gate a deployment that has already
occurred; a failure marks the handoff incomplete. Recovery is a normal revert
of the source commit followed by a successful `master` deployment or manual
rerun. Git history remains the rollback record, and the workflow does not
create, force-push, or rewrite a deployment branch.

Deployment is not considered complete until the published URL loads the new
bundle directly, assets resolve from the repository subpath, section links work,
and the share metadata is present in the served HTML.

## Risks and Mitigations

- **Editorial drift:** compare typed records against the current source and
  enforce inventory-count tests before deleting obsolete representations.
- **Asset-path regression:** centralize base-path handling and test the built
  output from the GitHub Pages subpath.
- **Broken external services:** retain contact input on failure and provide
  visible retry guidance.
- **Overlong mobile content:** use explicit progressive disclosure while keeping
  all records reachable.
- **Dependency migration risk:** replace the build system before feature work,
  then add behavior in small verified increments.
- **Social-card mismatch:** create the card only after the visual direction and
  final headline are stable, then verify all text and metadata before shipping.

## Approved Decisions

- Optimize for recruiters and hiring managers first, with broad professional
  sharing as the secondary goal.
- Preserve all data while surfacing selected highlights first.
- Target the existing GitHub Pages site and rich social previews.
- Permit grammar, spelling, accessibility-label, and broken-link corrections
  without changing facts.
- Use the recruiter-first layered approach rather than a minimally refreshed
  long page or a multi-route case-study system.
- Use the page hierarchy, architecture, visual direction, interaction model,
  error handling, and verification approach described above.
- Publish Pages only from the current default `master` branch through the
  first-party GitHub Pages Actions flow; do not create per-branch deployments.

## Open Questions

None. The design is sufficiently specified for implementation planning.
