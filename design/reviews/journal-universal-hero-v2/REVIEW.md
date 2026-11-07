# Journal Universal Hero v2.0

**PASS — UNIVERSAL JOURNAL HERO IMPLEMENTED — AWAITING FOUNDER REVIEW.**

## Scope and implementation

The only existing implementation file changed is `src/pages/journal/[slug].astro`. No Content Collection schema, existing article, asset, Index, homepage, shared layout or global stylesheet changed.

The current schema names its optional image object `hero`, not `heroImage`. The template therefore defines `const heroImage = entry.data.hero` and uses that local value as its only presentation switch. No frontmatter field was added or renamed, and editorial type is not consulted.

- Image present: original `journal-entry__hero` / `journal-entry__hero-inner`, image element, overlay, title, dates and global styles are retained.
- Image absent: `journal-entry__editorial` / `journal-entry__editorial-inner`, without an image or overlay. Scoped styles use the existing theme tokens and title typography; there is no height or min-height declaration, border, gradient, card or animation.
- Editorial pages use the shared Header in normal document flow. The inner container starts after the existing section-spacing token, avoiding any overlay or double header offset. The article body markup and styles remain unchanged.

## Verification

Before editing, applicable AGENTS.md, Git status, template, schema, header behavior and global Hero/body rules were inspected. Baseline checksums cover 78 existing implementation/asset/config files.

| Check | Result |
| --- | --- |
| Five existing Visual Heroes | 40 exact before/after comparisons: five articles × 390/768/1440/1920 px × Light/Dark. Geometry, typography, colors, image sources, overlay and body measurements match. |
| Visual screenshot regression | Invoice Desktop Dark before/after screenshots are pixel-identical. |
| Editorial Hero | Eight viewport/theme checks passed. Transparent background, no image/scrim/min-height, correct Header offset, one HTML H1, unchanged historical label, correct back-link destination, no overflow. |
| Content-driven height | Replacing the fixture title with a one-word title in the browser reduced Hero height at every tested width; it was then restored before capture. No source article changed. |
| Editorial type independence | Temporary fixture used Retrospective, the same type as the five Visual articles, while rendering Editorial solely because its image was absent. |
| Keyboard / semantics | One accessible article heading; Tab reaches the back link with a visible solid outline; Enter navigates to Journal. |
| Existing content integrity | All eight existing Markdown records and all images unchanged; schema, Index, homepage and global CSS byte-identical to baseline. Only the template changed among the 78 protected files. |
| Build with fixture | `pnpm run build` passed; zero errors/warnings/hints; 12 static pages. Draft fixture generated no production route or HTML reference. |
| Final build after removal | `pnpm run build` passed again; zero errors/warnings/hints; 12 static pages. `git diff --check` passed. |

## DEV fixture lifecycle

Created temporary `src/content/journal/universal-hero-editorial-dev-fixture.md` with `draft: true`, `status: draft`, no image or publishedAt, and a May–July 2026 period label. DEV returned HTTP 200 during verification.

The fixture was removed after browser verification. Its DEV route now returns HTTP 404; its source file, production route and production HTML references are absent. It was never committed or published. Existing publication statuses/dates were not changed.

Fixture Hero heights were approximately 299.22 px at 390, 250 px at 768 and 310.72 px at 1440/1920. These are measured content results, not CSS constraints.

## Review screenshots

- [Editorial — Desktop Dark](editorial-desktop-dark.png)
- [Editorial — Desktop Light](editorial-desktop-light.png)
- [Editorial — Mobile Dark](editorial-mobile-dark.png)
- [Editorial — Mobile Light](editorial-mobile-light.png)
- [Existing Visual Hero — after](visual-after.png), [baseline](visual-before.png)

Measurements and checks: [Visual baseline](visual-before.json), [48 browser comparisons](browser-results.json), [keyboard verification](keyboard-results.json), [fixture production exclusion](fixture-build-results.json), [fixture removal](fixture-removal-results.json), [integrity summary](verification-results.json).

## Git state

Branch: `feat/pf005-roust-us-mvp`. Existing tracked modifications and untracked implementation/assets/reviews were preserved. This task changes the existing untracked article template and adds this review directory; the temporary content fixture is gone.

[Initial status](git-status-before.txt) · [Final status](git-status-after.txt).

No commit, push, deployment or publication was performed.
