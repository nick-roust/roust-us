# Product Routes & Sidebar v2.0

**PASS — awaiting Founder review.** All applicable local route migrations and shared navigation are complete, with no unresolved functional navigation defects. No commit, push, deployment or publication.

## Preflight

Repository: `/home/nickk/roust-us`.
Branch: `feat/pf005-roust-us-mvp`.
Initial/final HEAD: `b3c60e8d13b3e66ee999a8aa7376add701be6848`.

The working tree was already dirty, including the existing FakeBank Product Page/Hero and Journal Index. Their unrelated work was preserved. [Initial complete Git state](initial-state.json), [final complete Git state](final-state.json).

Root `AGENTS.md` and the ED807 workspace rules were read. The task's explicit canonical BIK route supersedes the older root routing description while preserving `/bik/` as a compatible incoming URL. Research code and private inputs remain unchanged.

## Route inventory and canonical mapping

| Project | Previous route | Canonical route | Preserved content / sections |
| --- | --- | --- | --- |
| FakeShop | `/labs/fake-shop/` | Same | Existing retained status text; Overview |
| FakeBank | `/labs/fake-bank/` | Same | Complete existing Product Page; existing six Sidebar anchors |
| PG27 | `/building-paymentgate/` | `/projects/pg27/` | Existing Building PaymentGate Hero and project-preparation panel; Overview / Project details |
| BIK / ED807 | `/bik/` | `/labs/bik-ed807/` | Existing research-stage paragraphs and Tools link; Overview |

[Preflight inventory](route-inventory.md), [canonical mapping](canonical-route-mapping.json), [content-preservation checks](content-preservation.json).

No canonical Product Page is missing. FakeShop, PG27 and BIK have limited existing status content rather than full new product narratives; no speculative content, sections or illustrations were invented. [Missing-page/content inventory](missing-pages.md).

## Files

Created:

- `src/components/ProductSidebar.astro`: shared Sidebar markup, scoped styles and hash navigation.
- `src/layouts/ProductLayout.astro`: simple Sidebar/content shell for existing smaller pages, with no Product Hero implementation.
- `src/pages/projects/pg27.astro`: migrated PG27 content.
- `src/pages/labs/bik-ed807.astro`: migrated BIK content.
- This review directory.

Modified:

- `src/pages/labs/fake-bank.astro`: replace only the local Sidebar/script/styles with the shared component and add canonical metadata. Hero v2.0.1 and content are unchanged.
- `src/pages/labs/fake-shop.astro`: wrap existing content with the shared navigation shell and add its real Overview anchor/canonical.
- `src/pages/building-paymentgate.astro`, `src/pages/bik.astro`, `src/pages/projects/paymentgate.astro`: compatibility redirects.
- `src/layouts/SiteLayout.astro`: optional canonical-path prop, used only on the four Product Pages; Header markup unchanged.
- `src/components/Navigation.astro`: canonical Product Page active states and `/journal/` destination.
- `src/pages/index.astro`: only PG27/BIK Systems Overview destinations updated.
- `src/pages/tools.astro`: BIK link updated.
- `src/pages/labs/index.astro`: existing FakeBank/FakeShop links normalized to canonical trailing-slash URLs.
- `README.md`: relevant route documentation updated.

No source files removed. No global CSS/token, dependency, collection, Hero abstraction, original SVG or image changes. Source/asset/research checksum comparison: [integrity-results.json](integrity-results.json).

## Shared Sidebar

The component keeps FakeBank's existing visual foundation. It accepts the active project, real section list and optional current section. A single explicit four-entry project list owns canonical destinations and verified OSS flags; no project database or generalized router.

Active project appears first, followed by its real sections. Other projects retain the approved relative order FakeShop → FakeBank → PG27 → BIK / ED807. Hash-based current-section highlighting, focus transfer and Back/Forward updates are supported without scroll-spy.

Desktop Sidebar is sticky. Below 1024 px the same native `details`/`summary` pattern supplies compact Product Navigation. Native disclosure semantics expose expanded/collapsed state to accessibility APIs. Opening/closing and navigation work with Enter; selecting a section closes the control before scrolling. Header offsets remain correct. No new global navigation or burger menu.

OSS is small secondary text without a badge background or decorative icon. `aria-label="Open Source Software"` exposes its expanded meaning in the accessibility tree, independently of hover.

## OSS evidence

Both repositories were inspected read-only:

