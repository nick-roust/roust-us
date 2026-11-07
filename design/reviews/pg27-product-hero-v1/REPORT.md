# PG27 Product Hero v1.0

**PASS — LOCAL IMPLEMENTATION; AWAITING FOUNDER VISUAL REVIEW.**

Canonical route: `/projects/pg27/`. No commit, push, deployment or publication.

## Preflight and Git state

Repository: `/home/nickk/roust-us`.

Branch: `feat/pf005-roust-us-mvp`.

HEAD, unchanged: `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

Root `AGENTS.md` was read; no nested instructions apply. Existing PG27 source, ProductLayout, ProductSidebar, FakeBank Hero and PG27 comparison report were inspected. The original PG27 action is the portfolio backlink below the status panel; it remains there, with no new Hero CTA.

[Complete initial Git status and source checksums](initial-state.json), [complete final Git status](final-state.json), [original page](pg27-before.astro.txt), [integrity checks](integrity-results.json).

Existing dirty work is preserved. This task changes only `src/pages/projects/pg27.astro`, adds six intentional optimized assets in `public/images/pg27/`, and creates this review directory. About, Homepage, Journal, other products, shared Sidebar/Header, routes, redirects, Contact/Footer and global tokens are unchanged from this task's preflight.

## Approved source integrity

| Asset | Exact source path | SHA-256 before and after |
|---|---|---|
| Revised Variant B, 1649 × 954 PNG | `design/references/pg27-hero/Футуристический центр аналитики мира.png` | `31e69a18d096f5934ca47c66e4cae9d4a74093c223219ab46c185e818914a7c1` |
| PG27 wordmark, viewBox `0 0 256 59` | `brand/master/pg27.svg` | `75f065cd26131883ad58014421d3fa71c9d9e3032650cb8a371976538db5783f` |

The already-existing `/brand/pg27.svg` is byte-identical to the master and reused without modification. Its two original path objects, white PG and cyan `#13d1fd` 27, geometry, proportions and spacing are unchanged. The SVG remains vector.

The revised source replaces the previous comparison image. No retouching, regeneration, embedded-text edits or restoration of old dashboard metrics was performed. The scene is explicitly described as conceptual illustration, not an actual PG27 operations center. No displayed values or operational capabilities are asserted in HTML or metadata.

## Rendering and geometry

The Hero remains inside the existing ProductLayout main column and keeps `#overview` and `#paymentgate-page-title`. It uses the comparison's local Hero structure; no shared Product Hero abstraction was added.

Hierarchy:

1. `IN DEVELOPMENT · TRANSACTION INFRASTRUCTURE`.
2. One `h1` with accessible name `PG27`; its decorative wordmark image has empty alt and `aria-hidden="true"`.
3. `Building transaction infrastructure.`

No visible duplicate PG27 heading, technology icons, repository/demo CTA or new page section.

At **1440 px**: Hero **1095 × 389.765625 px**, x=277.5, y=88. Wordmark **277.6875 × 64 px**, x=320.6875, y=164.5625. Hero and wordmark rectangles, plus computed overlay, match the approved comparison exactly. The Header ends at y=88 and Sidebar at x=252.5, so neither is overlapped.

Desktop copy padding uses `var(--section-block-spacing) clamp(24px, 3vw, 48px)`; wordmark height follows `clamp(2.5rem, 4.5vw, 4rem)`. Minimum Hero height is 24.3603515625rem, preserving the measured comparison height. Image intrinsic aspect ratio is preserved by `object-fit: cover`.

### Approved overlay

```css
linear-gradient(90deg,
  rgba(5,13,19,.9),
  rgba(5,13,19,.46) 50%,
  rgba(5,13,19,.04) 85%),
linear-gradient(0deg,
  rgba(5,13,19,.4),
  transparent 48%)
```

The same overlay applies in both themes, without additional scene-wide darkening. The map, room and workstations remain visible. No blur, glow, shadow or animation was added.

### Responsive positioning

- Desktop and Tablet: `object-position: center 48%`, matching comparison.
- Below 768 px: `object-position: 62% 48%`, minimum height 20rem and copy padding 40px 24px. This emphasizes the coherent central map/room rather than the far-right dashboard strip. Some workstation screens remain part of the conceptual background; their values are not treated as evidence.
- Product navigation retains the existing desktop Sidebar and compact disclosure behavior. No shared navigation implementation changed.

## Optimization and asset handling

