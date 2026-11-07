# About Hero v2.2 — Responsive Composition Refinement

**PASS — LOCAL IMPLEMENTATION, AWAITING FOUNDER VISUAL REVIEW.**

Route `/about/`. No commit, push, deployment or publication.

## Preflight and scope

Repository `/home/nickk/roust-us`, branch `feat/pf005-roust-us-mvp`, initial/final HEAD `b3c60e8d13b3e66ee999a8aa7376add701be6848`. Root `AGENTS.md` applies; existing About, shared container/Header rules and Journal Article Hero were inspected.

[Complete initial Git status and source hashes](initial-state.json), [complete final Git status](final-state.json), [previous About source](about-before.astro.txt), [exact change](change.patch).

**Only CSS in `src/pages/about.astro` changed.** All Hero HTML and approved text remain byte-identical. Mobile rules at 680 px and below, editorial styles/content, original photograph, optimized images, Header, Journal, PG27 and every other existing source/asset are unchanged. New artifacts are confined to this review directory. Pre-existing uncommitted work was preserved.

## Composition rules

### Wide Desktop: 1440 px and above

Removed the custom 92% Hero container override. About now uses the existing shared `.container` rule: `min(100% - 3rem, 1320px)`, with the site's existing narrow-screen variant.

The background stays full viewport width; the text column is a separate **520 px** maximum inside the shared container. Actual About and Journal Article container x/width were compared in every browser case.

Examples at DPR 1 with a 15 px scrollbar:

- 1920 px: x = 292.5, width = 1320 px, identical to Journal.
- 2560 px: x = 612.5, width = 1320 px, identical to Journal.
- 1440 px: x = 52.5, width = 1320 px, identical to Journal.

Photograph position becomes **`center top`**, instead of `right top`. When `cover` creates horizontal overflow, this shifts the subject right by half the previously cropped surplus. At matching source/viewport aspect ratios no extra shift is needed. No source image alteration or artificial edge extension.

### Compact Desktop: 1101–1439 px

Text width is `min(480px, calc(50vw - 100px))`, leaving additional subject clearance near the lower breakpoint. The same centered photograph rule retains the subject on the right.

Between 1199 and 1101 px, copy top padding interpolates toward 440 px. This prepares the vertical composition before the breakpoint instead of suddenly moving the heading at 1100 px:

```css
padding-top: clamp(
  calc(var(--site-header-block-size) + var(--section-block-spacing)),
  calc(440px + (1100px - 100vw) * 4),
  440px
);
```

### Tablet / tall-window composition

Vertical composition activates at **681–1100 px**, or above 680 px when the viewport aspect ratio is **6:5 or taller**. The height-aware rule avoids assuming that width alone makes a safe Desktop crop.

The same photograph occupies an upper band, `clamp(32rem, 58vw, 42rem)` high, positioned `56% top`. A smooth downward gradient joins it to the Hero's dark surface. Copy begins below the face/upper-body region using `clamp(21rem, 40vw, 28rem)`, with a maximum width of 520 px and the shared left alignment. The portrait no longer competes with the text column. No second image or generated variant.

### Approved Mobile: 680 px and below

**KEEP.** The complete original mobile rules remain byte-for-byte unchanged. Before/after full-Hero PNGs are byte-identical at 390 × 844, 390 × 667 and 680 × 900 in both themes. The existing mobile portrait, gradient, typography, spacing and content are preserved.

### Typography and height

To keep the fixed Desktop column readable and bounded, local responsive maxima above 680 px are capped at: name 88 px, introduction 18 px, principle 32 px, indicator values 40 px and descriptions 16 px. Typeface, weights, colors, italic principle, cyan rule and approved copy remain unchanged. No global typography token was changed.

Hero retains `min-height: 100vh; min-height: 100dvh`. It may grow when the content needs more height. The arrow stays in normal flex flow after the indicators; it is not absolutely positioned over them.

## Evidence and verification

[Main browser results](browser-results.json), [main verification script](verify-composition.mjs), [boundary results](transition-results.json), [boundary script](verify-transitions.mjs), [Mobile results](after-mobile-results.json), [integrity checks](integrity-results.json).

- **40** main cases: 20 viewport configurations × Dark/Light.
- **9** additional Dark boundary cases: 1200, 1199, 1176, 1150, 1120, 1101, 1100, 1099 and 681 px.
- Six before/after Mobile captures are byte-identical, including the 680 px boundary.
- About container alignment and width match Journal Article Hero in all main and boundary cases.
- Exact approved introduction, principle and indicator text verified; one accessible h1 named Nick Roust.
- No text intersection with manually calibrated face and upper-body rectangles in all non-Mobile composition cases. Approved Mobile retains its existing face clearance. The smallest measured side-by-side column-to-upper-body gap is **32.48 px**.
- Between 1101 × 900 and 1099 × 900, heading x stays the same and heading y differs by **3.59 px**. Hero height changes with natural text wrapping rather than a fixed clipped frame.
- No horizontal overflow, text clipping, face/Header intersection or indicator/arrow overlap. Keyboard Enter on Explore About focuses the first editorial section.
- Existing About, Journal, PG27 and FakeBank routes return HTTP 200 locally.
- `pnpm run build`: PASS, 14 static routes, 0 errors / 0 warnings; one pre-existing unused-import hint in the older About review script. [Build log](build.log).
- Existing tests: **11 passed / 0 failed**. [Test log](tests.log).
- `git diff --check`: PASS.

Browser `Chrome/156.0.8078.79`, DPR 1. Verification used the existing isolated local Chromium fallback because the Browser plugin runtime was unavailable. Subject rectangles are calibrated test evidence from this source photograph, not automatic subject detection in production CSS. Screenshots were also visually inspected; Founder visual review remains pending.

