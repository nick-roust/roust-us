# Footer Monogram — Muted

Status: PASS; ready for visual review.

The footer now uses `public/brand/roust-monogram-muted.svg` with fill `#A8B4C0`, derived from the approved `brand/master/roust-monogram-white.svg`. Its single path and `viewBox="0 0 128 128"` are preserved exactly; only `fill="#fff"` changes to `fill="#A8B4C0"`. The earlier color-derived candidate was superseded because its separate triangles produced visible internal edges. The original colored asset and every brand master are unchanged.

White master SHA-256: `6fea796d0193078b178df40a080b42760efbbf36a2e7dd18160fed88c2de13f4`.

Only `src/components/SiteFooter.astro` changed among existing files: its image URL points to the new derivative. No stylesheet or other component changed.

The footer background remains `#101b26` in both Light and Dark themes. The muted light-gray mark is therefore used in both; a graphite mark would lose contrast on the actual footer background. No background/theme redesign was introduced.

Checks passed:

- Center alignment and dimensions unchanged: 48 × 48 CSS px at 1440; 40 × 40 CSS px at 390.
- Exact before/after geometry comparison for footer, copyright, monogram link, Back to top and all main homepage sections; no horizontal overflow.
- Accessible link name remains `ROUST.US home`; decorative image retains empty alt.
- Light/Dark verified at both widths; screenshots saved for all four combinations.
- `pnpm run build`: 12 static pages, zero errors/warnings/hints. `git diff --check`: clean.
- Integrity snapshot confirms all existing files except SiteFooter.astro unchanged. Generated SVG matches the public derivative.

Review screenshots: [Desktop Light](footer-1440-light.png), [Desktop Dark](footer-1440-dark.png), [Mobile Light](footer-390-light.png), [Mobile Dark](footer-390-dark.png).

Measurements: [before](before.json), [after](after.json). Git state: [before](git-status-before.txt), [after](git-status-after.txt).

No commit, push or deployment was performed.
