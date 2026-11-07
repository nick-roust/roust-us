# PG27 Controlled Flow Hero v2.0

**PASS — LOCAL IMPLEMENTATION, AWAITING FOUNDER VISUAL REVIEW.**

Canonical route: `/projects/pg27/`. No commit, push, deployment or publication.

## Preflight and Git baseline

- Repository: `/home/nickk/roust-us`.
- Branch: `feat/pf005-roust-us-mvp`.
- Initial and final HEAD: `b3c60e8d13b3e66ee999a8aa7376add701be6848`.
- Root `AGENTS.md` applies; no nested instructions apply to this change.
- Current PG27 Hero, shared ProductLayout/Sidebar, FakeBank Hero and previous PG27 review were inspected.
- [Complete initial Git status and checksums](initial-state.json).
- [Complete final Git status](final-state.json).
- [Original page source](pg27-before.astro.txt), [exact task diff](change.patch).

All pre-existing uncommitted work remains preserved.

## Sources and integrity

| Source | Dimensions | SHA-256 before and after |
|---|---|---|
| `design/references/pg27-hero/Гидроэлектростанция на закате.png` | 1983 × 793 PNG | `d1e7ee1b0d8bbe87e35c1008d42ebb52ea0644eff9fb1f1c0466e8b853a1673a` |
| `brand/master/pg27.svg` | SVG viewBox `0 0 256 59` | `75f065cd26131883ad58014421d3fa71c9d9e3032650cb8a371976538db5783f` |

The supplied dam image is used exactly as the optimization input, without retouching, generation, source cropping, baked-in text, geometry edits or color treatments. Image alt text identifies it as illustrative; no operational claim is introduced.

`/brand/pg27.svg` remains byte-identical to the master. White PG, cyan `#13d1fd` 27, paths, proportions, spacing and displayed dimensions are unchanged. The wordmark stays vector and decorative inside the single `h1` named PG27.

The superseded Control Room PNG, its six optimized assets and all earlier review materials are retained. They are not referenced by the new PG27 Hero.

## Changed files and asset handling

- Modified: `src/pages/projects/pg27.astro` — responsive background sources, image description/dimensions, local overlay and local crop positions.
- Added: six `public/images/pg27/controlled-flow-dam-*` files listed below.
- Added: this review directory and its verification artifacts.

The existing responsive `<picture>` approach used by PG27/FakeBank is retained: AVIF first, WebP fallback, width descriptors, existing `sizes`, explicit intrinsic dimensions and high-priority loading. The already-installed Sharp produces derivatives ahead of Astro's static build. No dependency or external image service was introduced; source PNG remains outside public assets. The previous Astro Image attempt had exposed a missing Sharp integration, so no dependency/configuration change was attempted here.

WebP quality 88; AVIF quality 65; no enlargement. [Optimization script](optimize-image.mjs), [asset manifest](generated-assets.json).

| Asset | Dimensions | Bytes |
|---|---|---:|
| `public/images/pg27/controlled-flow-dam-640.webp` | 640 × 256 | 37,094 |
| `public/images/pg27/controlled-flow-dam-640.avif` | 640 × 256 | 22,219 |
| `public/images/pg27/controlled-flow-dam-1024.webp` | 1024 × 409 | 90,074 |
| `public/images/pg27/controlled-flow-dam-1024.avif` | 1024 × 409 | 53,259 |
| `public/images/pg27/controlled-flow-dam-1983.webp` | 1983 × 793 | 255,576 |
| `public/images/pg27/controlled-flow-dam-1983.avif` | 1983 × 793 | 157,298 |

## Composition and overlays

Hero markup, wordmark and copy are preserved:

- `IN DEVELOPMENT · TRANSACTION INFRASTRUCTURE`.
- One accessible `h1`: `PG27`, with the original decorative SVG.
- `Building transaction infrastructure.`

No new CTA, technology icons, sections or claims. The existing status block and portfolio backlink below Hero are byte-for-byte unchanged. Canonical route and metadata are unchanged.

The naturally dark forest now supplies most of the text contrast. The previous 90% left scrim and bottom dark layer are replaced with a restrained local gradient:

```css
linear-gradient(90deg,
  rgba(5,13,19,.4),
  rgba(5,13,19,.18) 38%,
  transparent 70%)
```

Below 768 px:

```css
linear-gradient(90deg,
  rgba(5,13,19,.5),
  rgba(5,13,19,.28) 55%,
  transparent)
```