## Main viewport matrix

| Viewport | Theme | Mode | Column px | Hero height px | Result |
|---|---|---|---:|---:|---|
| 1920 × 1080 | dark | wide | 520.0 | 1080.0 | PASS |
| 1920 × 1080 | light | wide | 520.0 | 1080.0 | PASS |
| 1440 × 900 | dark | wide | 520.0 | 900.0 | PASS |
| 1440 × 900 | light | wide | 520.0 | 900.0 | PASS |
| 1366 × 768 | dark | compact | 480.0 | 768.0 | PASS |
| 1366 × 768 | light | compact | 480.0 | 768.0 | PASS |
| 1200 × 800 | dark | compact | 480.0 | 800.0 | PASS |
| 1200 × 800 | light | compact | 480.0 | 800.0 | PASS |
| 1100 × 800 | dark | vertical | 520.0 | 921.3 | PASS |
| 1100 × 800 | light | vertical | 520.0 | 921.3 | PASS |
| 1024 × 768 | dark | vertical | 520.0 | 881.0 | PASS |
| 1024 × 768 | light | vertical | 520.0 | 881.0 | PASS |
| 900 × 900 | dark | vertical | 520.0 | 900.0 | PASS |
| 900 × 900 | light | vertical | 520.0 | 900.0 | PASS |
| 768 × 1024 | dark | vertical | 520.0 | 1024.0 | PASS |
| 768 × 1024 | light | vertical | 520.0 | 1024.0 | PASS |
| 680 × 900 | dark | mobile | 512.0 | 1049.2 | PASS |
| 680 × 900 | light | mobile | 512.0 | 1049.2 | PASS |
| 390 × 844 | dark | mobile | 343.0 | 858.7 | PASS |
| 390 × 844 | light | mobile | 343.0 | 858.7 | PASS |
| 2560 × 1080 | dark | wide | 520.0 | 1080.0 | PASS |
| 2560 × 1080 | light | wide | 520.0 | 1080.0 | PASS |
| 1440 × 1080 | dark | wide | 520.0 | 1080.0 | PASS |
| 1440 × 1080 | light | wide | 520.0 | 1080.0 | PASS |
| 1200 × 900 | dark | compact | 480.0 | 900.0 | PASS |
| 1200 × 900 | light | compact | 480.0 | 900.0 | PASS |
| 1200 × 1000 | dark | vertical | 520.0 | 1000.0 | PASS |
| 1200 × 1000 | light | vertical | 520.0 | 1000.0 | PASS |
| 1101 × 900 | dark | compact | 450.5 | 941.5 | PASS |
| 1101 × 900 | light | compact | 450.5 | 941.5 | PASS |
| 1099 × 900 | dark | vertical | 520.0 | 920.6 | PASS |
| 1099 × 900 | light | vertical | 520.0 | 920.6 | PASS |
| 1366 × 600 | dark | compact | 480.0 | 703.2 | PASS |
| 1366 × 600 | light | compact | 480.0 | 703.2 | PASS |
| 390 × 667 | dark | mobile | 343.0 | 858.7 | PASS |
| 390 × 667 | light | mobile | 343.0 | 858.7 | PASS |
| 1439 × 900 | dark | compact | 480.0 | 900.0 | PASS |
| 1439 × 900 | light | compact | 480.0 | 900.0 | PASS |
| 1441 × 900 | dark | wide | 520.0 | 900.0 | PASS |
| 1441 × 900 | light | wide | 520.0 | 900.0 | PASS |

## Control screenshots

All screenshots wait for fonts and image decoding and include the complete Hero.

| Viewport | Dark | Light |
|---|---|---|
| 1920 × 1080 | [Dark](1920x1080-dark.png) | [Light](1920x1080-light.png) |
| 1440 × 900 | [Dark](1440x900-dark.png) | [Light](1440x900-light.png) |
| 1366 × 768 | [Dark](1366x768-dark.png) | [Light](1366x768-light.png) |
| 1200 × 800 | [Dark](1200x800-dark.png) | [Light](1200x800-light.png) |
| 1100 × 800 | [Dark](1100x800-dark.png) | [Light](1100x800-light.png) |
| 1024 × 768 | [Dark](1024x768-dark.png) | [Light](1024x768-light.png) |
| 900 × 900 | [Dark](900x900-dark.png) | [Light](900x900-light.png) |
| 768 × 1024 | [Dark](768x1024-dark.png) | [Light](768x1024-light.png) |
| 680 × 900 | [Dark](680x900-dark.png) | [Light](680x900-light.png) |
| 390 × 844 | [Dark](390x844-dark.png) | [Light](390x844-light.png) |

Additional checks:

- [2560 px wide grid](2560x1080-dark.png).
- [1440 × 1080 tall Desktop](1440x1080-dark.png).
- [1200 × 1000 vertical fallback](1200x1000-dark.png).
- [1366 × 600 short Desktop](1366x600-dark.png).
- [1101 px before mode switch](1101x900-dark.png), [1100 px after switch](1100x900-dark.png).
- [1199 px](1199x900-dark.png), [1150 px](1150x900-dark.png), [1120 px](1120x900-dark.png).
- [681 px vertical](681x900-dark.png), [680 px unchanged](after-680-900-dark.png).
- [390 px short unchanged](after-390-667-dark.png).
- [Full-page Desktop](desktop-full-page.jpg).

## Final state

No change outside the authorized responsive About scope. The same photograph and existing derivatives are reused. Hero markup, approved copy, editorial sections, global Header, Journal and other pages remain unchanged. Historical review artifacts are preserved.

**ABOUT HERO v2.2 RESPONSIVE COMPOSITION REFINED — AWAITING FOUNDER VISUAL REVIEW.**
