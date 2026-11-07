# Journal Hero Completion v1.0

**PASS — FIVE JOURNAL HEROES INTEGRATED — AWAITING FOUNDER VISUAL REVIEW.**

## Source images and mapping

| Article slug | Exact reference PNG under `design/references/` | Dimensions | Source SHA-256 |
| --- | --- | --- | --- |
| `307-hours-for-one-invoice` | `Грандиозный машинный зал гидроэлектростанции.png` | 1774 × 887 | `09fc1528cc93c8dc25b501a730efa572059fe1f30cd9b1393e01790329be3279` |
| `platform-node-integration` | `Строительство моста на закате.png` | 1774 × 887 | `d93929b3f31bf906d0e4733a53171f47a06f0b9ac378d1db8898032aa7d68b0c` |

Both original PNG files remain byte-identical. Sources were inspected before conversion. No regeneration, redraw, substitution, enhancement, color adjustment or image text was introduced.

## Modified files and generated assets

Only the hero metadata changed in existing files:

- `src/content/journal/307-hours-for-one-invoice.md`: added the hydroelectric hall hero and descriptive alt text.
- `src/content/journal/platform-node-integration.md`: replaced its previous reused bridge hero with the supplied construction image and descriptive alt text.

| New asset under `public/images/journal/` | Dimensions | Bytes | Article |
| --- | --- | --- | --- |
| `invoice-hidden-foundation-hydroelectric-hall.webp` | 1774 × 887 | 310678 | Invoice / The Hidden Foundation |
| `platform-node-bridge-construction.webp` | 1774 × 887 | 340108 | Protocol / The Construction Site |

Converted with the installed ImageMagick/WebP pipeline: `magick <source> -strip -define webp:method=6 -quality 88 <destination>`. The full 2:1 source framing is retained, without enlargement or raster cropping. No dependency was added. The resulting files are approximately 303 and 332 KiB versus the original 2.5–2.6 MiB PNG files.

The current Journal template uses a single WebP image rather than srcset. This implementation follows that existing pipeline, leaving the template and schema untouched. Existing `object-fit: cover` and object-position rules provide responsive cropping. No alternate-resolution variants or global CSS adjustments were introduced. The existing absolute image positioning and hero dimensions reserve layout space independently of the download.

## Verification

- `pnpm run build`: PASS; 12 static pages generated; Astro check returned zero errors, warnings and hints.
- `git diff --check`: PASS.
- Both local DEV routes return HTTP 200 in every checked viewport/theme: `/journal/307-hours-for-one-invoice/` and `/journal/platform-node-integration/`.
- Eight target-article checks: 1440 and 390 px, Light and Dark. Image loading, full native dimensions, responsive cropping, one HTML H1, historical date text, heading/body boundaries and absence of horizontal overflow all passed. Recorded layout shift was 0 in every check.
- Visual inspection confirms readable white titles and the retained existing overlays. The construction gap remains visible on Desktop and Mobile. The hall retains its machinery, structural depth and restrained industrial appearance.
- Actual hero boxes: Invoice 1425 × 544 CSS px at Desktop viewport 1440; 390 × 512 at Mobile. Protocol 1425 × 571.14 at Desktop; 390 × 540.59 at Mobile. Desktop content width excludes its scrollbar. These dimensions follow the unchanged shared template and title wrapping.
- The other three current article heroes were also rendered for the contact sheet and remain unchanged in both metadata and file bytes.
- Integrity verification covers all eight Journal files: bodies are byte-identical and all metadata except the two target hero fields is unchanged. Dates, slugs, titles, draft/publication status and homepage selection are preserved. The five current articles remain `status: draft`, `draft: true`; no publishedAt was assigned. HTTP 200 refers to DEV, not public publication.
- Of 75 protected existing files, only the two target Markdown files changed. The other 73, including sources, existing images, template, content schema, styles, homepage and branding, are unchanged.
- Production WebP copies match their public source files byte-for-byte. No commit, push or deployment occurred.

## Review artifacts

- [Invoice — Desktop, Light](invoice-desktop.png)
- [Invoice — Mobile, Dark](invoice-mobile.png)
- [Protocol — Desktop, Light](protocol-desktop.png)
- [Protocol — Mobile, Dark](protocol-mobile.png)
- [Five-hero contact sheet](five-heroes-contact-sheet.png): comparable rendered desktop panels; review artifact only, outside public assets.

Both themes were checked at both widths; four screenshots retain the requested Desktop/Mobile views. Five individual rendered hero crops are saved as `contact-*.png` for contact-sheet provenance.

Machine-readable evidence: [source dimensions and hashes](source-images.json), [article baseline](article-baseline.json), [browser results](browser-results.json), [integrity and generated asset hashes](verification-results.json).

## Final Git state

Branch: `feat/pf005-roust-us-mvp`. The checkout retains its pre-existing tracked modifications and untracked source/assets/reviews. This task adds two WebP assets and this review directory, and changes hero metadata in the two existing untracked article files. No unrelated work was staged or changed.

[Initial Git status](git-status-before.txt) · [Final Git status](git-status-after.txt).