These apply only to `.pg27-hero::before`. No global overlay changed. Forest texture, concrete details and architectural lighting remain visible. The right side has no additional opaque layer. No glow, shadow, blur or animation was added.

## Responsive crop review

The same uncropped source and same photographic treatment serve both themes. All crops use `object-fit: cover`, preserving intrinsic proportions.

| Width | CSS object-position | Observation |
|---|---|---|
| 1200 px and above | `center 48%` | Wide composition retains the dam, reservoir, receding mountains and dark forest beneath the identity. |
| 768–1199 px | `left 48%` | Anchors the dark forest under the text while the spillway and a meaningful part of the dam remain visible to the right. Far-right extremity is cropped. |
| Below 768 px | `50% 48%` | Central spillway/structural crop remains recognizable; bright water sits below the text. Both ends of the original panorama are outside the portrait crop. |

The full panorama is not claimed to fit Mobile. It communicates the central infrastructure while preserving text legibility. Screenshots at 390, 768, 1024, 1440 and 1920 were reviewed; no unresolved crop or contrast defect was identified for local review.

## Verification

[Before measurements](before-results.json), [after measurements](after-results.json), [browser script](verify-hero.mjs).

- `pnpm run build`: PASS, 14 routes, 0 errors / 0 warnings; one pre-existing unused-import hint in the older About review script. [Build log](build.log).
- Existing tests: **11 passed / 0 failed**. [Test log](tests.log).
- `git diff --check`: PASS.
- All ten width/theme combinations: correct dam asset loaded; no horizontal overflow, text clipping, Header overlap or Sidebar overlap.
- Hero and wordmark rectangles match the pre-change measurements at every tested width/theme. Header, Sidebar and compact navigation geometry are unchanged.
- Classification, tagline, SVG source, accessible heading name and status markup match the baseline. Exactly one level-one heading named PG27 was confirmed in the accessibility tree.
- Native Enter opens compact Product Navigation; selecting Project details changes anchor/current-section state and closes it. Desktop section navigation passes too.
- PG27 and existing Homepage/About/Journal/FakeBank/FakeShop/BIK routes return HTTP 200 locally.
- Dark/Light Hero geometry and overlay remain identical for a given viewport; surrounding content follows its active theme.
- [Integrity checks](integrity-results.json) confirm only the PG27 source page changed among existing source/assets; all other pages/components, original images, wordmark and old optimized assets are unchanged. New assets are copied unchanged into static output.

Browser: `Chrome/156.0.8078.79`, height 900 px, DPR 1. The existing isolated local Chromium was used because the Browser plugin's runtime service was unavailable; no user profile was accessed. Fonts/images were ready before screenshots. Crop/contrast observations are visual review, not an automated WCAG certification.

| Width | Theme | Hero (px) | Wordmark (px) | Result |
|---:|---|---|---|---|
| 390 | dark | 343 × 320.00 | 173.55 × 40.00 | PASS |
| 390 | light | 343 × 320.00 | 173.55 × 40.00 | PASS |
| 768 | dark | 705 × 389.77 | 173.55 × 40.00 | PASS |
| 768 | light | 705 × 389.77 | 173.55 × 40.00 | PASS |
| 1024 | dark | 760 × 389.77 | 199.92 × 46.08 | PASS |
| 1024 | light | 760 × 389.77 | 199.92 × 46.08 | PASS |
| 1440 | dark | 1095 × 389.77 | 277.69 × 64.00 | PASS |
| 1440 | light | 1095 × 389.77 | 277.69 × 64.00 | PASS |
| 1920 | dark | 1095 × 389.77 | 277.69 × 64.00 | PASS |
| 1920 | light | 1095 × 389.77 | 277.69 × 64.00 | PASS |

## Screenshots

- [Desktop 1920 Dark](desktop-1920-dark.png).
- [Desktop 1440 Dark](desktop-1440-dark.png).
- [Desktop 1440 Light](desktop-1440-light.png).
- [Tablet 1024 Dark](tablet-1024-dark.png).
- [Tablet 768 Dark](tablet-768-dark.png).
- [Mobile 390 Dark](mobile-390-dark.png).
- [Mobile 390 Light](mobile-390-light.png).
- [Full-page Desktop 1440 Dark](desktop-1440-dark-full.png).

## Final state

No deviations outside the authorized background/overlay/cropping scope. Existing PG27 content/status, About, Journal, Homepage, other Product Pages, Sidebar, Header, Contact/Footer, routes and redirects remain unchanged. Earlier uncommitted work is preserved. Founder visual review remains pending.

**PG27 CONTROLLED FLOW HERO v2.0 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
