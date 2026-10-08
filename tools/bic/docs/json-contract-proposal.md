# BIC-R7 — Public ED807 JSON contract proposal

Status: **PROPOSED — pending Human Architect review. NOT APPROVED.**

Design date: 2026-10-08. This document proposes a public contract, not a JSON Schema, converter, production dataset or publication. [ADR-BIC-001](architecture-decisions.md#adr-bic-001--data-acquisition--update-strategy) approves the acquisition/update strategy; it does not approve this contract.

## Evidence and goals

**VERIFIED:** [source research](source-research.md), [conceptual model](data-model.md) and [acquisition research](acquisition.md) were reviewed against the supplied XML and the previously downloaded [official Bank of Russia schema archive](https://cbr.ru/Content/Document/File/123129/UFEBS_v2026_09_0.zip). The archive fingerprint and the complete ED807 2026.09.0 dependency closure were rechecked; the source passed XSD validation with zero errors. Original XML/ZIP hashes match SHA256SUMS.

The input has 1382 participant entries, 1339 accounts, 288 SWIFT BIC records, 294 participant restrictions and 71 account restrictions. There are 199 participants without accounts. BIC and UID are each unique here; 31 account-number strings repeat globally. One AccountCBRBIC reference does not resolve within the snapshot. These are sample observations, not universal schema constraints.

**PROPOSED design goals:**

- Preserve every participant and account in an accepted source snapshot, without filtering by participant type, status, account presence or reference resolution.
- Retain source field names, lexical strings and hierarchy; avoid a new bank classification or undocumented translations of codes.
- Use arrays for repeated records, including empty arrays when no such records exist; never collapse lists to a preferred account or SWIFT BIC.
- Separate source/provenance, processing and publication metadata. Make versioning and known limits explicit.
- Support a small static browser-consumable snapshot before adding indexes, normalized duplicates or separate entity files.

**PROPOSED scope:** the first publication profile is a validated, complete, single-message FIRR snapshot using an explicitly supported XSD release. Preserve all records within that accepted scope. Do not publish SIRR changes or one part of a multipart message as if it were a complete directory. Older formats, delta reconciliation and multipart aggregation need separate support decisions; rejection of an unsupported message must leave the last valid publication unchanged.

## Proposed envelope

The format name belongs to roust.us; it is not an official Bank of Russia JSON format. `publicSchemaVersion` versions our contract independently of XML namespace, DirectoryVersion, converter version and the XSD used for validation. `1.0.0` is a proposed initial version, not a released schema.

The outline below uses **types and placeholders**, not valid JSON or banking data:

```text
{
  format: "roust.bic.ed807",
  metadata: {
    publicSchemaVersion: "1.0.0",
    source: {
      organization: "Bank of Russia",
      acquisition: {
        mode: "official-download" | "manual-import",
        requestedUrl: string | null,
        resolvedUrl: string | null,
        downloadedAt: UTC timestamp | null
      },
      artifact: {
        xmlSha256: lowercase hex string,
        archiveSha256?: lowercase hex string,
        archiveMember?: string,
        encoding: XML declaration encoding
      },
      document: {
        rootElement: "ED807",
        namespace: string,
        xmlVersion: string,
        attributes: { ED807 attribute name: original string, ... },
        PartInfo?: { source attribute name: original string, ... },
        InitialED?: { source attribute name: original string, ... }
      }
    },
    processing: {
      converterVersion: immutable release/version identifier,
      convertedAt: UTC timestamp,
      xsdVersion: version actually used to validate,
      xsdPackageSha256: lowercase hex string
    },
    publication: { publishedAt: UTC release timestamp },
    counts: { participantCount: integer, accountCount: integer }
  },
  participants: [ source-mapped participant records ]
}
```

Source records retain official, case-sensitive ED807 names. Envelope metadata uses the project-owned names above. This deliberate distinction minimizes field renaming and preserves correspondence with official documentation. No aliases such as `bankType`, `active`, `correspondentAccount` or inferred country/name fields are added.

### Participant record shape — PROPOSED

Each `participants[]` entry has the BICDirectoryEntry attributes directly on it, exactly one `ParticipantInfo` object, a `SWBICS` array and an `Accounts` array. `ParticipantInfo` carries all its source attributes plus a `RstrList` array. Each account carries its source attributes plus an `AccRstrList` array. SWIFT and restriction records carry their own attributes as strings.

**Attribute absence:** omit the corresponding property. **Present empty attribute:** preserve `""` only if it is valid under the accepted source schema; never convert it to omission, null, a guessed default or a trimmed value. The current input has no empty attributes, and many current XSD types forbid them. A schema-invalid empty value belongs in failure diagnostics, not a successfully published snapshot. `null` is not used for mapped XML attributes.

**Repeated elements:** always materialize `Accounts`, `SWBICS`, `RstrList` and `AccRstrList` as arrays, even when empty. They represent zero occurrences, not a synthetic empty XML record. All counts and positions refer to occurrences; identical account numbers or even identical records remain separate occurrences. No synthetic account is added to participants with `Accounts: []`.

## Complete field mapping — PROPOSED, based on VERIFIED XSD

Notation: `p` is `participants[i]`; `a` is `p.Accounts[j]`. Every mapped XML attribute below remains a JSON **string**, including dates, numeric-looking fields and boolean flags. Only project-generated counts are JSON integers. XSD required/optional status is taken from [the source attribute tables](source-research.md#attributes-official-requirement-versus-observed-presence); sample-wide presence is not a new requirement.

### Document fields

| ED807 source | Proposed destination |
| --- | --- |
| Root local name, namespace, XML declaration version | `metadata.source.document.rootElement`, `.namespace`, `.xmlVersion` |
| Declared encoding | `metadata.source.artifact.encoding` |
| `@EDNo`, `@EDDate`, `@EDAuthor`, optional `@EDReceiver` | Same names under `metadata.source.document.attributes` |
| `@CreationReason`, `@CreationDateTime`, `@InfoTypeCode`, `@BusinessDay`, optional `@DirectoryVersion` | Same names under `metadata.source.document.attributes` |
| Optional `PartInfo/@PartNo`, `@PartQuantity`, `@PartAggregateID` | Same names under `metadata.source.document.PartInfo` |
| Optional `InitialED/@EDNo`, `@EDDate`, `@EDAuthor` | Same names under `metadata.source.document.InitialED` |
| Every `BICDirectoryEntry` occurrence | One `participants[]` occurrence |

PartInfo and InitialED remain representable for reviewed future profiles, but their presence must not cause a partial snapshot to be labeled complete. Their absence in this sample is represented by property omission.

### Participant fields

| ED807 source | Proposed destination | Meaning supported by official field definitions |
| --- | --- | --- |
| `BICDirectoryEntry/@BIC` | `p.BIC` | Participant BIC |
| Optional `BICDirectoryEntry/@ChangeType` | `p.ChangeType` | Source change code; not an inferred operation |
| `ParticipantInfo/@UID` | `p.ParticipantInfo.UID` | Source unique author identifier; retained separately from BIC |
| Optional `ParticipantInfo/@RegN` | `p.ParticipantInfo.RegN` | Registration number; not a uniqueness key |
| Optional `@NameP`, `@EnglName` | Same names in `p.ParticipantInfo` | Source names; no generated translation |
| `@PtType`, `@Srvcs`, `@XchType` | Same names in `p.ParticipantInfo` | Participant classification, service and exchange codes |
| Optional `@ParticipantStatus` | `p.ParticipantInfo.ParticipantStatus` | Participant status, distinct from restrictions |
| `@DateIn`, optional `@DateOut` | Same names in `p.ParticipantInfo` | Source lifecycle dates |
| Optional `@CntrCd`, `@Ind`, `@Tnp`, `@Nnp`, `@Adr`; required `@Rgn` | Same names in `p.ParticipantInfo` | Separate source country, postal, locality, address and region fields |
| Optional `@PrntBIC` | `p.ParticipantInfo.PrntBIC` | Parent organization reference |
| Every `ParticipantInfo/RstrList` occurrence | `p.ParticipantInfo.RstrList[]` | Participant restriction record |
| `RstrList/@Rstr`, `@RstrDate` | Same names on that restriction | Code and source date |
| Every `SWBICS` occurrence | `p.SWBICS[]` | Separate SWIFT identifier record |
| `SWBICS/@SWBIC`, `@DefaultSWBIC` | Same names on that record | Identifier and lexical source boolean (`"0"`, `"1"`, or schema-valid boolean text) |

### Account fields

| ED807 source | Proposed destination | Preservation rule |
| --- | --- | --- |
| Every `BICDirectoryEntry/Accounts` occurrence | One `p.Accounts[]` occurrence | Keep ownership through nesting, including repeated account numbers |
| `Accounts/@Account` | `a.Account` | Original identifier; no numeric coercion |
| `@RegulationAccountType` | `a.RegulationAccountType` | Official code; not a new account category |
| `@AccountCBRBIC` | `a.AccountCBRBIC` | Servicing CBR subdivision BIC, not the owner BIC |
| Optional `@CK` | `a.CK` | Lexical source control key; no new checksum semantics |
| `@DateIn`, optional `@DateOut` | Same names on `a` | Source account dates |
| Optional `@AccountStatus` | `a.AccountStatus` | Source status, separate from restrictions |
| Every `Accounts/AccRstrList` occurrence | `a.AccRstrList[]` | Keep every account restriction |
| `AccRstrList/@AccRstr`, `@AccRstrDate`, optional `@SuccessorBIC` | Same names on that restriction | Successor reference stays scoped to its restriction |

All attributes of the seven element types present in the input, all optional attributes in their official types, and the two optional inherited root children are covered. An unexpected attribute, namespace or child in a newly accepted source release must trigger a coverage review; silently dropping it is prohibited. Prefix spellings, schema-location hints, comments and other XML serialization details are outside this semantic projection and remain traceable through the original-byte hash; support for additional structural metadata must be reviewed rather than guessed.

### Official classifications — VERIFIED versus PROPOSED

**VERIFIED:** PtType distinguishes CBR units, credit organizations, branches, treasury authorities and other participants. `20` means credit organization, not a commercial-bank guarantee. The current file uses 14 participant types and seven account types. Official meanings, observed values and complete shared XSD enumerations are documented in [source research](source-research.md#dataset-counts-and-code-observations--verified--file).

**PROPOSED:** transmit the unchanged code strings. Do not embed a second classification system or collapse PSAC/ACAC into boolean flags. Labels, if later needed, should come from versioned official code documentation outside the core snapshot. Common XSD enums are not automatically field-specific business-rule enums; for example RequestCodeType also admits PROF while the researched ED807 table identifies FIRR/SIRR. New official codes must not make a consumer discard the participant.

## Identity and relationships — PROPOSED

| Question | Proposed rule | VERIFIED / UNKNOWN boundary |
| --- | --- | --- |
| Source snapshot identity | `metadata.source.artifact.xmlSha256`, over the original XML bytes | Identifies bytes, not a stable organization or semantic equivalence across differently serialized XML |
| Participant lookup | Snapshot-scoped BIC lookup; return all matching array positions, with the common unique case yielding one | Unique here; universal uniqueness and lifetime stability are not established by the inspected XSD |
| Participant occurrence identity | Source XML SHA-256 plus participant array index | Lossless locator within one artifact, not a persistent identifier across snapshots |
| UID role | Secondary source identifier/lookup; retain as string, never substitute for BIC | Unique here, but cross-snapshot stability and equivalence to BIC are UNKNOWN |
| Account identity | Source XML SHA-256 plus participant index and account index | Preserves occurrences and duplicates without declaring account number globally unique |
| Convenient account lookup | Owner BIC plus Account, returning all matches | Unique here; not a universal uniqueness constraint or replacement for occurrence identity |
| Account owner | Enclosing participant occurrence | Distinct from AccountCBRBIC; do not infer ownership from the servicing BIC |
| Parent reference | `ParticipantInfo.PrntBIC` points into the same snapshot's BIC lookup | All 466 resolve here; two-level chains occur |
| Account service reference | `Accounts.AccountCBRBIC` points into the same snapshot's BIC lookup when available | One unresolved reference and one CBDC self-reference occur here |
| Successor reference | Restriction-scoped `AccRstrList.SuccessorBIC` | Seven resolve here; the field is not a universal account/participant successor |

Retain unresolved strings unchanged. Do not fabricate a participant, set the reference to null, delete the owner/account or resolve against today's directory when viewing historical data. Resolve within the selected snapshot; a missing or ambiguous target produces a diagnostic. UI consumers should show the original identifier and an unresolved/ambiguous indication, not an invented name.

Do not use an object keyed solely by BIC or account number as the authoritative payload: object insertion would overwrite duplicates. A consumer-created index may be a multimap. **DECISION REQUIRED:** publication severity for duplicate BIC/UID, unresolved references and cycles. The proposed representation preserves occurrences regardless; any publication rejection must reject the candidate as a whole without dropping records or replacing the last valid version.

Historical snapshots have independent identity scopes. No guaranteed stable BIC/UID/account lifecycle is inferred. Displaying the same identifier in two snapshots is not proof that the same legal entity/account persists. A historical diff or cross-snapshot merger is outside this contract proposal. The 2018 sample discussed in acquisition research lacks BusinessDay despite the same namespace; do not manufacture missing dates or claim it conforms to the current profile.

## Metadata model — PROPOSED

| Field | Origin and intended semantics |
| --- | --- |
| `format` | Project-owned constant `roust.bic.ed807` |
| `metadata.publicSchemaVersion` | Public contract version, initially proposed as `1.0.0`; not an official XSD release |
| `source.organization` | Expected source organization, Bank of Russia; not cryptographic proof that a manual import is authentic |
| `source.acquisition.mode` | Actual official-download or manual-import mode, recorded by the pipeline |
| `source.acquisition.requestedUrl`, `.resolvedUrl` | Exact public official URLs actually requested/resolved, or null when not known/applicable; never insert a guessed URL for a local import |
| `source.acquisition.downloadedAt` | Client-observed UTC completion time of the actual download, or null for a local import without an evidenced download time; never substitute Last-Modified or EDDate |
| `source.artifact.xmlSha256` | SHA-256 of original XML bytes before decoding or reserialization; lowercase 64-character hex |
| `source.artifact.archiveSha256`, `.archiveMember` | Present when the acquisition/import used a ZIP; distinguish archive hash from XML hash; omit for standalone XML |
| `source.artifact.encoding` | Declaration encoding, WINDOWS-1251 in the current input; JSON output is UTF-8 |
| `source.document.attributes.EDDate` | Source document date as a string |
| `source.document.attributes.BusinessDay` | Business date as a separate string; not replaced by publication/download date |
| Other source document attributes/children | All fields in the mapping above, including creation time and intraday DirectoryVersion |
| `processing.converterVersion` | Immutable converter release identifier, eventually recorded during real processing; no converter/version is created by this task |
| `processing.convertedAt` | UTC conversion event timestamp, recorded during real processing |
| `processing.xsdVersion`, `.xsdPackageSha256` | Actual validation release and dependency-package fingerprint; never labeled the generating source version |
| `publication.publishedAt` | Publisher-issued UTC release timestamp, fixed on first successful release; not proof of the first successful HTTP response from a host |
| `counts.participantCount` | Number of array entries; 1382 for the supplied input |
| `counts.accountCount` | Sum of every Accounts array length, including duplicate numbers; 1339 here |

Acquisition nulls explicitly mean unknown/not applicable; mode disambiguates local import from a known official download. They do not represent missing XML attributes. Published processing/publication timestamps must be actual recorded events, not nulls or illustrative placeholders. Use RFC 3339 UTC timestamps ending in Z for pipeline events; retain source date/time strings as parsed without reinterpretation.

The R6 response matched the original local bytes, but the original acquisition timestamp remains UNKNOWN. Do not use the HTTP Date header as a fabricated exact client-download time. Do not export absolute local paths, credentials, tokens, temporary paths or per-user identifiers as provenance. Keep operational Last-Modified/ETag, check timestamps and verbose failure diagnostics in separate update state; unchanged checks must not mutate immutable snapshot metadata.

## Representative source examples — VERIFIED values, PROPOSED JSON mapping

The following three excerpts are documentation examples only, not complete public snapshot documents, not production fixtures, and not declarations of a released contract. All displayed source fields are copied verbatim from the supplied XML. RstrList, SWBICS and AccRstrList arrays shown below represent actual zero child occurrences. Postal/locality/address components and other omitted source attributes are omitted **only for brevity in these excerpts**, not removed by the proposed contract. Examples use institutional names; no individual names or street addresses are reproduced. No synthetic banking identifiers are inserted.

### Example 1: Participant with one account

Source locator: XML SHA-256 recorded in source research, BIC `042202115`, zero-based BICDirectoryEntry position 354. All 1 account occurrences are shown.

```json
{
  "Accounts": [
    {
      "AccRstrList": [],
      "Account": "40102810845370000115",
      "AccountCBRBIC": "042202001",
      "AccountStatus": "ACAC",
      "CK": "21",
      "DateIn": "2025-12-17",
      "RegulationAccountType": "UTRA"
    }
  ],
  "BIC": "042202115",
  "ParticipantInfo": {
    "DateIn": "2025-12-17",
    "NameP": "УФК по Вологодской области",
    "ParticipantStatus": "PSAC",
    "PtType": "52",
    "Rgn": "19",
    "RstrList": [],
    "Srvcs": "3",
    "UID": "0000000005",
    "XchType": "1"
  },
  "SWBICS": []
}
```

### Example 2: Participant without accounts

Source locator: XML SHA-256 recorded in source research, BIC `042581002`, zero-based BICDirectoryEntry position 144. All 0 account occurrences are shown.

```json
{
  "Accounts": [],
  "BIC": "042581002",
  "ParticipantInfo": {
    "DateIn": "1994-01-20",
    "NameP": "ПУ БАНКА РОССИИ ЗЕЛЕНОГОРСКОЕ",
    "ParticipantStatus": "PSAC",
    "PrntBIC": "045004001",
    "PtType": "40",
    "Rgn": "25",
    "RstrList": [],
    "Srvcs": "3",
    "UID": "2581002000",
    "XchType": "1"
  },
  "SWBICS": []
}
```

### Example 3: Participant with multiple accounts

Source locator: XML SHA-256 recorded in source research, BIC `040397100`, zero-based BICDirectoryEntry position 0. All 2 account occurrences are shown.

```json
{
  "Accounts": [
    {
      "AccRstrList": [],
      "Account": "40116810900000010001",
      "AccountCBRBIC": "040397002",
      "AccountStatus": "ACAC",
      "CK": "99",
      "DateIn": "2013-02-25",
      "RegulationAccountType": "TRSA"
    },
    {
      "AccRstrList": [],
      "Account": "40116810903970010002",
      "AccountCBRBIC": "040397002",
      "AccountStatus": "ACAC",
      "CK": "99",
      "DateIn": "2016-01-22",
      "RegulationAccountType": "TRSA"
    }
  ],
  "BIC": "040397100",
  "ParticipantInfo": {
    "DateIn": "2011-01-11",
    "NameP": "УФК по Краснодарскому краю",
    "ParticipantStatus": "PSAC",
    "PtType": "52",
    "Rgn": "03",
    "RstrList": [],
    "Srvcs": "3",
    "UID": "0397002001",
    "XchType": "1"
  },
  "SWBICS": []
}
```

### Example 4: AccountCBRBIC reference

This is a two-field excerpt of the account in Example 1, not a complete account record. Both strings are source-derived. Owner BIC is `042202115`; servicing BIC `042202001` is a different participant and resolves in this snapshot. This field must survive conversion even when another account’s servicing reference cannot be resolved.

```json
{
  "Account": "40102810845370000115",
  "AccountCBRBIC": "042202001"
}
```

Example 1's UID `0000000005` demonstrates why UID must also remain a string. Example 2 retains an actual participant with zero accounts; `Accounts: []` does not mean the participant is invalid. Example 3 retains both account occurrences, not a selected default.


### Illustrative values versus source values

The format string, public version and all destination field names are design choices. The typed envelope outline is illustrative. No conversion/publication timestamp or converter version is asserted for these examples because no conversion/publication was performed. In an eventual complete snapshot, actual source attributes omitted from the excerpts must still be included. No placeholder data is saved as a `.json` file.

## Ordering and serialization — PROPOSED

- Preserve participant order from BICDirectoryEntry occurrences. Preserve account, SWIFT and restriction order within each owner. Array indices are zero-based source-order locators; they change when the source order changes and are not stable historical identifiers.
- Serialize object member names in lexicographic code-point order, without locale collation. For these supported field names, keys are ASCII. Emit compact JSON with standard escaping, UTF-8 without BOM, no unnecessary ASCII escapes, and exactly one trailing LF. Object order is for reproducible bytes; consumers must not rely on it semantically.
- Preserve every decoded attribute string without trimming, case folding, punctuation rewriting, number coercion or Unicode normalization. JSON counts use decimal integers; no derived floating-point values are in the core contract.
- Determinism means identical source bytes, declared profile, converter version and recorded event metadata produce identical bytes. Changing conversion/publication timestamps changes the envelope. Rebuilds of an immutable release must reuse its recorded metadata; a 304 or duplicate force download should not issue new timestamps/history solely to claim an update.
- Different XML serializations/orders or different acquisition events can produce different artifact/envelope hashes even when business content is similar. No semantic canonicalization, cross-snapshot deduplication or JSON self-hash is specified. An external release manifest can be designed later without a self-referential checksum.

## Size, browser use and static hosting review

**VERIFIED measurement methodology:** a read-only byte-budget calculation summed JSON-escaped UTF-8 lengths of the 30174 participant-subtree attribute occurrences, source field names, punctuation and mandatory empty/list wrappers for the proposed mapping. It did not materialize or save a full JSON dataset, implement a converter, or add a repository script. Only scalar totals were printed. The two-space estimate accounts for nesting under the proposed top-level participants property.

| Variant | Participant array cost only | Proposed envelope estimate |
| --- | --- | --- |
| Compact UTF-8, non-ASCII text unescaped | 803441 bytes (784.61 KiB / 0.766 MiB) | About 0.77 MiB, allowing roughly 1–2 KiB for metadata/envelope |
| Two-space pretty JSON | 1260554 bytes (1231.01 KiB / 1.202 MiB) | About 1.20–1.21 MiB, plus small metadata overhead |

Final metadata lengths and HTTP gzip/Brotli transfer size are **UNKNOWN** until implementation/hosting measurements. No compressed JSON estimate is presented as measured; XML ZIP compression is not a JSON compression benchmark. Sizes describe this source only. Historic files and future fields can be much larger; the reviewed 2018 XML is about 9.8 MB before decoding.

**PROPOSED browser approach:** load the selected compact snapshot on demand, parse once, and initially search the roughly 1.4k participants locally by BIC, supplied names and other selected source fields. Keep any normalized search text as a temporary derived view, preserving the original payload. Build a BIC multimap locally when reference resolution is needed. An external search backend or published index is not justified by this sample size alone. Latency, memory and mobile performance are **UNKNOWN** until profiled; these measurements are feasibility indicators, not a benchmark.

**PROPOSED hosting fit:** a versioned JSON artifact can be served as static `application/json` with UTF-8 encoding alongside a separate current-release reference, consistent with ADR-BIC-001 and a backend-free MVP. Immutable version URLs, cache policy, atomic current-pointer promotion and any cross-origin access policy remain decisions. This task does not choose hosting, deploy files or modify public/ or website routes.

## Loss review

| Transformation | Potential loss | Proposed treatment |
| --- | --- | --- |
| XML attributes into JSON strings | Entity spellings, attribute order, quote style, byte offsets and XML-normalized whitespace cannot be reconstructed | Preserve parsed semantic strings and raw-byte fingerprint; retain originals outside the public site according to retention policy |
| WINDOWS-1251 to UTF-8 | Byte serialization changes | Preserve declaration encoding and original XML SHA-256; do not hash reencoded text as the source |
| Official record hierarchy into nested objects/arrays | Unknown future elements/namespaces could be omitted | Require complete mapping coverage for every supported release; review unsupported structure before publishing |
| Source serialization metadata | Prefix spellings, comments, processing instructions, schema-location hints and standalone declaration details are not included in the minimal projection | State this limit; never call the JSON byte-lossless XML. Raw-source retention and any additional metadata fields need a decision. |
| Names/location normalization | Original abbreviations, casing, missingness or locality distinctions can be lost | No destructive normalization in the contract |
| Repeated records into maps/sets | Duplicate accounts, multiple SWIFT codes and restrictions can vanish | Arrays, occurrence-based identity and count checks; no deduplication |
| Code/status translation | Official categories or restrictions can be misrepresented | Preserve source codes; labels are separate, evidence-backed views |
| One snapshot treated as lifetime identity/history | Entity changes or historical reference ambiguity can be hidden | Scope lookups to the source artifact; no automatic historical merging |

Preserving all source-defined participant fields may include person-like names/address information on some participant categories. These examples avoid such records. Do not collect or enrich extra personal information. Any approved field-redaction/publication policy would change the projection and must be explicit and versioned, rather than silently deleting records or claiming lossless preservation.

## Validation principles — PROPOSED

1. Verify transfer/ZIP integrity, raw fingerprints, safe decoding/parsing and the expected namespace. Pin the complete official XSD release/dependency package; source validation and public-contract validation are separate stages.
2. Check that the source belongs to the supported complete-snapshot profile. Preserve all accepted occurrences and source attributes, including optional fields; review conditional official rules separately from shared XSD enum admission.
3. Validate the envelope and mapped value types/cardinalities against this documented contract once reviewed. Reject duplicate JSON object member names, fabricated defaults, non-string source identifiers and unsupported format/major versions. No JSON Schema is created now.
4. Reconcile participant/account/SWIFT/restriction totals with source occurrences and verify every mapped field's exact parsed value and optional presence. A participant without accounts must survive unchanged apart from explicit empty-array wrappers.
5. Detect duplicate identifiers, unresolved/ambiguous references, parent cycles and temporal anomalies without dropping records. Record diagnostics; severity and publication policy need review. Current unresolved AccountCBRBIC is an explicit edge case.
6. Distinguish missing optional attributes, invalid empty values and valid present values. Do not convert failed XSD validation into apparently valid JSON by repairing values.
7. Check deterministic ordering/serialization and actual provenance/event metadata. Only successfully checked candidates are eligible for version-history publication; preserve the last valid release on failure, as approved in ADR-BIC-001.

## Compatibility policy — PROPOSED

The format name remains stable. Use semantic versions for the public contract: major for removed/renamed fields, changed types/meaning, source-array ordering semantics or a changed omission/null policy; minor for backward-compatible optional fields or explicitly supported profiles; patch for documentation corrections without a wire-contract change. Official XSD upgrades and converter releases have their own identifiers and do not automatically change the public major version.

Consumers must reject unsupported format/major versions, ignore unfamiliar optional object members and retain/display unfamiliar official code strings rather than silently filtering them. Publishers must not add unmapped source content silently: review it, update coverage and publish under an appropriate contract version. The initial proposal promises preservation only for explicitly supported source releases/profiles, not all past/future ED807 files sharing a namespace. Naming a version here does not create a released schema or compatibility guarantee before approval.

## UNKNOWN

- Guaranteed uniqueness/stability of BIC, UID and account identity across historical messages.
- Exact generating XSD release of the supplied input; validated-release compatibility is known.
- Full conditional business validation, reason for the unresolved reference and historical/multipart/delta handling.
- Actual browser memory/latency, hosting compression/cache behavior and final envelope byte size.
- Complete original provenance and acquisition time of the supplied local files; R6 verified byte correspondence with the official response.
- Redistribution conditions and final treatment of person-like source fields in a public projection.

## DECISION REQUIRED — review checklist

1. Accept or revise the project-owned format name, metadata grouping and direct official field names; approve a public version only after review.
2. Select supported XSD releases/profiles and decide whether older full snapshots, SIRR reconciliation or multipart aggregation belong in MVP.
3. Approve source-order occurrence identity, BIC/UID multimap lookups, and diagnostic severity for duplicate/unresolved/cyclic references.
4. Choose immutable history naming, snapshot versus release identity, current-pointer promotion, cache policy and durable update state.
5. Define publication timestamp semantics and reproducible event-metadata retention; review metadata null/omission rules for manual imports.
6. Confirm publication/redistribution and any explicit field-redaction policy, including original-source retention for auditability.
7. Decide resource bounds and actual browser performance targets after a prototype is authorized. No search-index optimization is proposed now.

## Verification

Verified on 2026-10-08: original XML/ZIP hashes match SHA256SUMS, and the manifest matches its committed bytes. All four JSON excerpts parse and their displayed source values, account occurrences, zero-child arrays and leading-zero UID match the XML. The XML revalidated against the fingerprint-checked official 2026.09.0 XSD set. `git diff --check` passed. `pnpm run build` passed with zero errors, warnings or hints and generated all nine static pages.

Only documentation is changed: this proposal, the architecture-decisions record and the previously prepared acquisition research included so its references are available in Git. No standalone banking JSON, JSON Schema, converter code, dependency, website route or external repository is changed. No source or derived dataset is placed in public/ or dist/. The contract remains **PROPOSED / pending review**, not APPROVED.
