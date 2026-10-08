# roust.us development rules

## Architecture

- This is a TypeScript Astro website with explicit static output, Astro components and plain CSS.
- `src/pages/` owns file-based routes. `src/layouts/SiteLayout.astro` owns the document shell; `src/components/` owns shared UI; `src/styles/global.css` owns shared styles.
- The three main sections are Projects (`/projects`), Developer Tools (`/tools`) and Labs (`/labs`). `/about` is a separate informational page.
- The BIK page is `/bik`; its research workspace is `tools/bic/`. Keep this deliberate naming distinction.
- `public/` contains only assets intentionally safe for public distribution. Everything there is copied to the build.
- `data/ed807/` contains preserved source inputs and checksums. It is outside the public asset and application import paths.
- `dist/`, `.astro/` and `node_modules/` are generated and ignored. Never store source files in `dist/`.

## Development

- Write comments and explanations in Russian.
- Write code and documentation in English.
- Use Node.js 22.12 or later and pnpm 11.0.9. Keep `pnpm-lock.yaml` in sync; use `pnpm install --frozen-lockfile` for reproducible installs.
- Run `pnpm run build` before delivery; it runs Astro type checking and static generation. `pnpm run dev` and `pnpm run preview` serve locally.
- Prefer small reusable Astro components and semantic HTML. Keep navigation keyboard accessible, with a skip link and visible focus styles.
- Do not add React, Vue, Tailwind, server adapters, server routes or runtime services for this foundation.
- Preserve existing files and Git history. Inspect Git state before changes; do not reset, rewrite history or create a replacement repository when metadata is unavailable.
- Do not invent biography, project capabilities, external URLs or live service status. Use explicit pending-content text until verified content is supplied.

## Boundaries

- Do not modify PG27, Fake Bank or Fake Shop repositories. Pages here are website descriptions only.
- Do not import, copy or expose the original ED807 XML or archive through `public/`, generated routes or `dist/`.
- Preserve original source bytes and SHA-256. Verify copies before deleting originals; if verification fails, keep originals intact. Check Git tracking before any source relocation.
- Follow `tools/bic/AGENTS.md` for ED807 work. This foundation does not authorize a converter, JSON Schema, banking-data fixtures or published banking records.
- Read the research and decision documents before proposing later tool implementation. Keep unknowns explicit rather than selecting unsupported banking semantics.
