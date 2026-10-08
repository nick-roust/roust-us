# Architecture decisions

## Accepted for the foundation

1. Use Astro with strict TypeScript, static output, Astro components and plain CSS. No framework integration or server adapter is required for these informational pages.
2. Use a shared layout, navigation and card component. Keep section routes explicit and use verified-content-pending text for project/lab detail pages.
3. Keep the public BIK route at `/bik` and internal research at `tools/bic/`. No alias or alternative public route is introduced.
4. Store original ED807 inputs in `data/ed807/`, outside `public/` and application imports. Preserve bytes and record checksums. `dist/` belongs exclusively to generated output.
5. Preserve the existing ZIP as well as the required XML relocation, so the first build cannot delete either input.
6. Defer converters, data contracts, banking records and live tool behavior. The current `/bik` page is an informational research status page.
7. Keep PG27, Fake Bank and Fake Shop repositories outside this site's scope.
8. Keep original XML and ZIP files local and excluded from Git. Version the checksum manifest and research documentation only. This policy was set during the GitHub initialization task.

## ADR-BIC-001 — Data Acquisition & Update Strategy

Status: **APPROVED by Human Architect**. Recorded on 2026-10-08.

| Component | Approved decision |
| --- | --- |
| Source | Official Bank of Russia ED807 |
| Scheduled update | Daily check |
| Force update | Manual GitHub Actions run |
| Manual import | CLI accepting local XML/ZIP |
| Processing | One shared pipeline for all modes |
| Validation | XSD plus data-integrity checks |
| Publication | Only after successful validation |
| History | Versioned JSON |
| Update failure | Preserve the last valid version |
| Backend / database | Not required for MVP |

Daily checking is the approved target cadence. Enabling it depends on confirming the official download mechanism. BIC-R6 [acquisition research](acquisition.md) records the observed HTTP mechanism, constraints and remaining deployment-environment questions. This ADR approves the target strategy; the current task authorizes research and documentation only, not a downloader, update workflow, converter or JSON publication. The existing Astro static architecture remains unchanged.

## BIC-R7 — Public JSON contract proposal

Status: **PROPOSED — pending Human Architect review. NOT APPROVED.**

The [public ED807 JSON contract proposal](json-contract-proposal.md) records a candidate envelope, direct official field mapping, occurrence-preserving arrays, snapshot-scoped identity, provenance/event metadata, deterministic serialization, representative source excerpts and measured size estimates. No JSON Schema, converter, production dataset or public contract release is created. ADR-BIC-001 remains approved; approval of this separate wire contract is still required.

## Decisions still required

- Schema release acceptance policy and original input provenance. Official 2026.09.0 XSD compatibility was established in BIC-R2; compatibility alone does not identify the generating release.
- Derived model and validation rules, supported by source evidence.
- Future parser/tool location, secure XML handling and resource limits.
- Pipeline packaging, invocation and durable update-state storage under the approved CLI/GitHub Actions strategy.
- Full/incremental and historical-schema handling, record/version identity and reproducibility. Daily cadence and preservation of the last valid version are approved above.
- Publication/redistribution permissions and which derived fields may be exposed.
- Long-term local source retention and backup policy.
- Tool interface and accessibility requirements once actual functionality is authorized.

Hosting, deployment and verified project/lab descriptions also remain open at the website level. This initialization makes no external integration or service capability claims.
