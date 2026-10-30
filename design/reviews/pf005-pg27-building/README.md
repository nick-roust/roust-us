# PF-005 PG27 Building visual review

Captured on 2026-10-31 from the local Astro production build with Playwright Chromium.

## Before

The existing homepage screenshots were captured before this change:

- [Desktop Light](../2026-10-30-current-homepage/desktop-light.png)
- [Desktop Dark](../2026-10-30-current-homepage/desktop-dark.png)
- [Mobile Light](../2026-10-30-current-homepage/mobile-light.png)
- [Mobile Dark](../2026-10-30-current-homepage/mobile-dark.png)

## Previous Building composition

- [Desktop Light](before-visual-revision-desktop-light.png) — 1440 × 900 viewport
- [Desktop Dark](before-visual-revision-desktop-dark.png) — 1440 × 900 viewport
- [Mobile Light](before-visual-revision-mobile-light.png) — 390 × 844 viewport
- [Mobile Dark](before-visual-revision-mobile-dark.png) — 390 × 844 viewport

## Before: Building v2.1

- [Desktop Light](v2-1-desktop-light.png) — 1440 × 1000 viewport
- [Desktop Dark](v2-1-desktop-dark.png) — 1440 × 1000 viewport
- [Mobile Light](v2-1-mobile-light.png) — 390 × 844 viewport
- [Mobile Dark](v2-1-mobile-dark.png) — 390 × 844 viewport

Each image is a full-page screenshot showing Building, Professional Identity pre-footer, and Footer.

## After: Building v2.2 Compact Editorial Layout

- [Desktop Light](v2-2-desktop-light.png) — 1440 × 1000 viewport
- [Desktop Dark](v2-2-desktop-dark.png) — 1440 × 1000 viewport
- [Mobile Light](v2-2-mobile-light.png) — 390 × 844 viewport
- [Mobile Dark](v2-2-mobile-dark.png) — 390 × 844 viewport

These are full-page Playwright screenshots showing Building, Professional Identity pre-footer, and Footer. Compare them with the v2.1 screenshots above.

## Final CTA / status-panel alignment

- [Desktop Light](v2-2-final-align-desktop-light.png)
- [Desktop Dark](v2-2-final-align-desktop-dark.png)
- [Mobile Light](v2-2-final-align-mobile-light.png)
- [Mobile Dark](v2-2-final-align-mobile-dark.png)

On Desktop, the lower edges of the Follow the progress CTA and the status panel align to within 1 CSS pixel. Mobile layout remains unchanged.

## Status panel typography alignment

The Focus / Stage / Goal labels share a common top baseline, and all three values share a common baseline directly below the labels. The panel dimensions, position, dividers, and mobile layout are unchanged.

## Review checks

- Counter is in the left text column and dynamically reports days, estimated hours, and date in `Europe/Moscow`.
- Desktop status panel is 600px wide at 1440px viewport, overlays the road, and remains horizontally clear of the left text column. Focus / Stage / Goal are displayed in one row with equal-height dividers.
- At 961–1159px the status panel flows below the text; at 1160px and wider it overlays the road. Intermediate widths were checked for overlap and horizontal overflow.
- Mobile status panel adapts below the Building copy without horizontal overflow.
- Footer monogram is centered, links home, and measures 48px on Desktop / 40px on Mobile.
- Theme behavior, keyboard disclosure, Contact content and copyright were regression-checked.
- Dynamic counter on 31 Oct 2026 reports 184 days / 2,410 estimated hours; static no-JavaScript fallback remains the approved 183 / 2,400 baseline dated 30 Oct 2026.

Astro check and production build passed. Playwright checks passed for Desktop/Mobile, Light/Dark, widths 961–1440px, counter date, panel layout and final bottom-edge alignment, status label/value baselines, theme toggle, keyboard disclosure, no overflow, Contact content, and Footer centering.
