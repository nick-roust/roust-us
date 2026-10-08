# Architecture decisions

## Accepted for the foundation

1. Use Astro with strict TypeScript, static output, Astro components and plain CSS. No framework integration or server adapter is required for these informational pages.
2. Use a shared layout, navigation and card component. Keep section routes explicit and use verified-content-pending text for project/lab detail pages.
3. Keep the public BIK route at `/bik` and internal research at `tools/bic/`. No alias or alternative public route is introduced.
4. Store original ED807 inputs in `data/ed807/`, outside `public/` and application imports. Preserve bytes and record checksums. `dist/` belongs exclusively to generated output.
5. Preserve the existing ZIP as well as the required XML relocation, so the first build cannot delete either input.
6. The foundation deferred converters, data contracts, banking records and live tool behavior. Subsequent ADRs below govern the approved contract, update strategy and offline converter. Publication remains deferred. The current `/bik` page is an informational research status page.
7. Keep PG27, Fake Bank and Fake Shop repositories outside this site's scope.
8. Keep original XML and ZIP files local and excluded from Git. Version checksums, documentation and subsequently authorized offline converter code/tests; never commit datasets or official schema archives. Original source exclusion was set during GitHub initialization.

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

Daily checking is the approved target cadence. Enabling it depends on confirming the official download mechanism. BIC-R6 [acquisition research](acquisition.md) records the observed HTTP mechanism, constraints and remaining deployment-environment questions. This ADR approves the target strategy; BIC-I1 implements only offline conversion under ADR-BIC-003. Downloader, update workflow and JSON publication remain deferred. The existing Astro static architecture remains unchanged.

## ADR-BIC-002 — Public ED807 JSON Contract

Status: **APPROVED by Human Architect**. Approval date: 2026-10-08. Project: roust.us / BIK Directory.

| Component | Approved decision |
| --- | --- |
| Format | `roust.bic.ed807` |
| Contract version | `1.0.0` |
| Primary entity | `participants[]` |
| Source field names | Official ED807 names |
| Identifiers | Strings, preserving leading zeros |
| BIC | Lookup key within a snapshot |
| UID | Separate identifier |
| Accounts / SWBICS | Nested arrays |
| Restrictions | Preserved |
| Record order | Original XML order |
| MVP profile | Complete FIRR |
| Historical formats / SIRR | Deferred |
| Source identity | XML SHA-256 |
| Release identity | Separate from source identity |
| Backend / database | Not required |

Error handling and preservation of the last valid version are approved. Failed acquisition, validation, conversion or publication must not replace it. A **mandatory legal review before public release** is approved; contract approval alone is not permission to publish banking datasets.

The [BIC-R7 contract document](json-contract-proposal.md) retains the original mapping, examples and analysis. This ADR supersedes its pending approval status for the decisions expressly recorded above. Remaining engineering details, diagnostic severities and publication mechanisms are not implicitly approved. No JSON Schema, converter, dataset or public release is created by recording this decision.

## BIC-R8 — Converter Technology & Implementation Design

Status: **Design reviewed; offline subset approved through ADR-BIC-003 and BIC-I1.**

The [converter design](converter-design.md) retains the original technology comparison and proposed pipeline. The offline subset is implemented; acquisition and release sections remain future designs, not callable capabilities.

## ADR-BIC-003 — Offline Converter Technology & Implementation

Status: **APPROVED by Human Architect**. Recorded on 2026-10-08 from the BIC-I1 authorization.

| Component | Approved decision / implementation scope |
| --- | --- |
| Technology | Python, lxml, argparse, unittest, standard JSON serializer |
| Input | Local XML/ZIP only; preserve original bytes and compute SHA-256 |
| Schema | Official ED807 2026.09.0 package; verify archive and dependency fingerprints; resolve only approved dependencies |
| Source profile | Complete FIRR; reject SIRR, multipart and unsupported historical profiles |
| Mapping | Contract v1.0.0, all source-order occurrences/attributes, nested Accounts/SWBICS/restrictions, unresolved references preserved |
| ERROR | XML/XSD failure, unsupported profile, mapping/count mismatch, duplicate BIC, parent-reference cycles |
| WARNING | Unresolved references, duplicate UID, unknown official code descriptions |
| INFO | Repeated account numbers, participants without accounts |
| Serialization | Compact UTF-8, sorted object keys, original array order, no BOM/NaN/Infinity, exactly one LF |
| Output | Private staging only; no release promotion or public publication |
| Tests | unittest with security, official-XSD, mapping, diagnostics, deterministic and real-source regression coverage |
| Excluded scope | HTTP downloader, update workflow, promotion, website UI, backend/database, external repositories |

BIC-I1 selects Python 3.14 (tested 3.14.4), lxml 6.0.2 and a hash-pinned Linux x86_64 wheel installed only into `tools/bic/.venv/`. Enforced R8 input limits: XML 32 MiB, ZIP 16 MiB, decompressed ZIP content 32 MiB, 16 ZIP entries, XML depth 32. The Linux CLI also applies a 120-second deadline and an implementation-selected 1 GiB address-space ceiling. These resource budgets are engineering limits, not ED807 schema constraints.

Offline candidates use manual-import provenance with unknown download metadata as null. `metadata.publication.publishedAt` is null because publication has not occurred; a candidate is not a released dataset. The JSON byte hash reported by the CLI identifies that private candidate, not a public release. No release identity/promotion mechanism is implemented. Mandatory legal review remains a prerequisite for future public release under ADR-BIC-002.

The current implementation is documented in the [workspace README](../README.md). Future acquisition, release transaction, automatic refresh and historical handling still require separate tasks.

## Decisions still required

- Schema release acceptance policy and original input provenance. Official 2026.09.0 XSD compatibility was established in BIC-R2; compatibility alone does not identify the generating release.
- Future runtime/schema upgrades and resource-budget changes; the initial offline stack, limits and severity policy are recorded above.
- Pipeline packaging, invocation and durable update-state storage under the approved CLI/GitHub Actions strategy; publication timestamp and atomic release promotion details.
- Release naming and reproducibility details. XML source identity, separate release identity, source order and complete FIRR MVP are approved; historical formats/SIRR remain deferred.
- Legal review outcome, publication/redistribution permissions and treatment of any fields requiring redaction. Loss-aware contract requirements must not be silently changed to accommodate redaction.
- Long-term local source retention and backup policy.
- Tool interface and accessibility requirements once actual functionality is authorized.

Hosting, deployment and verified project/lab descriptions also remain open at the website level. This initialization makes no external integration or service capability claims.
