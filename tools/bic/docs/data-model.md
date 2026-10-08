# ED807 conceptual data model (BIC-R3)

Research date: 2026-10-08. This is a documented proposal, not an approved output contract, database design or JSON Schema. No converter or production code is implemented. [Source research](source-research.md) contains the methodology, fingerprints, full attribute inventory, observed counts and official schema constraints.

## VERIFIED

### Evidence and modeling boundaries

The supplied ZIP contains a byte-identical copy of the supplied XML. The XML is an ED807 document in `urn:cbr-ru:ed:v2.0`, declared WINDOWS-1251, with `EDDate=2026-10-07`, `BusinessDay=2026-10-08`, `InfoTypeCode=FIRR` and `DirectoryVersion=1`. It passes the official Bank of Russia 2026.09.0 XSD dependency set. The file does not declare that schema release; its exact generating release and original provenance remain unknown.

The input contains 1382 participant entries, 1339 account records, 288 SWIFT identifier records, 294 participant restrictions and 71 account restrictions. XSD cardinalities are broader than the observed maxima and permit zero directory entries, zero accounts per participant, and unbounded repetitions for accounts, SWIFT identifiers and restrictions. `ParticipantInfo` is required exactly once per directory entry.

A participant is a directory entity, not necessarily a bank or a commercial bank. Official code-value item 72 distinguishes credit organizations, their branches, CBR units, treasury authorities, indirect participants, insolvency administrators and other categories. Type `20` occurs 370 times; this is a credit-organization count, not an independently verified commercial-bank count. Do not filter other participant types out of the conceptual source model.

### Source field groups to preserve

The groups below identify what exists in the official ED807 structure. The grouping is conceptual; field definitions and required/optional attributes remain those in the cited XSD tables, not new constraints.

| Concept | Verified source fields / child records | Evidence and caveat |
| --- | --- | --- |
| Message metadata | `EDNo`, `EDDate`, `EDAuthor`, optional `EDReceiver`; `CreationReason`, `CreationDateTime`, `InfoTypeCode`, `BusinessDay`, optional `DirectoryVersion` | All except EDReceiver occur here. DirectoryVersion is an intraday version, not a schema version. |
| Multipart/source-message relationship | Optional `PartInfo` (`PartNo`, `PartQuantity`, `PartAggregateID`); optional `InitialED` (`EDNo`, `EDDate`, `EDAuthor`) | Present in XSD, absent here. Do not assume future input is a single part or has no linked request. |
| Directory participant | `BICDirectoryEntry.@BIC`, optional `@ChangeType`; exactly one `ParticipantInfo` | BIC is required by XSD, unique in this snapshot. ChangeType is absent here. |
| Participant identifiers | `ParticipantInfo.@UID`, optional `@RegN`; repeated `SWBICS` with `@SWBIC`, `@DefaultSWBIC` | BIC and UID are not interchangeable. RegN is absent on 433 participants and is not unique where present. SWIFT identifiers are a separate identifier system. |
| Participant names | Optional `NameP`, `EnglName` | NameP happens to be populated on every participant but is optional in XSD; names are not unique identifiers. |
| Participant classification/services | `PtType`, `Srvcs`, `XchType` | Required textual codes. XSD restricts length/characters, not membership in these code lists; official code-value tables carry their meaning. |
| Participant lifecycle | Required `DateIn`; optional `DateOut`, `ParticipantStatus`; repeated `RstrList` (`Rstr`, `RstrDate`) | All observed statuses are PSAC; restrictions still occur. DateOut is absent here, not forbidden. |
| Location | Optional `CntrCd`, `Ind`, `Tnp`, `Nnp`, `Adr`; required `Rgn` | Components are incomplete on some participants. Preserve them separately; do not fabricate country, locality or postal code. |
| Parent organization | Optional `PrntBIC` | References a participant BIC; 466 links resolve here, including two-level chains. This is distinct from XML nesting and account servicing. |
| Account owned by directory entry | Repeated `Accounts`: `Account`, `RegulationAccountType`, `AccountCBRBIC`, `DateIn`; optional `CK`, `DateOut`, `AccountStatus` | Accounts is one record per element. 199 participants have none; the largest observed account count is 12. No universal maximum is inferred. |
| Account restrictions/successor | Repeated `AccRstrList`: `AccRstr`, `AccRstrDate`, optional `SuccessorBIC` | A successor is attached to a restriction record, not unconditionally to every account or participant. |

