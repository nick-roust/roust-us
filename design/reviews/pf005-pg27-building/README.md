# PF-005 PG27 Building visual review

Captured on 2026-10-30 from the local Astro production preview.

## Before

The existing homepage screenshots were captured before this change:

- [Desktop Light](../2026-10-30-current-homepage/desktop-light.png)
- [Desktop Dark](../2026-10-30-current-homepage/desktop-dark.png)
- [Mobile Light](../2026-10-30-current-homepage/mobile-light.png)
- [Mobile Dark](../2026-10-30-current-homepage/mobile-dark.png)

## After

- [Desktop Light](after-desktop-light.png) — 1440 × 900 viewport
- [Desktop Dark](after-desktop-dark.png) — 1440 × 900 viewport
- [Mobile Light](after-mobile-light.png) — 390 × 844 viewport
- [Mobile Dark](after-mobile-dark.png) — 390 × 844 viewport

Each image is a full-page screenshot. The visual change is limited to the Building section, its homepage placement, and the Building navigation destination. Other visible sections are included to review page order and regressions.

## Review checks

- Desktop and mobile layouts in Light and Dark themes.
- Homepage section order and `#building` navigation target.
- PG27 copy, progress CTA, counter, Focus / Stage / Goal values.
- Road image load, responsive overflow, theme toggle and keyboard disclosure.
- Existing routes, Contact and Footer links, and copyright.
- Static no-JavaScript counter fallback.

Automated browser checks reported no failures. Detailed validation results are in the implementation handoff.
