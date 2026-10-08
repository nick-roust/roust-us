# Offline ED807 converter

The website route is `/bik`; the converter workspace is `tools/bic/`. ADR-BIC-001, ADR-BIC-002 and ADR-BIC-003 are approved. BIC-I1 implements **offline conversion only**. No HTTP downloader, update workflow, release promotion, public dataset, backend/database or website search UI is implemented.

## Environment and reproducible installation

Supported baseline: **CPython 3.14, Linux x86_64, glibc >= 2.26**, **lxml 6.0.2**. Tested Python: 3.14.4. The hash-pinned PyPI wheel links libxml2 2.14.6. Other platforms are not qualified; the CLI checks Python minor and lxml version. All Python dependencies stay under this workspace; Astro dependencies are unchanged.

From `tools/bic/`, with Python 3.14 and a system pip supporting `--python`:

```sh
python3.14 -m venv --without-pip .venv
python3.14 -m pip --python .venv install --only-binary=:all: --require-hashes -r requirements.lock
```

System pip is the installer; lxml is installed only into `.venv`. `--without-pip` supports environments lacking ensurepip. The lockfile permits exactly the selected CPython 3.14 manylinux wheel SHA-256, not a source build. To install offline, obtain that wheel separately:

```sh
python3.14 -m pip --python .venv install --no-index --find-links /path/to/private/wheels --only-binary=:all: --require-hashes -r requirements.lock
```