The existing static public-asset approach used by FakeBank was retained: responsive AVIF first, WebP fallback, and explicit image width/height. Sources are selected with `srcset`/`sizes`, high fetch priority and eager loading. The original PNG is not copied to public assets.

An initial `astro:assets` Image attempt failed with `MissingSharp` in the existing dependency configuration. No dependency or image service was added. Instead, the already-installed Sharp generated derivatives in advance, consistent with the existing FakeBank image implementation. The final build succeeds with these ordinary local static assets. [Reproducible optimization script](optimize-image.mjs), [asset manifest](generated-assets.json).

WebP quality 88; AVIF quality 65; no enlargement or color transformation.

| Optimized asset | Dimensions | Bytes |
|---|---|---:|
| `public/images/pg27/revised-world-analytics-640.webp` | 640 × 370 | 66,574 |
| `public/images/pg27/revised-world-analytics-640.avif` | 640 × 370 | 41,156 |
| `public/images/pg27/revised-world-analytics-1024.webp` | 1024 × 592 | 141,018 |
| `public/images/pg27/revised-world-analytics-1024.avif` | 1024 × 592 | 85,781 |
| `public/images/pg27/revised-world-analytics-1649.webp` | 1649 × 954 | 285,630 |
| `public/images/pg27/revised-world-analytics-1649.avif` | 1649 × 954 | 168,305 |

## Verification

- `pnpm run build`: PASS; 14 routes; 0 errors and 0 warnings. One existing unused-import hint remains in the earlier About review script; that unrelated file was preserved. [Build log](build.log).
- Existing tests: **11 passed / 0 failed**. [Test log](tests.log).
- `git diff --check`: PASS.
- All ten browser cases passed image loading, heading/accessibility-tree checks, visible wordmark bounds, no horizontal overflow, correct canonical, Projects active state and no Header/Sidebar overlap.
- Native Enter opens compact Product Navigation; selecting Project details updates the anchor/current-section state and closes the disclosure. Desktop anchor navigation also passed.
- Canonical route and existing Homepage, About, Journal, FakeBank, FakeShop and BIK routes return HTTP 200 locally.
- Dark/Light Hero geometry, wordmark, overlay and status markup are identical at 1440 px.
- PG27 content below Hero and its portfolio backlink match preflight source byte-for-byte.
- All source asset hashes remain unchanged; public wordmark matches its master. All six derivatives are copied unchanged into static output.

Browser: `Chrome/156.0.8078.79`, viewport height 900, DPR 1. [Browser results](browser-results.json), [verification script](verify-hero.mjs).

| Viewport width | Theme | Hero (px) | Wordmark (px) | Result |
|---:|---|---|---|---|
| 390 | dark | 343 × 320.00 | 173.55 × 40 | PASS |
| 390 | light | 343 × 320.00 | 173.55 × 40 | PASS |
| 768 | dark | 705 × 389.77 | 173.55 × 40 | PASS |
| 768 | light | 705 × 389.77 | 173.55 × 40 | PASS |
| 1024 | dark | 760 × 389.77 | 199.92 × 46 | PASS |
| 1024 | light | 760 × 389.77 | 199.92 × 46 | PASS |
| 1440 | dark | 1095 × 389.77 | 277.69 × 64 | PASS |
| 1440 | light | 1095 × 389.77 | 277.69 × 64 | PASS |
| 1920 | dark | 1095 × 389.77 | 277.69 × 64 | PASS |
| 1920 | light | 1095 × 389.77 | 277.69 × 64 | PASS |

Browser plugin setup was unavailable because of a missing runtime service module. The existing isolated local headless Chromium was used without a user profile. Screenshots were captured after image decode and font readiness.

## Screenshots

- [Desktop 1440 Dark](desktop-1440-dark.png).
- [Desktop 1440 Light](desktop-1440-light.png).
- [Desktop 1920 Dark](desktop-1920-dark.png).
- [Tablet 768 Dark](tablet-768-dark.png).
- [Mobile 390 Dark](mobile-390-dark.png).
- [Mobile 390 Light](mobile-390-light.png).
- [Full-page Desktop 1440 Dark](desktop-1440-dark-full.png).

## Final state

The repository remains on the initial working branch and HEAD. Pre-existing work was not reset, stashed, cleaned or committed. No source assets were altered. Founder visual review remains pending; no additional product/content decision was made.

**PG27 PRODUCT HERO v1.0 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
