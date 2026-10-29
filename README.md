# roust.us

A personal engineering site built with Astro, TypeScript, and plain CSS. It uses static output and has no server adapter or application backend.

## Development

Requires Node.js 22.12 or later and pnpm 11.0.9.

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run check
pnpm run build
pnpm run preview
```

`pnpm run build` runs `astro check` and generates static files in `dist/`. Hosting, DNS, TLS, and production deployment are not configured by this repository.

## Launch MVP routes

| Route | Purpose |
| --- | --- |
| `/` | Home, featured system, journal status, Building PaymentGate, and contact status |
| `/projects` | Systems and projects |
| `/journal` | Verified published articles; currently empty |
| `/building-paymentgate` | PaymentGate project status and updates |
| `/labs/fake-bank` | Fake Bank project detail; technical content is pending verification |

Existing routes remain available while navigation changes: `/about`, `/projects/paymentgate`, `/tools`, `/bik`, `/labs`, and `/labs/fake-shop`. The BIK research route remains `/bik`; its workspace remains `tools/bic/`.

## Themes and assets

The site supports Light, Dark, and System themes. System follows `prefers-color-scheme`; an explicit choice is stored in `localStorage`. The theme selector uses native buttons and the site remains statically generated.

`brand/master/` contains the original ROUST CSE SVG masters. Copies used by the site are under `public/brand/`; `roust-name-white.svg` changes only the source wordmark fill, preserving its path geometry. Original approved photographs remain under `brand/photography/`. Optimized WebP derivatives are served from `public/images/`; the originals are unchanged.

`design/references/` contains the four approved visual references. They are design guidance, not factual evidence. Do not reuse mockup copy, metrics, URLs, API examples, technology lists, or service claims without verification.

## Content and data boundaries

Biography, contact details, and social profile URLs are omitted until approved and verified. Project capabilities, service status, and external links are added only with evidence. Hosted tools are independent services; Fake Bank is not part of this site's runtime.

Original ED807 XML and ZIP inputs stay in `data/ed807/`, outside `public/`, application imports, and generated routes. Do not publish the inputs or derived banking records. Follow `tools/bic/AGENTS.md` for ED807 work.

`dist/`, `.astro/`, and `node_modules/` are generated and ignored. Never store source files in `dist/`.
