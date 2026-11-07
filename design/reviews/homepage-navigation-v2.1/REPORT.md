# Homepage Composition & Global Navigation v2.1

**PASS — awaiting Founder visual review.** Local implementation only; no commit, push, deployment or publication.

## Baseline and preservation

Repository: `/home/nickk/roust-us`.
Branch: `feat/pf005-roust-us-mvp`.
Initial and final HEAD: `f83c9dfec07a5dd14b9d3f0edbc0dc4a1e32dca2`.

Initial complete Git status and source/asset SHA-256 inventory: [initial-state.json](initial-state.json). Final complete status: [final-state.json](final-state.json), [git-status-final.txt](git-status-final.txt).

The checkout initially contained Hero → Open Source → conditional Engineering Chronicle → Building → global Contact/Footer. It did not contain Systems Overview, Featured FakeBank or the architectural statement/diagram mentioned in the task. The four-column overview and Featured composition were restored from `design/references/homepage-dark-v2.png`, with the approved glass-facade photograph and verified FakeBank description/stack. The previous Open Source block was replaced; `/open-source` remains available. No master assets or shared components were deleted.

Founder correction: the first local Featured attempt used the obsolete card CSS. It was corrected to the supplied v2 mockup: full-width section, 43/57 split, photograph flush with the right edge, compact title/copy/stack/CTA and HTML caption over the photograph. The final screenshots and checks cover the corrected implementation.

## Files changed

| File | Task change |
| --- | --- |
| `src/pages/index.astro` | Replace Open Source with Systems Overview and Featured FakeBank; add scoped styles only for those sections |
| `src/components/Navigation.astro` | Approved labels, destinations and active-page rules |
| `src/pages/projects/index.astro` | Replace catalog content with the Astro redirect to `/#systems` |
| `src/pages/building-paymentgate.astro` | Change the catalog backlink destination to `/#systems` only |
| `src/pages/labs/index.astro` | Change the catalog backlink destination to `/#systems` only |
| `src/pages/labs/fake-shop.astro` | Change the catalog backlink destination to `/#systems` only |
| `design/reviews/homepage-navigation-v2.1/` | Review report, screenshots, baselines, logs and QA scripts |

No source files removed. No new dependencies, routes, content collections or global CSS changes. Pre-existing modifications to BuildingSection, SiteFooter, SiteLayout, Journal, FakeBank product content, global styles and untracked content/assets are preserved. [integrity-results.json](integrity-results.json) lists only the six expected application changes.

## Before / after

| Before | After |
| --- | --- |
| Hero / Author Identity | Hero / Author Identity — unchanged |
| Open Source | Systems Overview |
| — | Featured FakeBank |
| Engineering Chronicle | Engineering Chronicle — same selected stories, content and illustrations |
| Currently Building PG27 | Currently Building PG27 — unchanged composition and SVG |
| Contact / Footer | Contact / Footer — unchanged |

The architectural statement and accompanying diagram were already absent. No visible section numbers were introduced.

## Systems Overview

| Order | Project | Label | Destination |
| --- | --- | --- | --- |
| 1 | FAKE SHOP | OPEN SOURCE | `/labs/fake-shop/` |
| 2 | FAKE BANK | OPEN SOURCE | `/labs/fake-bank/` |
| 3 | PG27 | IN DEVELOPMENT | `/building-paymentgate/` |
| 4 | BIK / ED807 | Pending verification | `/bik/` |

Descriptions reproduce the Founder-supplied wording. BIK has no source-availability or license claim. Four equal columns at 1024 px and above; two columns at 681–1023 px; vertical stack at 680 px and below. Thin separators and compact text provide the transition between photographs. Entire items are keyboard-focusable links with no dummy targets.

## Featured FakeBank

The section uses the approved photograph through the existing shared AVIF/WebP assets. The original PNG and all derivatives remain unchanged. Source SHA-256: `0beeb60ce0fde1a219a12cf0737469d978cdb9dc2d0334e670f14af6848ef7e6` (1199 × 1312).

Desktop/tablet: 43% text and 57% photograph, full-width composition, section dividers only, no card frame or shadow. Mobile: copy then full-width photograph. The photo retains its colors/reflections and uses proportional cover cropping; an existing site-style readability overlay supports the mockup caption. No text is embedded in the photograph.

Caption: “Real-world scenarios. Controlled environment.” Title and metadata remain HTML. Technology stack: TypeScript, Fastify, React, PostgreSQL, Docker, as verified during the FakeBank product-page task. The description is the same verified independent-provider-simulator wording used there. No additional prominent OPEN SOURCE badge. CTA: `View project` → `/labs/fake-bank/`, with the mockup's compact treatment and existing theme color tokens.

## Header behavior

