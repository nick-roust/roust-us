# TypeScript Icon Refinement v2.0.1

**PASS — awaiting Founder visual review.** Local only; no commit, push or deployment.

Branch: `feat/pf005-roust-us-mvp`; HEAD unchanged: `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

## Changes

- Added `src/assets/technologies/typescript-outline.svg`.
- Changed one import in `src/pages/labs/fake-bank.astro` to use this dedicated presentation variant. [Task-only diff](task.diff)
- Added this review directory.

All other code, the existing solid TypeScript derivative, four adjacent technology SVGs and the terminal mark remain unchanged. [Integrity results](integrity-results.json). Full Git states: [initial](initial-state.json), [final](final-state.json).

## Source and SVG treatment

Original: `design/references/technologies/typescript.svg`, the Founder-updated source received before this refinement.

SHA-256 before: `64c97191b147505b6aa56450253cc4fc0171735737e68e07481c0b21dbe07459`.
SHA-256 after: `64c97191b147505b6aa56450253cc4fc0171735737e68e07481c0b21dbe07459`.

The original contains a white rounded outline path and a white combined TS letterform path. The separate website variant preserves the updated TS letterform `d` exactly, replaces the frame with a square rectangle, and uses `currentColor` for letters and stroke. Transparent fill; no black square, rounded corners, filters, effects or raster website asset. [Source integrity](source-integrity.json)

Rendered container remains **22 × 22 px**. A 12-unit stroke in the original 256-unit coordinate system renders at **1.03125 CSS px**, subordinate to the lettering. Existing position, margins, labels, order and row sizing are unchanged.

## Theme note

The photographic Hero intentionally has a white foreground in both Light and Dark themes. TS therefore inherits white in both, matching the other monochrome technology icons and remaining legible over the dark overlay. The task's illustrative dark-on-Light expectation would require a different foreground/background context; no change to the approved Hero palette was made. The variant itself has no theme-specific colors or files.

## Verification

- Chromium: 390, 768, 1440 and 1920 px × Light/Dark, all eight cases PASS. [Before](before.json), [after](after.json)
- Exact equality checks: Hero bounds, technology row bounds, TS icon bounds, all four other icon markup/positions, title, description, image, Sidebar, content sections, Header, Contact and Footer.
- Transparent rectangle fill, inherited outline/letter colors and square frame verified. No overflow. Measured Hero loading CLS is 0.
- Accessible `TypeScript` name appears once inside the technology-list accessibility subtree. It remains available with the mobile label visually hidden.
- `pnpm run build`: PASS. [Build log](build.log)
- Existing tests: **11 passed**, no failures. [Test log](tests.log)
- `git diff --check`: PASS.

The broader Product Hero v2.0 also passes its ten-case matrix with the final TS variant. No additional website changes were needed for this refinement.

## Screenshots

- Technology row: [Desktop Dark](after-row-1440-dark.png), [Desktop Light](after-row-1440-light.png), [Mobile Dark](after-row-390-dark.png), [Mobile Light](after-row-390-light.png).
- Icon comparison: [Before](before-typescript-1440-dark.png) → [After](after-typescript-1440-dark.png).
- [Full Hero — 1440 Dark](hero-1440-dark.jpg).

Close-ups are cropped from the verified 2× row screenshots; source SVGs are never modified or rasterized for the website.

**TYPESCRIPT ICON REFINEMENT v2.0.1 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
