# FakeBank Product Hero v2.0

**PASS — awaiting Founder visual review.** Local implementation; no commit, push or deployment.

Branch: `feat/pf005-roust-us-mvp`; HEAD remains `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

## Implementation

Updated the existing `src/pages/labs/fake-bank.astro` Hero only: classification `OPEN SOURCE · PAYMENT SIMULATOR`, the same approved monochrome terminal asset used by Homepage, and five SVG icons with technology labels. No new Product Hero component or classification schema.

The h1 retains a single accessible `FAKE BANK` name; the mark is decorative. The terminal source and existing monochrome variant are unchanged.

New presentation assets: `src/assets/technologies/{typescript,fastify,react,postgresql,docker}.svg`. Source SVGs were parsed and inspected for dimensions, paint and references. Derivatives remove only editor metadata, empty definitions and unreferenced IDs; drawable geometry is preserved. Four black monochrome silhouettes render using currentColor for contrast over the photograph. The final TypeScript presentation is superseded by the separately authorized [outlined refinement v2.0.1](../fakebank-typescript-icon-v2.0.1/REPORT.md), using `typescript-outline.svg`.

## Source integrity

All five originals exist in `design/references/technologies/` and are valid SVGs. No external references, scripts or icon library. Initial SHA-256/dimensions/paint inventory: [source-assets.json](source-assets.json). Current hashes: [source-assets-final.json](source-assets-final.json).

The Founder replaced `typescript.svg` during implementation, changing its hash from `2438fa45f1290b69052e4b1828e4e361714e9fa5f68f1ce828b9f4d19737f2e7` to `64c97191b147505b6aa56450253cc4fc0171735737e68e07481c0b21dbe07459`. The supplied update was preserved, and its letterforms are used by the final outlined variant. The agent did not modify an original SVG. Other four original hashes are unchanged.

| Asset | Original viewBox |
| --- | --- |
| TypeScript | `0 0 256 256` |
| Fastify | `0 -45.5 256 256` |
| React | `0 0 256 256` |
| PostgreSQL | `0 0 256 256` |
| Docker | `0 -5 256 256` |

## Geometry and responsive behavior

The original Hero bounds are preserved exactly across every tested width/theme:

| Width | Hero height |
| --- | --- |
| 390 | 314.234 px |
| 768 | 330.641 px |
| 1024 | 353.016 px |
| 1440 / 1920 | 389.766 px |

All icon boxes are 22 × 22 px, centered in the existing 18.594 px technology text row. Icons do not increase row height. Desktop/Tablet retain icons and names; below 768 px, TypeScript, React, PostgreSQL and Docker names are visually hidden but accessible, while Fastify keeps its label because the small silhouette is less self-explanatory. Original responsive breakpoints remain intact.

Description, GitHub destination and CTA rectangle, background image source/rectangle/crop, overlay, copy alignment and Hero height match the preflight baseline. Sidebar, Header, content sections, architecture/API/verification/status, Contact and Footer HTML/geometry are unchanged. Homepage, Journal and PG27 source files were not edited.

## Verification

- 390, 768, 1024, 1440, 1920 × Light/Dark: all ten cases PASS. [Before](before.json), [after](after.json).
- Five technology names occur once each in the technology-list accessibility subtree, including Mobile. Decorative SVGs add no duplicate announcement.
- CTA keyboard focus visible. Single h1; full title and brand mark remain within Hero bounds.
- No horizontal overflow. Measured Hero loading CLS is 0. Inline SVGs have reserved sizes.
- Source/asset scope: [integrity-results.json](integrity-results.json). Only the product Hero page and new technology derivatives were changed by this implementation; the recorded original TypeScript update was Founder-supplied.
- Build, existing tests and diff check PASS. [Build](build.log), [tests](tests.log).

## Screenshots

- [Desktop Dark — 1440](hero-1440-dark.jpg)
- [Desktop Light — 1440](hero-1440-light.jpg)
- [Wide Desktop Dark — 1920](hero-1920-dark.jpg)
- [Tablet Dark — 768](hero-768-dark.jpg)
- [Mobile Dark — 390](hero-390-dark.jpg)
- [Mobile Light — 390](hero-390-light.jpg)

All screenshots show the final outlined TypeScript variant. Additional width/theme captures are in this directory. Images were decoded before capture. Local Chromium QA used the existing isolated-browser fallback.

Initial/final Git state: [initial-state.json](initial-state.json), [final-state.json](final-state.json). Pre-existing uncommitted work is preserved.

**FAKEBANK PRODUCT HERO v2.0 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
