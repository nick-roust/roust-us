# Preflight route inventory

| Project | Existing route | Target | Existing content | Action |
| --- | --- | --- | --- | --- |
| FakeBank | `/labs/fake-bank/` | Same | Product page, Hero v2.0.1, six sidebar anchors | Extract Sidebar, preserve content |
| FakeShop | `/labs/fake-shop/` | Same | Existing retained status text | Reuse content, Overview-only Sidebar |
| PG27 | `/building-paymentgate/` | `/projects/pg27/` | Existing Hero and project-preparation status | Migrate content; redirect legacy URL |
| BIK / ED807 | `/bik/` | `/labs/bik-ed807/` | Existing research-stage text, no banking records | Migrate content; redirect legacy URL |

Additional alias `/projects/paymentgate/` is a retained-message link to Building PaymentGate. `/projects/` already emits an Astro redirect to `/#systems`. No deployment provider is configured; output is static. Homepage Building CTA is `/journal` and must remain unchanged.
