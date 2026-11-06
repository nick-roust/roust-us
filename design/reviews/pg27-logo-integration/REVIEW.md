# PG27 Brand Logo Integration

Status: **PASS — PG27 LOGO INTEGRATED — AWAITING FOUNDER VISUAL REVIEW.**

## Change

- `src/components/BuildingSection.astro`: replaced only the visual heading with an external SVG image inside the existing H2; retained its ID and added the requested `building-title` class.
- `src/styles/global.css`: added one logo rule: inline-block, intrinsic width, height `.76em`, baseline alignment. Existing typography, spacing, responsive rules, background and neighboring sections are unchanged.
- `public/brand/pg27.svg`: byte-identical copy of `brand/master/pg27.svg`. No rasterization, redraw, color override, effect or animation.

Master viewBox: `0 0 256 59`, aspect ratio `256 / 59`. Two independent paths remain intact: cyan `27` (`#13d1fd`) and white `PG` (`#fff`). The master, public copy and generated production copy have SHA-256 `75f065cd26131883ad58014421d3fa71c9d9e3032650cb8a371976538db5783f`.

## Rendered dimensions

Dimensions are CSS pixels and are identical in Light and Dark themes.

| Viewport | Logo width × height | Original text ink height | Heading line-box height |
| --- | --- | --- | --- |
| Desktop 1440 px | 185.14 × 42.67 px | 43 px | 53.34 px, unchanged |
| Tablet 768 px | 184.61 × 42.55 px | 43 px | 53.19 px, unchanged |
| Mobile 390 px | 231.45 × 53.34 px | 53 px | 66.69 px, unchanged |

## Verification

- `pnpm run build`: PASS, 12 static pages; Astro check: zero errors, warnings or hints.
- `git diff --check`: PASS.
- Six browser comparisons: Light/Dark at 1440, 768 and 390 px. No horizontal overflow, distortion or added whitespace around the intrinsic SVG. Visual height differs from the original text by less than half a CSS pixel.
- Accessibility tree: one H2 named `PG27`, level 2. Its `aria-label` supplies the name; the image has empty alt and `aria-hidden="true"`, so there is no duplicate named graphic.
- Exact before/after bounding-box comparisons passed for the H2, Building section, inner/copy containers, subheading, description, counters, CTA, status panel and all other homepage main sections. Other copy is unchanged; DEV source-line metadata was excluded from text comparison.
- Integrity snapshot: only BuildingSection.astro and global.css changed among 232 existing files; the other 230 are unchanged, including the master and all Journal work. The new public asset is byte-identical to the master.
- Browser plugin bootstrap remained unavailable because its configured service file was missing. QA used an isolated headless Chromium instance against local DEV. Review captures omit the DEV toolbar and incidental focus, without changing site source.

## Review assets and Git

- [Desktop 1440, Light](desktop-1440-light.png)
- [Mobile 390, Dark](mobile-390-dark.png)
- [Before measurements](before.json), [after measurements](after.json), [integrity results](verification-results.json).
- Branch: `feat/pf005-roust-us-mvp`. Existing dirty/untracked work was preserved. This task adds the public SVG and review directory and modifies only the two implementation files above. Master remains untracked and unchanged.
- [Git status before](git-status-before.txt), [Git status after](git-status-after.txt).

No commit, push or deployment was performed.
