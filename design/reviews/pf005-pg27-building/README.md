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

## Building v2.1 and centered Footer monogram

- [Desktop Light](v2-1-desktop-light.png) — 1440 × 1000 viewport
- [Desktop Dark](v2-1-desktop-dark.png) — 1440 × 1000 viewport
- [Mobile Light](v2-1-mobile-light.png) — 390 × 844 viewport
- [Mobile Dark](v2-1-mobile-dark.png) — 390 × 844 viewport

Each image is a full-page screenshot showing Building, Professional Identity pre-footer, and Footer.

## Review checks

- Counter is in the left text column and dynamically reports days, estimated hours, and date in `Europe/Moscow`.
- Desktop status panel overlays the road; Focus / Stage / Goal are displayed in one row with equal-height dividers.
- Mobile status panel adapts below the Building copy without horizontal overflow.
- Footer monogram is centered, links home, and measures 72px on Desktop / 52px on Mobile.
- Theme behavior, keyboard disclosure, Contact content and copyright were regression-checked.
- Static no-JavaScript counter fallback remains the approved 183 / 2,400 baseline dated 30 Oct 2026.

Astro check and production build passed. Playwright checks passed for Desktop/Mobile, Light/Dark, counter date, panel layout, theme toggle, keyboard disclosure, no overflow, Contact content, and Footer centering. Counter unit tests passed.
