# Hero Image Provenance

The Founder-approved original is `a_wide_cinematic_landscape_scene_a_dramatic_moun.png` in this directory. Its original bytes are preserved and its SHA-256 is recorded below.

| Property | Value |
| --- | --- |
| Format and dimensions | PNG, 1938 × 812 px |
| File size | 1,956,497 bytes |
| SHA-256 | `ef789aceab5593ba87bc563ea4fb79d8dd9feb795efa14533d3d5f0632a62db9` |
| Use | Founder-approved ROUST.US home page Hero image |

Responsive AVIF and WebP derivatives in `public/images/` are generated with `sh scripts/generate-hero-images.sh`. The script requires ImageMagick with WebP and AVIF delegates. It keeps the desktop source at its original aspect ratio and crops a 530 × 812 px mobile composition from x=1350, y=0, without upscaling.

The original is retained here for provenance and is not copied into `public/`.
