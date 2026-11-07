# About Hero v2.1 — Full Viewport

**PASS — LOCAL IMPLEMENTATION, AWAITING FOUNDER VISUAL REVIEW.**

Route `/about/`. Hero design and content are Founder-approved; the existing editorial content below remains provisional. No commit, push, deployment or publication.

## Preflight and Git baseline

Repository `/home/nickk/roust-us`; branch `feat/pf005-roust-us-mvp`; initial and final HEAD `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

Root `AGENTS.md` applies. Existing About v1.1 markup/styles, Journal Hero conventions, Header behavior and spacing/type tokens were inspected. Prior uncommitted work remains preserved.

[Complete initial status and checksums](initial-state.json), [complete final status](final-state.json), [previous About source](about-before.astro.txt), [exact task diff](change.patch).

## Changed files

Only `src/pages/about.astro`: Hero markup, About-scoped styles, responsive image `sizes`, and the permitted anchor/focus target on the first editorial section. This review directory is new.

No shared Header, global design/typography token, Contact/Footer, Journal, Homepage, PG27, other product or route was modified. No dependency, JavaScript component or new web image was added.

## Photograph and reference integrity

| Role | Source | Dimensions | SHA-256 before and after |
|---|---|---|---|
| Actual Hero photograph | `design/references/about_page_hero/Мотоциклист у закатных ворот.png` | 1672 × 941 | `9863f97206fae685d4ca26881d0035be6725875cbde0082940240c764e30eaea` |
| Composition reference only | `design/references/about_page_hero/maket-v21.png` | 1672 × 941 | `d1a56015711bd1bf648461c730f8d81be05bc27a2645bd08f496a1367c63b920` |

The existing approved `/images/about/nick-roust-motorcycle-640.webp`, `-1024.webp` and `-1672.webp` are reused unchanged. The reference mockup is not imported by the website or used as background. Every text element, indicator and arrow is semantic HTML/SVG. No retouching, generative processing, baked-in text or additional derivative was introduced.

`srcset` and explicit 1672 × 941 dimensions remain. `sizes="max(100vw, 178dvh)"` accounts for a tall `cover` background, so portrait screens can select the sharper existing derivative instead of upscaling a narrow one.

## Hero implementation

The existing `journal-index-hero` shell preserves the established shared Header behavior. About-specific rules provide flex-column layout with `min-height: 100vh; min-height: 100dvh`. No Header subtraction or fixed maximum height. Content growth is allowed.

The Header overlays the photograph through the unchanged shared rule. Copy padding starts below the Header using `--site-header-block-size` and `--section-block-spacing`, with a viewport-relative Desktop minimum. No second navigation or About-specific Header replacement.

The hierarchy follows the reference: ABOUT, dominant Nick Roust h1, introduction, italic principle with 4 px cyan left rule, two experience indicators and bottom-center cyan arrow. The indicators use a semantic `dl`, with a thin divider and no cards or animated values. Local font clamps preserve the shared font family while scaling the reference hierarchy.

Desktop copy uses a 92% local container above 1200 px to match the reference's left alignment on wide screens; other containers are untouched. Text width is 45% with a 43rem cap. The arrow remains in normal flex flow after the content, with a 44 px target, so it cannot cover the indicators.

### Exact approved copy

Introduction:

> I design and build software systems, mostly in fintech. For more than three decades I've worked across business, engineering and operations — from the first idea to systems running in production.

There are no manual introduction line breaks.

Principle:

> I enjoy complexity when I can understand and control it.

Two phrase spans reproduce the Desktop reference's emphasis. Each phrase can wrap naturally on a narrow screen; accessible text contains the original single space between phrases, with no added quotation marks.

Indicators, fixed Founder-approved values:

- **30+ years** — In business & engineering.
- **5+ systems** — Built and operated.

No inference, counter animation or dynamic calculation. DOM checks verify all text and punctuation exactly in all fourteen cases.

## Responsive decisions

- Desktop: full-viewport Hero; original photograph, text left and subject right. Image position `right top`.
- Tablet 681–1199 px: image position `57% top`; narrower text column and compact indicator spacing. Face remains beside the copy.
- Mobile: image position `56% top`; copy begins below the face using a generous responsive top reserve. A smooth lower scrim supports the longer approved text over the photograph. Text width becomes 100%; indicators remain side by side at 390 px and can stack below 360 px.
- Mobile's complete content requires **858.67 px**. Both 390 × 844 and 390 × 667 grow to that height and scroll normally, with no hidden content.

Desktop gradient:

```css
linear-gradient(90deg,
  rgba(7,19,28,.6),
  rgba(7,19,28,.4) 30%,
  transparent 50%)
