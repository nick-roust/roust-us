# Journal Homepage — Editorial Covers v2.3

**PASS — awaiting Founder visual review.** Local implementation only. No commit, push, deployment or publication.

## Baseline and files

Branch: `feat/pf005-roust-us-mvp`; initial/final HEAD: `f83c9dfec07a5dd14b9d3f0edbc0dc4a1e32dca2`.

Approved reference: `design/references/Инженерная хроника_ работа в процессе.png`, inspected and unchanged.

Application file changed: `src/pages/index.astro` only, with local markup and scoped styles. Review artifacts are in this directory. Existing uncommitted source work is preserved. [Initial Git state](initial-state.json), [final Git state](final-state.json), [original Homepage source](before-index.astro.txt), [integrity results](integrity-results.json).

An unrelated `design/references/fake-terminal-mark.svg` appeared after preflight. It was not created or modified by this task and was left intact.

## Rendering and content integrity

Each article has one native cover link: existing decorative image, dark CSS overlay, cyan rule and full `h3`. Metadata and summary remain below the cover. No repeated title, separate button or nested interactive element.

The existing Content Collection and Homepage selection helpers remain unchanged. Article order and image mapping:

| Route under `/journal/` | Existing image under `/images/journal/` |
| --- | --- |
| `when-code-stopped-being-the-main-thing/` | `scenario-road.webp` |
| `registry-and-configuration-authority/` | `platform-node-bridge.webp` |
| `we-built-all-the-pieces/` | `first-payment-tunnel.webp` |

Titles, periods, types and summaries match the source entries exactly. No article, image, route, draft status, Journal Index or article-page source changed. [Image hashes](image-integrity.json).

## Geometry and styling

Desktop uses the mockup's approximate 5:4 ratio with a 192 px minimum height for narrow columns. Mobile uses 3:2 to limit stacked-page length. Existing column widths, gaps, introduction and container remain intact. All titles end 20 px above their cover bottom; cover heights agree within 0.1 px browser rounding.

| Viewport | Approximate cover | Title font size |
| --- | --- | --- |
| 1920 | 298 × 238 px | 22.4 px |
| 1440 | 300 × 240 px | 22.32 px |
| 1024 | 218 × 192 px | 18.4 px |
| 768 | 224 × 192 px | 18.4 px |
| 390 | 358 × 239 px | 23.2 px |

The longest full title fits at every tested width. No ellipsis, shortening, excessive font reduction, rounding, frames, shadows, blur, zoom or animation.

Approved section padding is unchanged: 76/84 px on Desktop, 40/40 at 768, 32/32 at 390. Cover-to-metadata spacing is 20 px; metadata-to-summary remains 16 px on Desktop and 8 px below it. Section height naturally changes when titles move into covers.

Images receive 14% overall darkening. The content gradient becomes 82% dark at 24 px and 98% at its bottom; title glyphs start at least 34 px into that gradient. White titles and the existing cyan `#80dafa` rule use identical treatment in Light/Dark. With an entirely white underlying image, the computed conservative title contrast bound is **13.2:1**. This is a calculated bound from verified CSS geometry, not a pixel-sampling audit. All three actual photographs were visually inspected; infrastructure subjects remain visible.

## Accessibility and verification

- Exact title link name via `aria-labelledby`; one `h3` beneath section `h2`.
- Empty image `alt` plus `aria-hidden="true"` prevents duplicate announcements.
- Visible keyboard focus and native Enter navigation PASS.
- Hover underlines titles while retaining white text, with no transform or text shadow. [Hover results](hover-results.json)
- All three article routes return HTTP 200.
- Browser matrix: 390, 768, 1024, 1440, 1920 × Light/Dark, all PASS. Full-title bounds, bottom alignment, mappings, metadata/summary preservation, focus, accessible names and overflow checked. Journal loading CLS is 0 in every case. [Browser results](browser-results.json)
- Other Homepage section widths, heights and text match baseline.
- `pnpm run build`: PASS, Astro check and static generation. [Build log](build.log)
- Existing `node --experimental-strip-types --test tests/*.test.mjs`: PASS for both test files. [Test log](tests.log)
- `git diff --check`: PASS.

Screenshots were captured after image decoding and include the full Chronicle section plus adjacent boundaries. QA uses isolated local Chrome because the in-app browser runtime is unavailable. [Cover QA script](verify-covers.mjs), [hover QA script](verify-hover.mjs).

## Review screenshots

- [1920 Dark](covers-1920-dark.jpg) / [1920 Light](covers-1920-light.jpg)
- [1440 Dark](covers-1440-dark.jpg) / [1440 Light](covers-1440-light.jpg)
- [768 Dark](covers-768-dark.jpg) / [768 Light](covers-768-light.jpg)
- [390 Dark](covers-390-dark.jpg) / [390 Light](covers-390-light.jpg)
- 1440 Dark comparison: [Before](before-1440-dark.jpg) → [After](covers-1440-dark.jpg)

## Adaptations and provenance

The existing 1320 px container remains authoritative. Narrow-column minimum height and Mobile 3:2 cropping adapt the mockup for full-title readability; square corners follow the existing design system. No content/image substitution.

An old QA command inadvertently regenerated the prior spacing review's `before.json` and four Desktop before-captures. They were restored with their original pre-refinement spacing; its original 84 px Desktop before/after difference was rechecked. This iteration's baseline was saved separately before implementing covers. No site source changed during that restoration.

Remaining decision: Founder visual acceptance.

**JOURNAL EDITORIAL COVERS v2.3 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