### Identifier and relationship evidence

- All BIC and UID values are unique in this snapshot, but the inspected XSD closure declares no `xs:key`, `xs:unique` or `xs:keyref`. Cross-snapshot identity guarantees are not established by this observation.
- 31 account-number strings occur more than once, producing 42 extra rows. Account number alone cannot identify a record globally. `(owning BIC, Account)` and `(AccountCBRBIC, Account)` are each unique here; neither is proven a universal key.
- The 466 `PrntBIC` references all resolve here, without self-links/cycles. Parent depth reaches two; a flat parent-only display can lose hierarchy.
- One of 1339 `AccountCBRBIC` references does not resolve in this snapshot; one self-reference belongs to the CBDC account. Neither should be silently discarded.
- Seven `SuccessorBIC` references on SDRS restriction records resolve to one target. Future successors need not have the same characteristics.
- Names and registration numbers repeat. Never merge participants on these fields.

## PROPOSED

### Conceptual entities and ownership

| Conceptual entity | Proposed responsibility | Relationships |
| --- | --- | --- |
| Source artifact | Preserve local source path, byte size, SHA-256, declaration encoding and archive-member relationship; record retrieval URL/time only when actually known | The ZIP contains the XML; one XML artifact supplies a message. No source artifact is published by this proposal. |
| Directory message / snapshot | Preserve qualified root name, namespace, all source metadata, schema compatibility evidence and optional part/request metadata | Owns ordered participant entries. Link to artifact fingerprint; do not identify a snapshot solely by BusinessDay or DirectoryVersion. |
| Participant entry | Preserve BIC, source entry ordinal, ChangeType and all ParticipantInfo attributes | Owns accounts, SWIFT identifiers and participant restrictions; carries an optional parent-organization reference. |
| SWIFT identifier record | Preserve SWBIC, lexical DefaultSWBIC and source order | Belongs to one participant entry; do not overwrite the list with a single preferred identifier. |
| Participant restriction | Preserve code, effective date and source order | Belongs to one ParticipantInfo record; does not replace ParticipantStatus. |
| Account record | Preserve every account attribute and source order within the owner entry | Belongs to the directory entry; separately refers to the servicing BIC and owns account restrictions. |
| Account restriction | Preserve code, date, optional successor BIC and source order | Belongs to one account; successor relationship is scoped to this restriction. |
| Reference-resolution diagnostic | Record the source field, reference string, scope and resolved/unresolved result | Non-destructive side information; an unresolved link retains its source value and its owning record. |

The source hierarchy should remain reconstructable. A derived lookup or normalized storage representation can be designed later, without collapsing repeated records or replacing original codes with labels.

### Lossless representation policy

