# About v2.2 — Final Review Fixes

**PASS — arrow removed and 1024 × 768 indicator clearance corrected. Awaiting Founder visual review.**

Only `src/pages/about.astro` changed across these final fixes. No replacement control or new content.

## Arrow removal

Removed the Explore About anchor/SVG and its dedicated CSS on every viewport. The existing first-section ID remains stable. No global Header, navigation, source photograph, web asset or editorial section changed.

## 1024 × 768 correction

The initial text top offset was 409.6 px. Indicators ended at 784.97 px, extending below the viewport. Height-aware Tablet padding now uses:

```css
padding-top: clamp(20rem, calc(100dvh - 27rem), clamp(21rem, 40vw, 28rem));
```

At 1024 × 768, text begins at **336 px** and the indicators end at **711.38 px**, leaving **56.62 px** before the viewport bottom. The Hero height is exactly **768 px**. No text or indicators are hidden or resized.

The compact-to-vertical transition at 1101–1199 px uses the same height limit, preserving the existing fluid handoff on short windows. On taller screens the previous spacing is retained. Very short windows may still grow naturally rather than clip content.

The photograph, its crop, typography, approved copy and all Mobile rules are unchanged by this height adjustment. Four Mobile before/after PNGs at 390 × 844/667, Dark/Light, remain byte-identical to the arrowless baseline.

## Verification

- `pnpm run build`: PASS. [Build log](build.log).
- `git diff --check`: PASS.
- **20 browser cases**: 1440 × 900, 1200 × 800, 1101 × 800, 1100 × 800, 1024 × 768/800/700, 768 × 1024, 390 × 844/667; Dark/Light. [Results](browser-results.json).
- No arrow, no horizontal overflow, loaded photograph, one h1, visible indicators inside the natural Hero and face below Header.
- At 1024 × 768, indicators have at least 32 px viewport-bottom clearance in both themes.
- All Hero markup and Mobile/editorial CSS are unchanged by the height fix. Original photograph, derivatives and other source/assets match preflight hashes.

## Review images

- [1024 × 768 before](before-height-1024x768-dark.png), [after Dark](1024x768-dark.png), [after Light](1024x768-light.png).
- [1100 × 800](1100x800-dark.png), [1101 × 800](1101x800-dark.png).
- [Desktop](1440x900-dark.png), [Tablet portrait](768x1024-dark.png).
- [Mobile](390x844-dark.png), [short Mobile](390x667-dark.png).

[Arrow-removal initial state](initial-state.json), [height-adjustment initial state](height-initial-state.json), [exact height adjustment](height-change.patch), [final Git status](final-state.json).

Branch/HEAD unchanged; earlier uncommitted work preserved. No commit, push or deployment.
