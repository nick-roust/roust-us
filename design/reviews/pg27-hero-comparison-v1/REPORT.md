# PG27 Hero Visual Comparison v1.0

**PASS — awaiting Founder selection.** Both variants were rendered under equivalent conditions. No image selected for the website. No commit, push, deployment or publication.

## Baseline and isolation

Repository: `/home/nickk/roust-us`.
Branch: `feat/pf005-roust-us-mvp`.
Initial/final HEAD: `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

Existing uncommitted work was preserved. [Initial complete Git state](initial-state.json), [final complete Git state](final-state.json).

No application file was temporarily or permanently edited. The canonical `/projects/pg27/` page was opened in isolated local Chromium; one temporary DOM Hero and a runtime-only stylesheet were inserted. Original image bytes were supplied as browser-memory PNG data URLs. No images were copied into `public/`, and no comparison route or shared Hero abstraction was created.

After capture, the page was reloaded. Original Hero, status content, Sidebar markup and canonical metadata were compared against the browser baseline and restored exactly. [Restoration check](restoration.json), [source checksum comparison](integrity-results.json). Only review artifacts in this folder are new.

## Sources and integrity

| Variant / asset | Repository-relative source | SHA-256 |
| --- | --- | --- |
| A — Global Operations Center | `design/references/Футуристический центр глобальных операций-2.png` | `be2677153434ce02ea71b9d359467bfca4ffa1d9774280448e6ccc11bf7f3189` |
| B — Global Monitoring Center | `design/references/Футуристический центр глобального мониторинга-1.png` | `5f1ea3a5fb7e699892419ec34e9347b77d27cd9dd2238db42f2df0be04f51f31` |
| PG27 master wordmark | `brand/master/pg27.svg` | `75f065cd26131883ad58014421d3fa71c9d9e3032650cb8a371976538db5783f` |

A is 1655 × 950; B is 1649 × 954. Original PNG bytes, dimensions and intrinsic aspect ratios are unchanged. The existing `public/brand/pg27.svg` is byte-identical to the master and was reused without recoloring or geometry changes. Original white PG, cyan `#13d1fd` 27, proportions and spacing remain intact. [Source manifest](source-assets.json).

## Equivalent rendering conditions

- Browser: Chrome 156.0.8078.79, same isolated instance.
- Viewport: **1440 × 900**, DPR 1, Dark Theme.
- Hero: **1095 × 389.765625 px**, x = 277.5, y = 88, entirely within the main content column.
- Header: ends at y = 88; Desktop Sidebar ends at x = 252.5. Neither is overlapped by the Hero.
- Hero height and copy padding are taken from the existing FakeBank Product Hero: 48 px top padding, 43.1875 px horizontal padding at this viewport.
- Wordmark: **277.6875 × 64 px**, x = 320.6875, y = 164.5625.
- One accessible h1 named `PG27`; the SVG image is decorative, with no duplicate accessible name.
- Classification: `IN DEVELOPMENT · TRANSACTION INFRASTRUCTURE` using existing eyebrow styling.
- Description: `Building transaction infrastructure.` in white, 24 px.
- No technology list or new CTA.

A and B use the same DOM and CSS; only the background image source/natural dimensions differ. Normalized Hero markup, all measured rectangles, overlay, positioning, text and wordmark dimensions were compared for equality. [Comparison results](comparison-results.json), [runtime stylesheet](preview.css.txt), [reproducible QA script](compare-heroes.mjs).

### Overlay and crop

The shared overlay follows the existing FakeBank treatment:

```css
linear-gradient(90deg,
  rgba(5, 13, 19, .9),
  rgba(5, 13, 19, .46) 50%,
  rgba(5, 13, 19, .04) 85%),
linear-gradient(0deg,
  rgba(5, 13, 19, .4),
  transparent 48%)
```

Both use `object-fit: cover` and `object-position: 50% 48%`. The wider Hero crops the source images vertically, without stretching. Their slightly different intrinsic aspect ratios produce slightly different crop amounts under identical rules. No per-image positioning adjustment, retouching, blur, glow, image regeneration or additional graphic overlay was applied.

## Comparative observations

**Variant A:** the large, comparatively frontal map fills the center of the frame and approaches the text area. Cooler blue network graphics and the right-side readout panel remain visible. The shared left gradient separates the white/cyan identity from the dense screen imagery. Some lower workstation detail is cropped by the wide Hero.

**Variant B:** the room is more oblique; the main map lies farther right. Architecture and the window/city area occupy more of the left side, with warmer network accents across the map. The same overlay subdues that architectural area behind the identity. Workstations and the right-side readout panel remain visible within the same wide crop.

Both wordmarks and descriptions are fully visible and readable in the captured configuration. Neither variant was separately optimized, scored or selected.

### Editorial constraint

These are **conceptual illustrations**, not photographs or evidence of actual PG27 operations. Readouts embedded in the original artwork remain illustrative; none of their values was copied into HTML, metadata, alt text or product claims. PG27 is explicitly identified as in development. Public coverage, readiness, availability or performance is not inferred.

### Existing action

The current PG27 page has a portfolio backlink, `/#systems`, in its content area below the Hero, rather than an approved primary Hero CTA. It remains unchanged in both previews and after restoration. No repository, demo or endpoint was invented, and the backlink was not promoted into a replacement Hero button.

## Screenshots

- [Variant A — Hero with Sidebar](variant-a-1440-dark.png)
- [Variant B — Hero with Sidebar](variant-b-1440-dark.png)
- [Variant A — Hero close-up](variant-a-closeup.png)
- [Variant B — Hero close-up](variant-b-closeup.png)

Fonts and both images were decoded before each capture. Sidebar Status navigation was exercised in each preview; canonical navigation remained functional.

## Verification and final state

- `pnpm run build`: PASS, 0 errors, 0 warnings, 0 hints; 14 static routes. [Build log](build.log)
- Existing tests: **11 passed**, no failures. [Test log](tests.log)
- `git diff --check`: PASS.
- Source files, approved assets, routes, redirects and pre-existing changes match their preflight checksums exactly.
- Browser baseline restored by reload; no preview style/DOM remains.
- Built canonical PG27 page contains its original content. No comparison route, candidate image bytes or prototype markers are in production output. [Production-output checks](production-verification.json)

The existing baseline is unchanged; no candidate has been permanently selected. Scope is the requested Desktop Dark comparison only; no Mobile/Light selection claim is made.

**PG27 HERO VISUAL COMPARISON v1.0 — AWAITING FOUNDER SELECTION.**