```

The original photograph remains recognizable; there is no abrupt fill boundary. Mobile adds a gradual lower dark scrim so the principle and indicators remain legible. No shadow, glow, motion or separate Light photograph.

## Downward navigation and accessibility

The arrow is an anchor named **Explore About** targeting `#about-perspective`. The first existing editorial section gains only that ID and `tabindex="-1"`; its text and structure are otherwise unchanged. A local scroll margin uses Header tokens.

Keyboard Enter updates the hash and focuses that section in every browser case. The link has a visible 3 px focus outline; decorative arrow SVG is hidden from assistive technologies. Exactly one level-one heading, Nick Roust, is confirmed through both DOM and accessibility tree. The photograph is decorative and the HTML independently identifies the author.

## Verification

[Browser results](browser-results.json), [verification script](verify-hero.mjs), [integrity checks](integrity-results.json).

- `pnpm run build`: PASS, 14 static routes, 0 errors / 0 warnings. One pre-existing unused-import hint remains in the older About review script. [Build log](build.log).
- Existing tests: **11 passed / 0 failed**. [Test log](tests.log).
- `git diff --check`: PASS.
- Fourteen viewport/theme cases passed full copy checks, Header/copy clearance, content order, indicators/arrow separation, image loading, no horizontal overflow and no text clipping.
- Desktop 1920, 1440 and 1366 Hero heights equal their viewport heights. No excess second viewport or clipped short-screen content.
- An estimated face rectangle from the original photograph remains inside the crop, below Header and outside the text rectangles in all fourteen cases; screenshots were also visually reviewed.
- Native keyboard arrow navigation passes in every case.
- About, Journal, PG27 and FakeBank routes return HTTP 200 locally.
- Original photograph, reference, web derivatives and all other pre-existing source files match their preflight hashes. Editorial content matches byte-for-byte after excluding the permitted first-section anchor attributes.

Browser `Chrome/156.0.8078.79`, DPR 1. Existing isolated local Chromium was used because the Browser plugin runtime was unavailable. Fonts and images finished loading before capture. Contrast observations are visual review, not an automated WCAG certification.

| Viewport | Theme | Rendered Hero height | Result |
|---|---|---:|---|
| 1920 × 1080 | dark | 1080.00 px | PASS |
| 1920 × 1080 | light | 1080.00 px | PASS |
| 1440 × 900 | dark | 900.00 px | PASS |
| 1440 × 900 | light | 900.00 px | PASS |
| 1366 × 768 | dark | 768.00 px | PASS |
| 1366 × 768 | light | 768.00 px | PASS |
| 1024 × 768 | dark | 768.00 px | PASS |
| 1024 × 768 | light | 768.00 px | PASS |
| 768 × 1024 | dark | 1024.00 px | PASS |
| 768 × 1024 | light | 1024.00 px | PASS |
| 390 × 844 | dark | 858.67 px | PASS |
| 390 × 844 | light | 858.67 px | PASS |
| 390 × 667 | dark | 858.67 px | PASS |
| 390 × 667 | light | 858.67 px | PASS |

## Review screenshots

- [Desktop 1920 Dark](desktop-1920-dark.png).
- [Desktop 1440 Dark](desktop-1440-dark.png).
- [Desktop 1440 Light](desktop-1440-light.png).
- [Desktop 1366 Dark](desktop-1366-dark.png).
- [Tablet 1024 Dark](tablet-1024-dark.png).
- [Tablet 768 Dark](tablet-768-dark.png).
- [Mobile 390 Dark](mobile-390-dark.png).
- [Mobile 390 Light](mobile-390-light.png).
- [Mobile 390 short Dark](mobile-390-short-dark.png).
- [Complete Mobile Hero](mobile-complete-hero.png).
- [Hero copy close-up](hero-copy-closeup.png).
- [Full-page Desktop](desktop-full-page.jpg).
- [Approved reference beside implementation](reference-comparison.png).

### Reference comparison

The comparison sheet uses the mockup solely as a labeled review image. Live composition preserves its order, left alignment, italic cyan-accented principle, paired indicators, subject on the right and bottom arrow. The live page uses the actual approved photograph and unchanged global Header, with natural responsive text wrapping; the mockup's exact camera crop and embedded typography are not substituted for them. On portrait screens, the motorcycle is partly cropped to retain the face and readable content.

## Final state

No deviations outside authorized scope. Only About Hero and the minimal first-section anchor changed. Remaining Founder decision: visual approval of this local v2.1 implementation. Existing editorial sections await their separate editorial task.

**ABOUT HERO v2.1 IMPLEMENTED — AWAITING FOUNDER VISUAL REVIEW.**
