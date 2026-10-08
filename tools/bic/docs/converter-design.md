# BIC-R8 — Converter technology and implementation design

Design date: 2026-10-08. Status: **Offline subset approved through ADR-BIC-003; implemented in BIC-I1.**

This document retains the original R8 design and its historical PROPOSED labels. [ADR-BIC-003](architecture-decisions.md#adr-bic-003--offline-converter-technology--implementation) and the [README](../README.md) govern the actual offline implementation. Acquisition, release promotion, durable state and publication remain deferred. The module layout and CLI below are original design candidates, not a list of installed commands.

This technical design follows approved [ADR-BIC-001 and ADR-BIC-002](architecture-decisions.md) and the [contract mapping](json-contract-proposal.md). It authorizes no implementation, dependency installation, data publication or workflow change. APPROVED applies only to the decisions in those ADRs; VERIFIED below means observed evidence, PROPOSED means an engineering recommendation, UNKNOWN means unverified behavior, and DECISION REQUIRED identifies a remaining review item.

## Evidence and methodology

**VERIFIED:** reviewed the workspace rules, README, source research, conceptual model, acquisition research, contract proposal, architecture decisions and actual XML. Both original inputs match `data/ed807/SHA256SUMS`. Read-only inspection revalidated the XML with the official 2026.09.0 XSD dependency closure, with zero errors. No converter or JSON dataset was generated.

The current environment has Python 3.14.4, lxml 6.0.2 and libxml2 2.15.2. This is the tested research environment, not a portability or deployment guarantee. The official schema package in temporary storage has SHA-256 `3ca5333743462c7ccce34914765c15d45b1f26e3ca227f75f04bce01062e3566`; the four dependency fingerprints are recorded in [source research](source-research.md#official-xsd--obtained-and-verified).

The input contains 1382 participants, 1339 accounts, 288 SWBICS, 294 participant restrictions and 71 account restrictions. There are 199 participants without accounts, repeated account numbers across participants, and one unresolved AccountCBRBIC. These are regression expectations for this fingerprint, not constraints on every future document. XML/XSD validity does not prove provenance, completeness, freshness or all conditional business rules.

Primary technology documentation inspected on 2026-10-08:

- [lxml validation](https://lxml.de/validation.html): XMLSchema validation and validator error logs.
- [lxml parsing](https://lxml.de/parsing.html): explicit parser options and handling of encoded XML bytes.
- [lxml resolvers](https://lxml.de/resolvers.html): custom resource resolution.
- [lxml installation](https://lxml.de/installation.html): binary distributions and native build dependencies.
- [libxmljs2 upstream](https://github.com/marudor/libxmljs2): Node libxml bindings, native build requirements and its current maintenance notice.
- [xmldom upstream](https://github.com/xmldom/xmldom): JavaScript DOM parsing/serialization APIs, which do not constitute an XSD validator.
- [Python JSON documentation](https://docs.python.org/3/library/json.html): serializer controls for escaping, sorting, separators and finite numbers.

Documentation establishes API capabilities, not a comparative performance benchmark. No new package was installed; TypeScript validators and GitHub-runner behavior were not tested.

## Technology comparison and recommendation — PROPOSED

| Criterion | Python + lxml | TypeScript + Node XML stack |
| --- | --- | --- |
| Official XSD | One XML/XSD engine; actual ED807 dependency closure already validated | Requires an XSD-capable dependency or separate validator; DOM parsing alone is insufficient |
| Source encoding | Parse original bytes, respecting XML declaration | Must verify original-byte decoding behavior of the selected stack, including WINDOWS-1251 |
| Resource resolution | Explicit lxml resolver API already used in research | Must prove equivalent deny-by-default schema/entity resolution in the chosen validator |
| Packaging | Additional Python runtime; lxml is native and wheel/build availability must be pinned and tested | Reuses website language/runtime; native libxml bindings still add installation complexity |
| Validation diagnostics | Structured validator log available | Depends on the selected engine and wrapper |
| Maintenance | Inspect and pin the actual implementation release before installing | libxmljs2 upstream currently says it is no longer maintained; do not choose it as the default |
| Browser/frontend | Separate offline tool, no Python in website runtime | Separate offline tool; no XML/XSD library needs to enter browser bundles |
| Tests | Standard-library unittest sufficient for MVP | Node test runner is possible; validator compatibility remains untested |

Recommend **Python + lxml.etree.XMLSchema**, with standard-library argparse, hashlib, json, zipfile, unittest and HTTP facilities. Avoid objectify/type inference and XML-to-dictionary libraries: explicit mapping preserves lexical attribute strings and occurrence order. This recommendation is an inference from verified source validation and available APIs, not a claim that TypeScript cannot meet the contract.

**PROPOSED initial runtime baseline:** the tested Python 3.14 / lxml 6.0.2 combination. Before implementation, select exact Python patch and lxml wheel hashes for the target runner, record linked libxml2 version, and run the full acceptance suite in a clean environment. No production pin or package manifest is created here. If those artifacts are unsuitable, re-evaluate the baseline rather than relying on an unbounded latest version. Keep Python packaging under `tools/bic/`; leave Astro's Node/pnpm dependencies unchanged.

**UNKNOWN:** clean-runner installation, cross-platform behavior, memory/time measurements and long-term runtime maintenance suitability. lxml is a native library too; selecting Python does not remove that operational dependency.

## Proposed modules and dependency boundaries

The following paths describe future files; none are created by this design:

```text
tools/bic/
  pyproject.toml                 tool package and immutable converter version
  requirements.lock             reviewed exact dependency hashes
  src/bic/
    cli.py                      argument parsing and exit status
    acquisition.py              scheduled/force HTTP acquisition only
    inputs.py                   bounded XML/ZIP reading and fingerprints
    schema.py                   trusted schema closure and resolver
    validation.py               profile, integrity and diagnostics
    mapping.py                  explicit ED807-to-contract projection
    serialization.py            deterministic candidate bytes
    release.py                  separate release preparation/promotion
  tests/
    unit/                       synthetic cases generated by test code
    integration/                offline official-XSD and local-source checks
    publication/                failure and concurrency scenarios
  docs/                         design and evidence
```

Conversion accepts immutable source bytes and explicit metadata; it never performs HTTP requests or writes website assets. Acquisition only stages private source artifacts. Release handling consumes verified candidates and cannot call a permissive alternative converter. Share one validation/mapping pipeline across all modes. No runtime backend/database, Astro import, route change or deployment service is needed.

**PROPOSED schema provisioning:** operator-supplied, fingerprint-checked official archive stored outside public/build output. Compile the exact four-member 2026.09.0 closure using a virtual base URL and an allowlisted resolver. Reject every other resource; never load a schema URL supplied by input XML. Preserve the older base-types member actually included in that package. Keep schema acquisition separate from data acquisition; no automatic switch to a newly discovered XSD. Vendoring official schemas requires a reviewed redistribution decision and is not performed here.

## Shared processing pipeline — PROPOSED

1. Stage input privately and read bounded bytes without rewriting the original. Hash XML bytes before decoding; for ZIP, also hash archive bytes and record the selected member name. Check a provided checksum manifest strictly; a manually supplied hash is integrity evidence, not proof of official origin.
2. For ZIP, inspect entries without extracting paths. MVP accepts exactly one non-directory XML member; reject ambiguous members, encryption, unsupported compression, CRC failure or unsafe paths. Enforce declared and actual decompressed-byte limits; never trust central-directory sizes alone.
3. Parse original XML bytes with explicit `resolve_entities=False`, `load_dtd=False`, `no_network=True`, `attribute_defaults=False`, `recover=False`, `huge_tree=False`. Install a deny-all external resolver for input parsing. Reject a DOCTYPE/internal subset and unresolved entity nodes before mapping; do not rely on a raw ASCII substring check across encodings. Never invoke XInclude, XSLT or a fallback HTML parser. Network disabling alone is not the complete local-resource policy.
4. Verify qualified root ED807 and supported namespace; validate against the pinned official XSD. Report malformed XML separately from schema compilation and document validation failures. Do not apply schema defaults or reserialize XML before hashing.
5. Enforce the approved complete FIRR profile. Reject SIRR, unsupported historical releases and multipart inputs requiring aggregation. A schema-valid FIRR tag alone does not prove message completeness; review applicable conditional rules, source context and header requirements. Preserve optional InitialED metadata when supported; never invent missing BusinessDay.
6. Check integrity and mapping coverage. Traverse explicit qualified elements; check every accepted attribute/child is mapped or documented as excluded serialization metadata. A new structural field blocks conversion until reviewed, rather than being silently discarded. Count all participant/account/SWIFT/restriction occurrences before and after projection.
7. Preserve all accepted participant and account occurrences, source field strings, missing/empty distinction, nested arrays, restrictions, owner nesting and reference strings. Do not filter by type, status, names or account presence. Do not repair identifiers or classify every participant as a bank.
8. Serialize and validate candidate counts/types; write candidate and diagnostics atomically in private staging. These outputs are not a public release. Advance accepted source/HTTP state only in coordination with successful release promotion.

**PROPOSED initial engineering limits:** 32 MiB source XML, 16 MiB ZIP, 32 MiB actual total decompressed content, at most 16 ZIP entries, XML depth 32, 5 HTTPS redirects and a 120-second worker budget. These are tunable resource policies, not official ED807 constraints. Bound memory through a separately supervised worker; benchmark its memory budget before enabling automation. Exceeding limits rejects the whole candidate and preserves the last good release. Do not enable huge_tree to bypass limits. The known 0.68 MiB XML fits, but broader future source sizes are UNKNOWN.

## CLI interface — PROPOSED

These are future interface examples, not working commands. `PRIVATE_*` denotes an operator-chosen private path outside `public/`, `dist/` and tracked source inputs. No command overwrites an original input.

```text
python -m bic prepare --mode scheduled --state PRIVATE_STATE --schema-package OFFICIAL_XSD_ZIP --staging PRIVATE_DIRECTORY
python -m bic prepare --mode force --state PRIVATE_STATE --schema-package OFFICIAL_XSD_ZIP --staging PRIVATE_DIRECTORY
python -m bic prepare --mode manual --input LOCAL_XML_OR_ZIP --schema-package OFFICIAL_XSD_ZIP --staging PRIVATE_DIRECTORY [--checksums MANIFEST]
python -m bic convert --input LOCAL_XML_OR_ZIP --schema-package OFFICIAL_XSD_ZIP --metadata PRIVATE_EVENT_RECORD --staging PRIVATE_DIRECTORY
python -m bic release --candidate PRIVATE_CANDIDATE --state PRIVATE_STATE --published-at UTC_TIMESTAMP --legal-review REVIEW_RECORD --destination REVIEWED_RELEASE_DIRECTORY
```

`prepare` orchestrates acquisition/input reading and the shared converter. Scheduled uses the accepted HTTP validator; force omits conditional headers but keeps validation/deduplication. Manual has no network access. `convert` supports offline reproducible conversion using a supplied, validated event record. `release` is a distinct operation with no acquisition side effects. Do not introduce a force-validation bypass. Future scheduled and workflow_dispatch wrappers invoke the same CLI; they are not implemented now.

Record actual requested/resolved URLs and download time only for network acquisition. Manual imports use manual provenance and null unknown acquisition values, consistent with the contract proposal. Freeze conversion time once per candidate and retain it for retries. Publication time is supplied at release preparation and retained for a repeated attempt; never reuse BusinessDay as an event timestamp.

Stdout provides a compact machine-readable operation result (`candidate-ready`, `unchanged`, `released`, `failed`), stderr Russian explanatory diagnostics. Neither stream dumps source XML or banking records. Detailed private diagnostics include stable code, severity, stage, source fingerprint, XML line/path, occurrence index and relevant identifier; cap repeated messages while retaining total counts. Library diagnostic wording is not the stable API.

| Proposed exit code | Meaning |
| --- | --- |
| 0 | Completed operation, including an explicitly reported unchanged result |
| 2 | Invalid CLI arguments |
| 10 | Acquisition/input/archive/checksum failure |
| 20 | XML parsing or forbidden resource/DOCTYPE |
| 30 | Trusted schema compilation or XSD validation failure; distinct diagnostic codes |
| 40 | Unsupported release/profile or unmapped structure |
| 50 | Blocking integrity failure |
| 60 | Conversion/serialization/staging failure |
| 70 | Release gate, concurrent state conflict or promotion failure |

Retries apply to bounded transient acquisition errors, not deterministic XSD/integrity failures. Follow [BIC-R6](acquisition.md) for TLS, 429/Retry-After, conditional 304 and validator-state rules. An unconditional force download with identical XML does not create new history. An accepted 304 without a known matching state requires an unconditional retrieval, not a new candidate inferred from nothing.

## Integrity and diagnostics — PROPOSED

| Check | Proposed behavior |
| --- | --- |
| Hash mismatch, malformed XML, XSD failure, unsupported profile | ERROR; reject candidate |
| Dropped/unmapped attribute or occurrence, count mismatch, numeric source identifier | ERROR; reject candidate |
| Duplicate BIC | Preserve occurrences in diagnostic projection; ERROR blocks release because unique snapshot lookup is ambiguous |
| Duplicate UID | Preserve occurrences; WARN pending evidence of universal uniqueness |
| Repeated account number/identical account records | Preserve every occurrence; informational count, never deduplicate |
| Unresolved or ambiguous AccountCBRBIC / SuccessorBIC / PrntBIC | Preserve original value; WARN, do not fabricate target |
| Parent cycle | Preserve fields; ERROR for release under proposed integrity policy |
| Schema-valid code without a reviewed official label | Preserve code; WARN, no invented meaning |
| Backward business date / changed same-date version | Hold promotion for explicit rollback/revision policy review |
| Empty full directory or anomalous count decrease | Hold promotion for review; no sample-derived universal count requirement |

**DECISION REQUIRED:** approve this severity policy and conditional business validation rules. In particular, treating every missing servicing reference as fatal would reject the verified supplied file. Warnings must remain visible in release evidence; a policy change must not be hidden in force mode. Array occurrence identity uses source XML hash plus zero-based participant/account positions; it is not a historical identity guarantee. Build BIC/UID multimaps for checks without replacing the authoritative arrays.

## Deterministic serialization and release identity — PROPOSED

Use the approved `roust.bic.ed807` / `1.0.0` envelope and official field mapping. Preserve source array order at every level. Sort object keys by code point, emit compact UTF-8 without BOM, disable ASCII-only escaping, forbid NaN/Infinity, and append exactly one LF. Python json controls are `sort_keys=True`, `ensure_ascii=False`, `allow_nan=False`, `separators=(',', ':')`. Do not trim, normalize Unicode, parse source numbers/dates or substitute absent attributes with null. Generate required empty repeated arrays; preserve valid present empty strings.

Determinism is conditional on the same original bytes, XSD/profile, converter build and event metadata. Hold timestamps fixed in regression tests and rebuilds. Conversion and publication times are event facts, not inputs derived from the current clock on every serialization call. Unknown source download time stays unknown.

**PROPOSED release identity:** SHA-256 of final public JSON bytes, recorded in an external release manifest rather than a self-hash in that JSON. Source identity remains original XML SHA-256. Publication metadata changes release bytes without changing source identity. Track converter version, contract version, XSD/package fingerprint and validation evidence with each release. The staged pre-publication candidate has its own private byte hash; adding publication metadata requires reserialization and a new final hash.

Use immutable release paths containing the final release hash and a separate current reference. Filename convention, manifest wire format and public path require review; no JSON Schema is proposed. Deduplication compares source identity plus processing/contract identity, so a reviewed converter correction can produce a new release from unchanged XML. A routine unchanged download cannot change timestamps just to manufacture history.

## Conversion versus publication — PROPOSED

Acquisition, parsing and conversion run in private staging without public write access. A candidate includes provenance, counts, validation result, warnings and fingerprints. Publication requires successful validation, approved integrity policy, a recorded legal-review outcome applicable to the fields and intended distribution, and an explicit release operation. Legal review must resolve redistribution and any person-related field treatment; required redaction needs an architect-reviewed contract revision, not silent data loss.

Promotion prepares immutable final bytes and their manifest, verifies hashes again, and only then replaces the current reference. On a local filesystem, stage on the same filesystem and use atomic replacement; a Git-based publication must commit history, reference and accepted state together. These mechanisms do not prove atomic deployment on an unspecified host: hosting behavior remains UNKNOWN. Keep old release files available, compare expected previous state before promotion, and serialize scheduled/force/manual promotion. A conflict aborts rather than overwrites a newer release.

Durable accepted state must include the current source/release hashes, processing identity, known HTTP resource/validator, validated document metadata and release evidence. Commit/update accepted validators with successful promotion, not after merely downloading invalid content. Keep check-at observations separate from released-at facts. Initial failure means no valid release exists; subsequent failure retains the previous valid release. No rollback, partially written current file or guessed empty dataset is a valid fallback.

**DECISION REQUIRED:** choose durable state storage and target deployment transaction. A small versioned project-owned manifest is compatible with the no-database MVP; its location, Git policy and fields must be reviewed before implementation. No publication/update workflow or hosting configuration is added now.

## Tests and fixtures — PROPOSED

Start with standard-library unittest; no pytest dependency is needed for the proposed MVP. Generate clearly named synthetic XML/ZIP cases in temporary directories at test runtime. Do not commit fabricated banking JSON or copy the original directory into fixtures. Synthetic names must explicitly indicate test data, with no unnecessary personal information. Private real-source integration checks require locally supplied files; skip with an explicit reason when unavailable. Mandatory CI uses offline provisioned official schema fingerprints and synthetic tests, not daily source downloads. Schema provisioning/redistribution approval precedes that CI change.

| Test group | Required acceptance cases |
| --- | --- |
| Input integrity | XML and ZIP resolve to identical XML hash; modified bytes, manifest mismatch, CRC/truncation fail without altering originals |
| Archive handling | Multiple XML members, traversal names, encrypted/unsupported members and oversized decompression reject; no repository extraction |
| Parser isolation | External network/local-file entities, internal DOCTYPE, malformed XML and alternate encodings cannot bypass policy; no resource access |
| Official schema | Compile exact dependency closure offline; missing/altered member fails; invalid attributes/cardinality fail |
| Profile | Complete FIRR accepted; SIRR, partial multipart and unsupported historic headers rejected without inferred values |
| Preservation | Leading zeros, alphabetic account character, missing versus valid empty, optional fields, zero/multiple accounts, SWBICS and restrictions preserved in source order |
| Relationships | Duplicate account occurrences retained; duplicate BIC/UID and unresolved/ambiguous/cyclic references yield reviewed diagnostic severity, never deletion |
| Mapping coverage | Newly introduced structural field cannot disappear silently; counts and each source attribute match the mapped projection |
| Serialization | Fixed input/event metadata yields identical bytes across repeated processes; UTF-8, key order, escaping and one LF checked against small synthetic expected bytes |
| Acquisition state | 304 only with accepted state; force unchanged does not create history; network/validation failure does not advance validators |
| Publication | Legal gate enforced; failure at each write/promotion boundary retains current; repeated attempt is idempotent; concurrent stale state cannot overwrite newer release |
| Local regression | Exact supplied fingerprint yields 1382 participants, 1339 accounts, 199 zero-account participants, 288 SWBICS, 294/71 restrictions and the known unresolved reference |

These tests remain a specification; no test files or production functions are created. Before release, run the suite in the pinned runner and measure peak memory, worker duration and full candidate size. The R7 compact size estimate is about 0.77 MiB, not a runtime benchmark or a resource guarantee.

## Review and implementation sequence

1. **DECISION REQUIRED:** approve Python/lxml choice, exact runtime/dependency artifacts, resource budgets, schema acceptance and diagnostic severities. Confirm supported full-FIRR conditional rules.
2. Implement offline bounded input handling, trusted XSD validation, explicit mapping and serialization with synthetic tests. This requires a separate implementation task; do not start from this design approval alone.
3. Add private local-source integration checks and verify the fixed-source regression without committing source or output datasets.
4. Implement scheduled/force/manual preparation around the same converter, durable state and failure tests; verify runner reachability before enabling a daily schedule.
5. Design and test separate release promotion. Complete mandatory legal review before any public release; confirm hosting transaction, history paths and rollback/revision policy.

**UNKNOWN:** historical identifier stability, unresolved servicing-reference cause, complete conditional-rule coverage, source freshness guarantees, deployment atomicity, clean-runner performance and legal-review outcome. Historical formats/SIRR remain deferred under ADR-BIC-002; they are not prerequisites for offline complete-FIRR implementation.

## Verification of this design delivery

Verified on 2026-10-08: both original input hashes match SHA256SUMS; the manifest matches its committed bytes. Official XSD validation passed with zero errors. `pnpm run build` passed with zero errors, warnings or hints and produced nine static pages. Local documentation file links resolve, and `git diff --check` passed. Public/build output contains no XML, ZIP or JSON dataset files.

Only four Markdown documents changed: this design, architecture-decisions.md, the approval annotation in json-contract-proposal.md and the workspace README. No converter, JSON Schema, dataset, fixture, dependency, update workflow, route or external repository changed. No Git commit or push is part of this design delivery.