- Preserve original bytes locally through source artifacts; a conceptual model of parsed values does not preserve byte-level XML serialization by itself.
- Retain original textual BIC, UID, RegN, Account, CK, codes and postal index. Leading-zero BICs occur in 1271 entries. XSD account identifiers can contain alphabetic sixth characters even though this input's accounts are numeric.
- Retain missing versus present values explicitly. No present attribute is empty in this input; do not synthesize empty strings or convert every absence to a value that loses that distinction.
- Retain names, address components, casing and original locality labels. Examples of locality-type variants include `г`, `город` and `г.`. Any normalized/search representation should be separate and traceable to the original.
- Keep `EDDate`, `BusinessDay`, `CreationDateTime`, participant/account DateIn/DateOut and restriction dates separate. A UTC creation instant is not a date-only business day.
- Keep participant and account statuses as separate source codes with optional, versioned labels. Do not reduce status to an `active` boolean or infer unrestricted service availability from PSAC/ACAC.
- Keep classification codes and service codes unchanged; a service code represents an officially defined combination, not an inferred bitmap.
- Preserve the lexical boolean flag on a SWIFT identifier; an interpreted boolean can be an additional view. XSD admits `true`/`false` as well as the observed `1`/`0`.
- Keep optional XSD fields that are absent in this sample in scope: EDReceiver, ChangeType, DateOut, PartInfo and InitialED. Absence in one full snapshot must not remove them from the conceptual design.
- Associate any interpreted label, XSD result or reference check with the exact source/schema release and validation method. No published dataset or output encoding is chosen here.

### Conceptual keys — candidates only

Use the source artifact fingerprint plus record location/ordinal as a candidate lossless record identity for research traceability. A snapshot-scoped BIC can be a candidate lookup key after explicit duplicate checks. Account records must retain owner, servicing BIC, number and ordinal; do not commit to a database uniqueness constraint based on one file. Cross-snapshot participant/account identity, lifecycle matching and collision policy require a later decision.

### Future validation layers — proposal, not implementation

1. Source integrity and ZIP/member integrity.
2. Safe XML decoding, parsing and namespace verification.
3. Validation against an explicitly selected complete official XSD set.
4. Conditional ED807 rules/code applicability from official documentation.
5. Snapshot diagnostics: counts, duplicate identifiers, unresolved references and temporal anomalies.

Keep these results separate. A passed XSD check is not proof of official origin, completeness, unrestricted operation or correctness of a join. The unresolved servicing reference in this input demonstrates that distinction.

## UNKNOWN

- Input chain of custody, exact generating schema release, record completeness and redistribution permissions.
- Stable cross-snapshot semantics for BIC, UID, RegN and account identity; guarantees not encoded in the inspected XSD.
- Why a servicing BIC does not resolve, and whether it should resolve in another snapshot or external directory.
- Complete conditional document rules and their applicability to the public directory distribution context.
- Delta reconciliation, multipart aggregation, deletion/tombstone retention and effective-date history: the input is one FIRR snapshot with no PartInfo, InitialED, ChangeType or DateOut records.
- User-facing scope and size of a future tool, and whether any derived records may be published.

## DECISION REQUIRED

| Decision | Evidence needed before implementation |
| --- | --- |
| Source acquisition, retention and provenance | Verified acquisition procedure and source permissions; original XML/ZIP remain excluded from Git and public assets. |
| Accepted schema releases | Pin official dependency fingerprints and define how upgrades or unsupported namespaces are handled. Compatibility with 2026.09.0 alone does not identify the generating release. |
| Internal/derived record identity | Decide snapshot identity, participant keys, account keys and duplicate policy using broader official evidence and additional authorized samples. |
| Unresolved reference policy | Choose warning, quarantine or rejection criteria without deleting source values or fabricating target records. Investigate the observed servicing-reference gap. |
| Optional fields and normalization | Decide display/search defaults and separate derived values from original lexical attributes. Avoid making sample-wide presence a schema requirement. |
| Code interpretation/business validation | Review remaining conditional ED807 documentation and scope shared XSD enums to each field/context. Unknown future codes must remain visible as diagnostics. |
| Time, lifecycle and updates | Decide business-day handling, historical snapshots, full-versus-delta processing, multipart aggregation and deletion history based on official rules. |
| Output contract and publication | Decide requirements, redistribution boundary and review process before any converter or JSON Schema is requested. |

No architecture, production dependencies or website functionality changes are authorized by this conceptual proposal. PG27, Fake Bank and Fake Shop remain outside scope.