| Project | License evidence | Inspected revision |
| --- | --- | --- |
| FakeShop | `LICENSE` and `package.json`: Apache-2.0 | `f6e90101440b28c3cd1e77bf8a15b81b5043ac77` |
| FakeBank | `LICENSE` and `package.json`: Apache-2.0 | `8d4e828723b557143e8a6e3d2d14fd16968ee061` |

Exact license-file hashes: [oss-evidence.json](oss-evidence.json). PG27 and BIK receive no OSS classification.

## Redirects and SEO

| Legacy URL | Destination |
| --- | --- |
| `/building-paymentgate/` | `/projects/pg27/` |
| `/projects/paymentgate/` | `/projects/pg27/` |
| `/bik/` | `/labs/bik-ed807/` |
| `/projects/` | `/#systems` |

The existing `/projects/` redirect remains intact; no catalog or empty page was created. The extra PaymentGate alias redirects directly to canonical PG27, avoiding a redirect chain through the retired route.

- DEV: all slash/no-slash variants verified as HTTP 301 with the expected Location.
- Static build: Astro emits a zero-delay HTML meta refresh, canonical URL, `noindex` and a visible fallback link. Local production preview serves those documents with HTTP 200, then the browser reaches the correct target. This is **not** a verified host-level HTTP 301.
- No deployment platform or production redirect provider is configured in this repository. Host-neutral permanent redirect rules are prepared in [hosting-redirect-rules.json](hosting-redirect-rules.json), explicitly unapplied. Provider-specific configuration requires knowing the deployment target.
- Each canonical Product Page has exactly one matching `rel="canonical"`; legacy copies do not repeat product content and carry `noindex`. [Static canonical metadata](static-metadata-verification.json), [redirect verification](redirect-verification.json).

## Internal links and protected behavior

Homepage Systems Overview, the Labs portal and the Tools BIK link use canonical destinations. Product switching does likewise. Header order stays About · Building · Projects · Journal · Contact; Projects is active on all four Product Pages. Building remains `/#building`, Projects `/#systems`, Journal `/journal/`; no default active item on Home.

[Internal-link verification](internal-link-verification.json).

The Homepage Building CTA stays exactly **Follow the progress → `/journal`**. Its component source, content and destination were not changed. Homepage composition, Featured FakeBank, Journal, PG27 wordmark, Contact and Footer remain intact. Legacy paths remain only in redirect handling, compatibility matching and documentation, rather than outgoing product links.

## Verification

- `pnpm run build`: PASS, 0 errors, 0 warnings, 0 hints; 14 static routes. [Build log](build.log)
- Existing tests: **11 passed**. [Test log](tests.log)
- `git diff --check`: PASS.
- Four Product Pages × 390/768/1024/1440/1920 × Light/Dark: **40 cases PASS**. Canonicals, active project/section, ordered destinations, correct OSS flags, valid anchors, unique IDs, native keyboard section navigation, Header clearance, history Back/Forward and no horizontal overflow checked. [Browser results](browser-results.json)
- Additional native project switching at 390/1440, visible keyboard focus, sticky Sidebar geometry, accessible OSS meaning and native expanded-state checks PASS. [Accessibility and static-preview results](accessibility-production-results.json)
- FakeBank Hero HTML, bounds and overlay, plus all content-section HTML/bounds, match the initial baseline at every width/theme. [FakeBank baseline](fakebank-baseline.json)
- PG27/BIK/FakeShop paragraphs and title/description metadata are unchanged. No research/source inputs or technology assets modified.

Browser QA uses isolated local Chromium. Images were decoded before review captures. Live hosting/deployment was neither changed nor claimed as tested.

## Screenshots

- [FakeBank Desktop Dark — 1440](fake-bank-1440-dark.jpg)
- [FakeBank Desktop Light — 1440](fake-bank-1440-light.jpg)
- [FakeBank Mobile Dark — 390](fake-bank-390-dark.jpg)
- [FakeBank Mobile Light — 390](fake-bank-390-light.jpg)
- [PG27 Desktop Sidebar](pg27-1440-dark.jpg)
- [BIK Desktop Sidebar](bik-ed807-1440-dark.jpg)
- [Expanded Mobile Product Navigation](mobile-product-navigation-expanded.jpg)
- [Existing FakeShop status page / Sidebar](fake-shop-1440-dark.jpg)

## Remaining decisions and limitations

No functional navigation gaps remain in the local/static implementation. Full product narratives for the status-only pages require separate content approval. A real deployed HTTP 301 requires provider-specific hosting configuration once a deployment platform is selected. No deviations involving new content, images or Hero redesign.

**PRODUCT ROUTES & SIDEBAR v2.0 IMPLEMENTED — AWAITING FOUNDER REVIEW.**