The [pip secure-install guide](https://pip.pypa.io/en/stable/topics/secure-installs/) explains hash checking. Dependency acquisition is an installation operation; the converter performs no HTTP requests. `PYTHONPATH=src` runs the source package without packaging/build dependencies.

## External official XSD

Supply the official [UFEBS 2026.09.0 archive](https://cbr.ru/Content/Document/File/123129/UFEBS_v2026_09_0.zip) as a local file. It is not downloaded, vendored or published by the converter. Required package SHA-256:

```text
3ca5333743462c7ccce34914765c15d45b1f26e3ca227f75f04bce01062e3566
```

The exact four-member ED807 dependency closure and individual fingerprints are checked. Only approved virtual schema resources resolve; input XML cannot choose another schema. [Source research](docs/source-research.md) records official URLs and the older base-types member actually included in the package.

## CLI

Create a private staging directory **outside the repository**, owned by the current user with mode 0700. Paths with symlinks and repository/public/build destinations are rejected.

```sh
mkdir -m 700 /tmp/roust-bic-private
PYTHONPATH=src .venv/bin/python -m bic convert \
  --input ../../data/ed807/20261008_ED807_full.xml \
  --schema-package /path/to/private/UFEBS_v2026_09_0.zip \
  --staging /tmp/roust-bic-private \
  --converted-at ACTUAL_UTC_CONVERSION_TIMESTAMP \
  --expected-xml-sha256 b28862aa26ce5063846d7231477b611947afd91bef0c5707f3a26fd8382be779
```

Replace the timestamp placeholder with the recorded conversion event in `YYYY-MM-DDTHH:MM:SSZ` form. Retain it for reproducibility. Local `.zip` input is also supported. Optional `--expected-xml-sha256` checks original XML bytes, including the XML inside ZIP. No source file is modified or extracted to disk.

Each success creates a unique private `ed807-*` directory with `candidate.json`, `diagnostics.json` and a `COMPLETE` marker. Files have mode 0600; directories have mode 0700. The marker follows both completed writes. Failure may leave incomplete private staging without a marker; previous outputs are never overwritten. Stdout reports paths, counts, size and candidate hash; stderr supplies Russian diagnostic explanations without dumping source records.

Exit codes: 0 success, 2 arguments, 10 input/archive/checksum/runtime failure, 20 XML/security failure, 30 XSD failure, 40 unsupported profile/mapping structure, 50 integrity/count failure, 60 metadata/staging/resource failure. Stable diagnostic codes distinguish causes; native error text is not an API.

## Contract and provenance

- Emits `roust.bic.ed807` / `1.0.0`, with metadata and source-order participants.
- Preserves every participant/account/SWBICS/restriction occurrence and official attributes as strings, including leading zeros, dates and lexical booleans. Participants without accounts have empty arrays.
- Missing attributes are omitted; valid present empty strings remain present. No trimming, Unicode normalization, invented classification, repair or deduplication occurs.
- Preserves owner nesting, PrntBIC, AccountCBRBIC and restriction-scoped SuccessorBIC. Snapshot lookup is not historical identity.
- Records original XML hash, optional ZIP hash/member, parser-reported encoding, XML metadata, fixed conversion time, converter version and validating schema version/hash.
- Local imports use `manual-import` with null URL/download time. Expected source organization is not proof of original local provenance.
- Offline candidates have `metadata.publication.publishedAt: null`: no publication event occurred. Their hash identifies a private candidate, not a public release. Future publication requires a separate task and mandatory legal review.

See [contract mapping](docs/json-contract-proposal.md). Standard XML attribute/entity/line-ending normalization is not byte-preserved in JSON; the original bytes remain identifiable by SHA-256. Comments, prefix spellings and processing instructions are not projected. Unexpected structural fields, source text or namespaces reject the candidate.

## Security, limits and diagnostics

XML <= 32 MiB; ZIP <= 16 MiB; total decompressed content <= 32 MiB; <= 16 ZIP entries; XML depth <= 32. ZIP rejects unsafe paths, symlinks/special files, encryption, unsupported compression and duplicate names. Exactly one XML member is required; stored/deflated members are bounded and CRC-checked without extraction. The trusted schema archive has a separate 64 MiB ceiling plus fingerprint checks.

DTD/internal subsets are rejected via parser callbacks, including UTF-16. External entities and network/local resource resolution are disabled. The Linux CLI imposes a 120-second deadline and 1 GiB address-space ceiling. Direct API callers must supervise their own process. Native libxml2 limits remain enabled; CLI has no validation/limit bypass flags.

| Severity | Conditions |
| --- | --- |
| ERROR | XML/XSD/security failures, unsupported profile, mapping/count mismatch, duplicate BIC, parent cycles |
| WARNING | Unresolved/ambiguous references, duplicate UID, unknown official code descriptions |
| INFO | Repeated account numbers, participants without accounts |

Description coverage uses official entries 65–67 and 72–81 for CreationReason, InfoTypeCode, ChangeType, PtType, Srvcs, XchType, RegulationAccountType, statuses and restrictions. It is not an extra closed schema domain or bank classification. Unknown XSD-valid codes remain unchanged and warn. Geographic free-text/code labels are not interpreted. Warnings preserve records; ERROR rejects the entire candidate before output.

## Tests

From `tools/bic/`:

```sh
BIC_SCHEMA_PACKAGE=/path/to/private/UFEBS_v2026_09_0.zip \
  PYTHONPATH=src .venv/bin/python -m unittest discover -s tests -v
```

Synthetic XML/ZIP cases are created at runtime in temporary directories; no XML/JSON fixtures are committed. Official-XSD tests explicitly skip if the external package is absent. The real-source integration test uses the existing original XML, optionally overridden with `BIC_SOURCE_XML`; it alone skips if the source is absent. Skipped official-XSD/integration tests mean incomplete acceptance. No test publishes data.

Regression counts for the original fingerprint: 1382 participants, 1339 accounts, 199 participants without accounts, 288 SWBICS, 294 participant restrictions, 71 account restrictions. These are facts about those bytes, not universal ED807 constraints. Check originals with `sha256sum -c SHA256SUMS` from `../../data/ed807/`.

## Limitations

Only FIRR with supported current headers/namespace and pinned XSD is accepted. Multipart, SIRR and unsupported historical profiles are rejected. FIRR/XSD validity alone does not prove completeness, freshness, official provenance or all conditional business rules. The supplied snapshot has one unresolved servicing reference, retained with a warning. HTTP state, automatic refresh, release/rollback policy and legal-review outcome remain deferred.

## BIC-I1 acceptance record

Verified on 2026-10-08 with Python 3.14.4, lxml 6.0.2 and linked libxml2 2.14.6: 30 unittest tests passed without skips, including the official XSD and original-source regression. Astro build passed with zero errors/warnings/hints and nine static pages. Original XML/ZIP checksums match SHA256SUMS. Public/build output contains no banking XML/ZIP/JSON.

The standalone-XML private candidate, using fixed `convertedAt=2026-10-08T07:40:33Z`, has **804373 bytes**, SHA-256 `beb21d3f5fd9db9e044350e74104ff9facf7ee2fced585a7ff7057a1cfbad715`. Two independent CLI executions produced identical bytes. ZIP import adds archive provenance, so its envelope hash differs despite the same source XML identity. Candidates and official schemas remain outside Git and public assets.

## Documentation

- [Source research](docs/source-research.md)
- [Conceptual model](docs/data-model.md)
- [Acquisition research](docs/acquisition.md)
- [Public contract](docs/json-contract-proposal.md)
- [Architecture decisions](docs/architecture-decisions.md)
- [Original converter design](docs/converter-design.md)
- [Agent rules](AGENTS.md)
