# About Hero — Desktop Gradient Refinement v1.1

**PASS — local implementation, awaiting Founder visual review.**

## Scope and baseline

Route: `/about/`. Branch `feat/pf005-roust-us-mvp`; initial and final HEAD `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

[Complete initial Git status and checksums](initial-state.json), [complete final Git status](final-state.json), [original page source](about-before.astro.txt), [exact task diff](change.patch).

Only `src/pages/about.astro` was modified. This review directory contains the new artifacts. Pre-existing uncommitted work was preserved. PG27's accepted Hero, Journal templates/styles, shared Header, Homepage, other products and assets remain unchanged.

The Founder authorized extending the About photograph to the full Hero width, with a small Desktop crop change. The previous Journal Index image wrapper started at 31% of the viewport, leaving no photo beneath the left side. About-only rules now set that wrapper to `inset: 0` above 680 px. `sizes="100vw"` reflects the larger display area. No new derivative or source image was generated.

## Final treatment

Hero height and copy geometry remain unchanged: approximately **634 px at 1440 px** and 768 px at 1920 px. Existing heading position, typeface, font size, subtitle, Header appearance and editorial content are preserved.

For widths 681–1799 px:

```css
.about-hero__media::after {
  background: linear-gradient(90deg,
    rgba(7,19,28,.36),
    rgba(7,19,28,.14) 22%,
    transparent 42%);
}
```

At 1800 px and above, the existing heading alignment places part of the title over the bright sunset. A slightly stronger, broad text-side gradient preserves readability there:

```css
.about-hero__media::after {
  background: linear-gradient(90deg,
    rgba(7,19,28,.5),
    rgba(7,19,28,.45) 36%,
    transparent 50%);
}
```

The old opaque left fill and additional bottom darkening are removed for Desktop About. Gate and fence details are visible across the continuous photograph. The overlay reaches zero before the face and principal motorcycle area. No additional dark layer is applied on the right. Existing `object-position: right top` is retained; the larger image area necessarily changes the Desktop cover crop, as authorized. Some lower motorcycle detail lies beyond the wide Hero's lower crop.

All selectors are local to About and media-gated. The existing Journal Index implementation is not changed.

## Verification

[Before measurements](before-results.json), [after measurements](after-results.json), [browser verification script](verify-gradient.mjs).

- 1440 and 1920 px, Dark and Light: full-width media, unchanged Hero rectangle, text rectangles, typography, Header and content.
- 390 px, Dark and Light: measurements and full Hero screenshot bytes match pre-change exactly. The Mobile gradient, position and text placement are untouched.
- No horizontal overflow, missing image or duplicate h1 in all six cases.
- Fonts and images were ready before capture. Desktop crops and text readability were visually inspected. No automated WCAG certification is claimed.
- `pnpm run build`: PASS, 14 static routes, 0 errors / 0 warnings; one pre-existing unused-import hint in the older About review script. [Build log](build.log).
- Existing tests: **11 passed / 0 failed**. [Test log](tests.log).
- `git diff --check`: PASS.

| Width | Theme | Hero height | Result |
|---:|---|---|---|
| 390 | dark | 560.00 px | PASS |
| 390 | light | 560.00 px | PASS |
| 1440 | dark | 633.59 px | PASS |
| 1440 | light | 633.59 px | PASS |
| 1920 | dark | 768.00 px | PASS |
| 1920 | light | 768.00 px | PASS |

Browser checks used the existing isolated local Chromium fallback; the Browser plugin's runtime service was unavailable in this environment. No user browser profile was accessed.

## Source integrity and Mobile preservation

Original photograph: `design/references/about_page_hero/Мотоциклист у закатных ворот.png`.

SHA-256 before and after: `9863f97206fae685d4ca26881d0035be6725875cbde0082940240c764e30eaea`.

[Integrity results](integrity-results.json) confirm that the original photograph, optimized assets, PG27, Journal and every other existing source file remain unchanged.

Byte-identical before/after Mobile Hero screenshots:

- Dark SHA-256: `9291242d58fce5af95a424af50046fd49637c687dd3971da6121e0e0e8291d41`.
- Light SHA-256: `f83eeaac792987218b23249ce43d2cb7e36a1fd93ac2e41a9d37179b9100c210`.

## Visual review

| Configuration | Before | After |
|---|---|---|
| Desktop 1440 Dark | [Before](before-1440-dark.png) | [After](after-1440-dark.png) |
| Desktop 1440 Light | [Before](before-1440-light.png) | [After](after-1440-light.png) |
| Desktop 1920 Dark | [Before](before-1920-dark.png) | [After](after-1920-dark.png) |
| Desktop 1920 Light | [Before](before-1920-light.png) | [After](after-1920-light.png) |
| Mobile 390 Dark | [Before](before-390-dark.png) | [Unchanged](after-390-dark.png) |
| Mobile 390 Light | [Before](before-390-light.png) | [Unchanged](after-390-light.png) |

[Full-page 1440 Dark after refinement](after-1440-dark-full.jpg).

About content remains provisional and awaits a separate editorial pass. PG27 Hero visual acceptance is preserved; no further PG27 implementation occurred. No commit, push, deployment or publication.

**ABOUT HERO v1.1 REFINED — AWAITING FOUNDER VISUAL REVIEW.**
