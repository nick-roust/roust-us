# FakeBank Visual Integration v1.0 — Homepage Scope

Status: **BLOCKED — CURRENT HOMEPAGE FEATURED SECTION NOT PRESENT**. Image preparation is complete; Homepage integration and visual acceptance are pending the actual target implementation. This is not a completion claim.

The Founder scope correction excludes the Project Page. No project page was created, modified or redesigned, and its implementation state is not a blocker for this task.

## Current target inspection

Repository `/home/nickk/roust-us`, branch `feat/pf005-roust-us-mvp`, HEAD `f83c9dfec07a5dd14b9d3f0edbc0dc4a1e32dca2`, with pre-existing uncommitted site work preserved.

The current `src/pages/index.astro` contains Homepage Hero, Open Source, conditional Journal, and Building. FakeBank appears as a link in Open Source; there is no Homepage Featured FakeBank image, label, description/technology-stack block or corresponding image container to replace.

A previous Featured Fake Bank block exists at commit `c3a1b26`, but later commit `4ad93ed` contains Open Source instead. Restoring that earlier block would change the current homepage composition/content rather than replace an image, and was not performed. The currently remote feature-branch HEAD also matches `f83c9df`; remote main is the older Astro foundation at `347b9d463f83aec668942855e6599b19ed5ad04f`.

Required input: the current approved Homepage v2.1 implementation containing Featured FakeBank, or its exact file/branch/checkout location. No layout, content or section-order substitution has been invented.

## Approved source and shared derivatives

Exact source: `design/references/Стеклянный фасад над горами на закате.png`.

- Dimensions: **1199 × 1312 px**, RGB.
- Original bytes: 1814601.
- SHA-256: `0beeb60ce0fde1a219a12cf0737469d978cdb9dc2d0334e670f14af6848ef7e6`.
- Reference PNG is unchanged. No artistic changes, crops, enlargement, effects or regeneration were made.

One shared derivative family was generated through the installed ImageMagick pipeline, using proportional resizing only: WebP method 6 / quality 88, AVIF speed 6 / quality 60, stripped metadata. No dependency was added. Asset sizes preserve native proportions subject to integer-pixel rounding.

| Asset under `public/images/` | Dimensions | Bytes |
| --- | --- | --- |
| `fakebank-reflective-facade-512.avif` | 512 × 560 | 17325 |
| `fakebank-reflective-facade-512.webp` | 512 × 560 | 36132 |
| `fakebank-reflective-facade-768.avif` | 768 × 840 | 29702 |
| `fakebank-reflective-facade-768.webp` | 768 × 840 | 67194 |
| `fakebank-reflective-facade-1199.avif` | 1199 × 1312 | 51606 |
| `fakebank-reflective-facade-1199.webp` | 1199 × 1312 | 121234 |

The full-size source remains available for future authorized Project Hero reuse; no separate artistic version was created. These derivative assets are prepared but not referenced by any page yet. Final sizes/object-position must be selected against the real Featured image container.

## Verification and limits

- Applicable AGENTS.md, initial Git status, homepage/component references, current Project Page and image pipeline were inspected before preparation.
- `pnpm run build`: PASS; Astro check zero errors/warnings/hints; 12 static pages generated. All six optimized assets appear in the generated output and match their public copies byte-for-byte.
- `git diff --check`: PASS.
- Integrity snapshot confirms all pre-existing source files/assets and the approved PNG are unchanged. Homepage, Project Page, Journal, PG27, global CSS and dependencies were not modified.
- Responsive crop, Light/Dark readability, target-section browser measurements and the three Homepage review screenshots remain **unverified**, because the actual Featured section is absent. No unrelated Open Source screenshot is presented as evidence of Featured integration.
- Only six prepared web assets and this review directory were added. No commit, push or deployment was performed.

Evidence: [source record](source-image.json), [generated assets and checksums](generated-assets.json), [initial status](git-status-before.txt), [final status](git-status-after.txt).
