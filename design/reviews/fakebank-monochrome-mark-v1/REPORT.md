# FakeBank Monochrome Brand Mark v1.0

**PASS — awaiting Founder visual review.** Local implementation. No commit, push, deployment or publication.

Branch: `feat/pf005-roust-us-mvp`; initial/final HEAD: `f83c9dfec07a5dd14b9d3f0edbc0dc4a1e32dca2`.

## Files

- Created `src/assets/fakebank-mark-monochrome.svg`.
- Modified `src/pages/index.astro`: import the SVG through Astro's inline SVG component pipeline; insert it before the existing heading text; scoped heading/mark styles.
- Modified `src/components/BuildingSection.astro` for the subsequent Founder request: hours display without grouping commas, in both static fallback and JavaScript updates. The date/day/hour calculation is unchanged.
- Added this review directory and its screenshots, measurements and logs.

Existing uncommitted work is preserved. Initial and final complete Git states: [initial-state.json](initial-state.json), [final-state.json](final-state.json). [Integrity comparison](integrity-results.json).

## Original and variant

Original: `design/references/fake-terminal-mark.svg`, unchanged.

SHA-256 before: `248621d09f82eb30764b935dbb616789270fefa3a7acdf8f1c7289b84a6acf07`.
SHA-256 after: `248621d09f82eb30764b935dbb616789270fefa3a7acdf8f1c7289b84a6acf07`.

The original contains a dark square fill, a thin gray square-border path, and two green terminal-symbol paths inside a shared transform. The symbol is filled geometry, with no active stroke. Only background and border paths were removed in the derivative. Both terminal path `d` strings, their other attributes, alignment and the group transform `matrix(1.0159 0 0 1.0159 -1.0159 -1.0159)` are preserved exactly. Green path fills become `currentColor`.

The derivative retains original user coordinates and crops only empty space: `viewBox="33.096424 43.254814 60.358425 41.493774"`. This encloses the browser-measured symbol bounds with 0.5 original units of breathing room per side to avoid edge clipping. [Measured bounds](terminal-bounds.json), [source integrity](source-integrity.json).

No master edits, rasterization, filters, decorative framing, shadows, animation, hover effects or mark-specific color token.

## Integration and dimensions

A decorative inline SVG and text span remain inside the original `h2`. SVG uses `aria-hidden="true"` and `focusable="false"`; no image title or duplicate accessible name. The level-two heading's accessible name remains exactly `FAKE BANK`.

Mark height follows the heading font: 0.95 em normally, 0.75 em on Tablet. Gap is 12–16 px. At 681–760 px the smaller mark uses existing left padding beside the heading to keep the full title on one line without changing section geometry.

| Viewport | Rendered SVG box | Gap |
| --- | --- | --- |
| 390 | 42.00 × 28.88 px | 12 px |
| 768 | 33.16 × 22.80 px | 12 px |
| 1024 | 43.86 × 30.16 px | 12 px |
| 1440 | 55.27 × 38.00 px | 14.39 px |
| 1920 | 55.27 × 38.00 px | 16 px |

The SVG inherits the heading color: light `rgb(237, 242, 244)` in Dark; dark `rgb(21, 33, 43)` in Light. No recoloring filter.

## Verification

- Chromium: 390, 768, 1024, 1440, 1920 × Light/Dark, all PASS. [Before](before.json), [after](after.json)
- Exact baseline comparison confirms unchanged section height, 43/57 columns, label, description, stack, CTA and image rectangles. Heading height, font size, text dimensions and line wrapping remain unchanged. Mark and heading centers align; no horizontal overflow.
- Other Homepage sections retain their geometry and text, except the explicitly requested removal of the hours comma.
- Additional 681, 720 and 760 px checks PASS, alongside the five main widths. Runtime hours contain digits only. [Narrow-width and counter results](narrow-and-counter-results.json)
- The initial fallback now says `2400`; live output currently says `2470 hrs`. Counter calculations, timezone and scheduling are unchanged.
- Accessibility tree: one matching level-two heading with name `FAKE BANK`; decorative SVG paths do not add an announcement.
- Source XML comparison confirms both path geometries/attributes and group transform unchanged; original SHA-256 matches before/after.
- `pnpm run build`: PASS; Astro check and static generation. [Build log](build.log)
- Existing `node --experimental-strip-types --test tests/*.test.mjs`: PASS for both test files. [Test log](tests.log)
- `git diff --check`: PASS.

QA uses the existing isolated local Chromium workflow. Images were decoded before screenshots. No project page, Hero, other product branding, global Header, Journal, Systems Overview, Contact or Footer source was edited.

## Screenshots

- [Featured — Desktop Dark](featured-1440-dark.jpg)
- [Featured — Desktop Light](featured-1440-light.jpg)
- [Featured — Mobile Dark](featured-390-dark.jpg)
- [Featured — Mobile Light](featured-390-light.jpg)
- [Heading close-up — Desktop Dark](heading-1440-dark.png)
- [Heading close-up — Desktop Light](heading-1440-light.png)
- [Heading close-up — Mobile Dark](heading-390-dark.png)
- [Heading close-up — Mobile Light](heading-390-light.png)

Remaining decision: Founder visual acceptance.

**FAKEBANK MONOCHROME BRAND MARK IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