**About · Building · Projects · Journal · Contact**

| Item | Destination / active rule |
| --- | --- |
| About | `/about`; active on About |
| Building | `/#building`; no automatic product-page highlight |
| Projects | `/#systems`; active on FakeBank, FakeShop, `/building-paymentgate`, `/projects/paymentgate` and BIK |
| Journal | `/journal`; active on Index and article routes |
| Contact | Existing local `#contact` anchor |

Homepage has no default active item, including at section anchors. Header markup geometry, styles, icons and existing mobile navigation remain intact. No burger menu or separate Systems item. The FakeBank product-page source was not edited.

## `/projects` compatibility

The existing file-based route now returns `Astro.redirect('/#systems', 301)`.

- DEV: `/projects` and `/projects/` return HTTP 301 with `Location: /#systems`.
- Static build: Astro emits `dist/projects/index.html` with a zero-delay meta refresh, canonical URL, `noindex` and a visible fallback link to `/#systems`. This works without JavaScript and is not a blank HTTP 200 page.
- Production-preview browser test: the generated compatibility page reaches `/#systems` successfully.
- Static hosting normally serves that redirect document with HTTP 200. A true HTTP 301 on the deployed host still requires host-level redirect configuration; hosting is not configured in this repository. No HTTP deployment behavior is claimed.
- All incoming internal links to the obsolete catalog were replaced. The legacy `/projects/paymentgate` route remains available.

Implementation behavior was checked against the installed Astro redirect generator (`node_modules/astro/dist/core/routing/3xx.js` and `core/build/generate.js`), rather than assuming server redirects exist in a static build.

## Verification

- `pnpm run build`: PASS, 0 errors, 0 warnings, 0 hints; 12 static routes generated. [build.log](build.log)
- Existing `node --experimental-strip-types --test tests/*.test.mjs`: PASS for both existing test files. [tests.log](tests.log)
- `git diff --check`: PASS.
- Browser: 390, 768, 1024, 1440, 1920 px × Light/Dark, all PASS. Section order, 4/2/1 project columns, both section anchors, full-width Featured geometry, image decoding, caption, CTA, theme behavior and no horizontal overflow checked. [browser-results.json](browser-results.json)
- Protected Hero, Journal, Building, Contact and Footer: original HTML (ignoring generated Astro scope attributes), widths and heights unchanged at every tested width/theme. The same three story links remain selected in DEV. [homepage-baseline.json](homepage-baseline.json)
- Active Header state: About, FakeBank, FakeShop, both existing PG27 addresses, BIK, Journal Index and Journal Entry checked, all PASS.
- All 15 internal Homepage links and any hash targets checked. Keyboard checks at 390 and 1440 px confirm skip link, visible Header/project-link focus and Enter navigation. [links-keyboard-results.json](links-keyboard-results.json)
- Existing Tools, Labs and Open Source routes remain HTTP 200. Existing product/article routes and Featured CTA destination verified.
- Both forms of the legacy catalog URL and generated static redirect verified.
- Lazy images were scrolled into view and decoded before every full-page capture. No unloaded image was classified as a missing asset.

Journal publication filtering is unchanged: the three selected current stories are visible in DEV, while the existing draft statuses keep them out of the production build. This task does not authorize publishing those articles.

The 1920 px full-page review is a high-quality JPEG (quality 94); the other screenshots are PNG. This avoids a browser capture timeout without changing the page layout.

Browser QA used isolated local headless Chrome because the in-app browser runtime service was unavailable. Scripts: [verify-homepage.mjs](verify-homepage.mjs), [verify-links-keyboard.mjs](verify-links-keyboard.mjs), [capture-featured.mjs](capture-featured.mjs).

## Final review screenshots

- [Homepage Desktop Dark — 1440](homepage-desktop-dark.png)
- [Homepage Desktop Light — 1440](homepage-desktop-light.png)
- [Homepage Wide Dark — 1920](homepage-wide-dark.jpg)
- [Homepage Tablet Dark — 768](homepage-tablet-dark.png)
- [Homepage Tablet Light — 768](homepage-tablet-light.png)
- [Homepage Mobile Dark — 390](homepage-mobile-dark.png)
- [Homepage Mobile Light — 390](homepage-mobile-light.png)
- [FakeBank Header — Projects active](fakebank-header-active.png)
- [Journal Header — Journal active](journal-header-active.png)
- [Featured correction — 1024](featured-1024-dark.png)
- [Featured correction — 1440](featured-1440-dark.png)

## Remaining Founder decisions

- Visual acceptance of the corrected Featured composition/crop and overall section sequence.
- Host-level permanent redirect configuration when deployment is separately authorized.

**HOMEPAGE & GLOBAL NAVIGATION v2.1 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
