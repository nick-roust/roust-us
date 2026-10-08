# roust.us

A personal website foundation built with Astro, TypeScript and plain CSS. Output is static; no frontend framework or server adapter is installed.

## Development

Requires Node.js 22.12 or later and pnpm 11.0.9 (recorded in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run build
pnpm run preview
```

`pnpm run build` runs `astro check` before producing `dist/`. Configuration sets the intended site URL to `https://roust.us`; deployment is not configured or performed. Astro TypeScript setup follows the [official documentation](https://docs.astro.build/en/guides/typescript/).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Three-section home page |
| `/about` | About page; biography pending |
| `/projects` | Projects index |
| `/projects/paymentgate` | PaymentGate page; verified content pending |
| `/tools` | Developer Tools index |
| `/bik` | BIK directory research status |
| `/labs` | Labs index |
| `/labs/fake-bank` | Fake Bank page; verified content pending |
| `/labs/fake-shop` | Fake Shop page; verified content pending |

## Structure and boundaries

`src/pages/` contains routes, `src/layouts/` the document shell, `src/components/` shared navigation and cards, and `src/styles/` plain CSS. `public/` is reserved for intentionally published assets. `tools/bic/` contains ED807 research documentation; the public route remains `/bik`.

`data/ed807/` holds original XML and ZIP files, outside the public tree. No converter, output schema or banking-data JSON has been created. The source XML is not imported by the website. PG27, Fake Bank and Fake Shop repositories are outside this task and have not been modified.

`dist/` is disposable build output. Both original files were moved out before the first build; SHA-256 was verified before deleting each source. Check them with:

```sh
cd data/ed807
sha256sum -c SHA256SUMS
```

See [source preservation](tools/bic/docs/source-research.md) for original paths and hashes, [data-model questions](tools/bic/docs/data-model.md), and [architecture decisions](tools/bic/docs/architecture-decisions.md).

## Git inspection limitation

During the Astro foundation task, `.git/` was empty and read-only in this environment. `git status`, `git log` and `git ls-files --error-unmatch dist/20261008_ED807_full.xml` reported that this was not a Git repository. Tracking status and existing history therefore could not be verified at that time; no Git metadata was changed during that task.

The subsequent authorized GitHub initialization created a repository on branch `main`, with `origin` set to `git@github.com:nick-roust/roust-us.git`. The remote was checked and contained no refs before the first push. `.gitignore` excludes XML and ZIP files, build output, generated types, dependencies and local environment files. Original banking inputs stay local; their checksum manifest and research documents are versioned. GitHub Pages, domain connection and CI are deferred to separate tasks.

## Open decisions

- Verified biography, descriptions and external URLs for project/lab pages.
- Hosting provider and deployment workflow.
- ED807 provenance, specification/version, redistribution terms, model, validation and update policy (tracked under `tools/bic/docs/`).

## Foundation verification

Verified on 2026-10-08 with Node.js 24.15.0 and pnpm 11.0.9: `pnpm run build` passed with zero Astro diagnostics and generated all nine routes. `pnpm peers check` found no peer dependency issues. Generated HTML was checked for navigation, resolving local links, titles, a single page heading and the main-content skip target. Both source checksums still matched after the build, and neither source file nor any banking-data JSON appeared in `public/` or `dist/`.
