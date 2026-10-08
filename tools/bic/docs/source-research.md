# ED807 source research (BIC-R2)

Research date: 2026-10-08. Scope: read-only inspection, aggregate analysis and official XSD research. No converter, JSON Schema, banking dataset or production code is created. Only this document and `data-model.md` are changed.

## Evidence labels and methodology

- **VERIFIED / FILE**: properties measured from the supplied bytes. Counts describe this one snapshot only.
- **VERIFIED / OFFICIAL XSD**: constraints read from the downloaded Bank of Russia schema set, version 2026.09.0.
- **VERIFIED / OFFICIAL DOCUMENT**: meanings checked in the accompanying code-value PDF; these can be narrower than shared XSD types.
- **UNKNOWN**: evidence is absent or insufficient. Schema validity does not authenticate origin or establish business-rule validity.

Method: check SHA-256 against the committed manifest; list ZIP entries with Python `zipfile`; read the XML entry in memory and compare bytes; parse the supplied XML as bytes (honoring WINDOWS-1251); group elements by qualified path; count attribute presence, empty strings, distinct values, repeated children, duplicate identifiers and references. Missing means an attribute is absent; empty means a present attribute has an empty string value. Counts use immediate children, preventing account or restriction counts from being conflated with participant counts.

The input contains no DOCTYPE or ENTITY declaration. XML parsing used external-entity resolution disabled, DTD loading disabled and network access disabled. Schema dependencies were resolved in memory only from the explicitly downloaded official ZIP. Analysis used existing Python, lxml and Poppler tools; no dependency was added. Temporary research files stayed under `/tmp/`; no archive entry was extracted into the repository. Code PDFs were text-extracted and relevant code tables visually checked.

## Source preservation and ZIP relationship — VERIFIED / FILE

| Input | Bytes | SHA-256 |
| --- | --- | --- |
| `data/ed807/20261008_ED807_full.xml` | 715081 | `b28862aa26ce5063846d7231477b611947afd91bef0c5707f3a26fd8382be779` |
| `data/ed807/20261008ED01OSBR.zip` | 107879 | `17f241b5581cff94108eb99be953f2339c1733b92250527a4ba6dae8c36e4b12` |

Both match `data/ed807/SHA256SUMS`. The ZIP has exactly one entry: `20261008_ED807_full.xml`, uncompressed size 715081, compressed size 107719, CRC-32 `e567505a`, stored timestamp `2026-10-07 21:01:30` (no timezone in this ZIP timestamp). Reading the entry verifies its CRC; its SHA-256 equals the standalone XML hash and the bytes are identical. The ZIP contains no XSD, manifest or signature file. The XML has no signature element. This proves the local files' relationship, not official provenance.

Preservation history: on 2026-10-08 both files were moved from `dist/` to `data/ed807/` after copy/hash verification. Before that move, `git ls-files --error-unmatch dist/20261008_ED807_full.xml` exited 128 because Git metadata was unavailable. Tracking was unknown at that point. Subsequent authorized Git initialization excluded XML/ZIP from Git; the checksum manifest is versioned. Original source bytes remain local and unchanged.

## XML metadata — VERIFIED / FILE

| Property | Value |
| --- | --- |
| Root | `ED807` |
| Element namespace | `urn:cbr-ru:ed:v2.0` (default namespace, all observed elements) |
| Attributes | Unqualified (no attribute namespace) |
| XML declaration version | `1.0` |
| Declared encoding | `WINDOWS-1251`; parsing the original bytes succeeded |
| EDNo | `708110299` |
| EDDate | `2026-10-07` |
| EDAuthor | `4583001999` |
| CreationReason | `FCBD` |
| CreationDateTime | `2026-10-07T18:01:01Z` |
| InfoTypeCode | `FIRR` |
| BusinessDay | `2026-10-08` |
| DirectoryVersion | `1` |
| Schema references | No `xsi:schemaLocation` or `xsi:noNamespaceSchemaLocation` anywhere |
| Declared schema/album version | Absent; **UNKNOWN** |

`DirectoryVersion` is an intra-business-day directory version (XSD annotation), not the schema release. The namespace suffix `v2.0`, XML declaration `1.0`, directory version `1` and schema release `2026.09.0` are separate concepts. The filename date aligns with `BusinessDay`, not `EDDate`. Preserve both dates and the UTC creation timestamp.

Official code-value document, entry 66, identifies `FIRR` as a full directory and `SIRR` as changes. Entry 65 describes `FCBD` in closing-session/next-business-day distribution contexts, including a full directory for an FPS operator. The file carries these codes, but its actual delivery context and chain of custody are **UNKNOWN**. Do not infer them from the codes or filename.

## Observed XML structure — VERIFIED / FILE

```text
ED807 (1)
└── BICDirectoryEntry (1382)
    ├── ParticipantInfo (one per entry; 1382 total)
    │   └── RstrList (0–2 per participant; 294 total)
    ├── SWBICS (0–2 per entry; 288 total)
    └── Accounts (0–12 per entry; 1339 total)
        └── AccRstrList (0–2 per account; 71 total)
```

All content fields are attributes. No element has non-whitespace text. `Accounts` is one account record per element, not a wrapper holding an account list. `SWBICS`, `RstrList` and `AccRstrList` are also record elements. Structural nesting, parent organization, servicing institution and successor are distinct relationships.

## Official XSD — obtained and VERIFIED

Primary sources retrieved on 2026-10-08:

1. [Bank of Russia formats page](https://cbr.ru/development/Formats/): labels release 2026.09.0 as effective from the first operating day after 2026-09-19 and states that the archives include XML schemas.
2. [Official UFEBS 2026.09.0 ZIP](https://cbr.ru/Content/Document/File/123129/UFEBS_v2026_09_0.zip): downloaded successfully over HTTPS to `/tmp/roust-us-UFEBS_v2026_09_0.zip`. Archive SHA-256: `3ca5333743462c7ccce34914765c15d45b1f26e3ca227f75f04bce01062e3566`.
3. [Bank of Russia payment-system page](https://cbr.ru/PSystem/payment_system/): identifies ED807 as the published BIC directory format. This is format context, not proof that the user-supplied bytes were downloaded there.

The authoritative ED807 XSD is an archive member, not an independently verified direct XSD download URL: `XMLSchemas/ed/cbr_ed807_v2026.09.0.xsd`. Schema `version="2026.09.0"`; target namespace `urn:cbr-ru:ed:v2.0`; `elementFormDefault="qualified"`; `attributeFormDefault="unqualified"`.

The ED807 schema includes objects and imports leaf types; leaf types import base types. Dependency members and fingerprints:

| Member under `XMLSchemas/ed/` | SHA-256 |
| --- | --- |
| `cbr_ed807_v2026.09.0.xsd` | `9b898e49185a52b83603af3bff1d92381f7c8b3e91439be1be0ba1e72098ede5` |
| `cbr_ed_objects_v2026.09.0.xsd` | `a764939da35c9a884451c9d70ab60504f49635cd684eb74974a18865a2ceae25` |
| `cbr_ed_leaftypes_v2026.09.0.xsd` | `2a474499dabfa50aece0dbb17747a6258ac3a784462806496f2350a31ff1e6c8` |
| `cbr_ed_basetypes_v2018.3.0.xsd` | `7fc20aa13386459f73d9b96d6d3df43d0d6b22761eea3c1d152aa6ed233c9b0e` |

Objects namespace: `urn:cbr-ru:ed:v2.0`; leaf types namespace: `urn:cbr-ru:ed:leaftypes:v2.0`; base types namespace: `urn:cbr-ru:ed:basetypes:v2.0`. The base-type member retains version 2018.3.0 in the 2026.09.0 package; do not substitute a guessed newer base file.

The input **passes** `lxml.etree.XMLSchema` validation against this complete dependency closure, with zero errors. This establishes structural/type compatibility with this release. It does not prove the exact schema release used to produce the input, official provenance, completeness, freshness, reference resolution, banking correctness or compliance with all conditional document rules. No XSD validation was added to the application or build.

### Element cardinalities — VERIFIED / OFFICIAL XSD

Sequence order is significant. Root type inheritance: `ED807 → ESIDWithPartInfo → ESID → ED → EDRefID`. XSD defaults omitted `minOccurs`/`maxOccurs` to 1 and omitted attribute `use` to optional.

| Parent | Child, in sequence order | XSD cardinality | Observed total |
| --- | --- | --- | --- |
| ED807 | PartInfo | 0..1 | 0 |
| ED807 | InitialED | 0..1 | 0 |
| ED807 | BICDirectoryEntry | 0..unbounded | 1382 |
| BICDirectoryEntry | ParticipantInfo | 1..1 | 1382 |
| BICDirectoryEntry | SWBICS | 0..unbounded | 288 |
| BICDirectoryEntry | Accounts | 0..unbounded | 1339 |
| ParticipantInfo | RstrList | 0..unbounded | 294 |
| Accounts | AccRstrList | 0..unbounded | 71 |

If present, `PartInfo` requires `PartNo` and `PartQuantity` (`OrdinalNumberType`: integer, positive, at most six digits) and `PartAggregateID` (`PartAggregateIDType`: textual digit pattern `\d{1,27}`). `InitialED` requires the `EDRefID` trio `EDNo`, `EDDate`, `EDAuthor`, with the types shown below. Neither optional root child occurs in this file. Future handling of multipart documents remains a decision.

### Attributes: official requirement versus observed presence

Every row has **zero empty values** in this file. “Missing” counts absence against the number of parent records, not against all participants for nested account/SWIFT records. All schema-defined attributes are included, even those absent throughout the input. A field present in every record can still be optional in the XSD.

#### ED807 (1 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `EDNo` | `lt:EDNumberType` | required | 1 | 0 | 1 |
| `EDDate` | `lt:DateType` | required | 1 | 0 | 1 |
| `EDAuthor` | `lt:EDDrawerIDType` | required | 1 | 0 | 1 |
| `EDReceiver` | `lt:EDDrawerIDType` | optional | 0 | 1 | 0 |
| `CreationReason` | `lt:ReasonCodeType` | required | 1 | 0 | 1 |
| `CreationDateTime` | `lt:DateTimeType` | required | 1 | 0 | 1 |
| `InfoTypeCode` | `lt:RequestCodeType` | required | 1 | 0 | 1 |
| `BusinessDay` | `lt:DateType` | required | 1 | 0 | 1 |
| `DirectoryVersion` | `lt:Max2NumberType` | optional | 1 | 0 | 1 |

#### BICDirectoryEntry (1382 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `BIC` | `lt:BICRUIDType` | required | 1382 | 0 | 1382 |
| `ChangeType` | `lt:ChangeType` | optional | 0 | 1382 | 0 |

#### ParticipantInfo (1382 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `NameP` | `lt:Max160TextType` | optional | 1382 | 0 | 1321 |
| `EnglName` | `lt:Max140TextType` | optional | 296 | 1086 | 288 |
| `RegN` | `lt:Max9TextType` | optional | 949 | 433 | 941 |
| `CntrCd` | `lt:Eq2TextType` | optional | 1210 | 172 | 16 |
| `Rgn` | `lt:Max2TextType` | required | 1382 | 0 | 87 |
| `Ind` | `lt:Max16TextType` | optional | 1378 | 4 | 642 |
| `Tnp` | `lt:Max5TextType` | optional | 1367 | 15 | 8 |
| `Nnp` | `lt:Max25TextType` | optional | 1368 | 14 | 205 |
| `Adr` | `lt:Max160TextType` | optional | 1355 | 27 | 1059 |
| `PrntBIC` | `lt:BICRUIDType` | optional | 466 | 916 | 75 |
| `DateIn` | `lt:DateType` | required | 1382 | 0 | 787 |
| `DateOut` | `lt:DateType` | optional | 0 | 1382 | 0 |
| `PtType` | `lt:Max2TextType` | required | 1382 | 0 | 14 |
| `Srvcs` | `lt:Max1TextType` | required | 1382 | 0 | 5 |
| `XchType` | `lt:Max1TextType` | required | 1382 | 0 | 2 |
| `UID` | `lt:EDDrawerIDType` | required | 1382 | 0 | 1382 |
| `ParticipantStatus` | `lt:ParticipantStatusType` | optional | 1382 | 0 | 1 |

#### SWBICS (288 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `SWBIC` | `lt:BICSWIFTIDType` | required | 288 | 0 | 288 |
| `DefaultSWBIC` | `lt:IndicatorType` | required | 288 | 0 | 2 |

#### Accounts (1339 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `Account` | `lt:AccountNumberRUIDType` | required | 1339 | 0 | 1297 |
| `RegulationAccountType` | `lt:AccountType` | required | 1339 | 0 | 7 |
| `CK` | `lt:Eq2TextType` | optional | 1339 | 0 | 98 |
| `AccountCBRBIC` | `lt:BICRUIDType` | required | 1339 | 0 | 105 |
| `DateIn` | `lt:DateType` | required | 1339 | 0 | 784 |
| `DateOut` | `lt:DateType` | optional | 0 | 1339 | 0 |
| `AccountStatus` | `lt:AccountStatusType` | optional | 1339 | 0 | 1 |

#### RstrList (294 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `Rstr` | `lt:RstrType` | required | 294 | 0 | 3 |
| `RstrDate` | `lt:DateType` | required | 294 | 0 | 199 |

#### AccRstrList (71 records)

| Attribute | XSD type | XSD use | Present | Missing | Distinct |
| --- | --- | --- | --- | --- | --- |
| `AccRstr` | `lt:RstrType` | required | 71 | 0 | 6 |
| `AccRstrDate` | `lt:DateType` | required | 71 | 0 | 49 |
| `SuccessorBIC` | `lt:BICRUIDType` | optional | 7 | 64 | 1 |

### Simple-type constraints — VERIFIED / OFFICIAL XSD

`lt:` names below use the leaf-type namespace. Identifier types ultimately derive from `xs:string`, even when their content is digits. Record XSD regular expressions as XSD expressions; do not transplant them into another regex dialect or invent a JSON Schema.

| Type | Verified facets/base |
| --- | --- |
| BICRUIDType | String; pattern `\d{9}` |
| EDDrawerIDType | String; pattern `\d{10}` |
| AccountNumberRUIDType | String; pattern `\d{5}[0-9ABCEHKMPTX]\d{14}`; alphabetic sixth characters are permitted by XSD |
| BICSWIFTIDType | String; length 8..11 and pattern `[A-Z]{6}[0-9A-Z]{2}([0-9A-Z]{3})?` |
| IndicatorType | Ultimately `xs:boolean`; lexical forms include `0`, `1`, `false`, `true` |
| DateType | Ultimately `xs:date`; pattern `\d{4}-\d{2}-\d{2}` |
| DateTimeType | Ultimately `xs:dateTime`; pattern `\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z` |
| EDNumberType | Integer, at most 9 total digits, minimum 1 |
| Max2NumberType | Integer, at most 2 total digits, minimum 0 |
| MaxNTextType used here | String, minimum length 1, maximum N: 1, 2, 5, 9, 16, 25, 140, 160 |
| Eq2TextType | String, exactly 2 characters; not necessarily numeric |

The text base (`TextCategory`) and identifier-text base (`IdentifierTextCategory`) restrict characters with pattern `[ ]*[!-~А-яЁё№][ -~А-яЁё№]*`. `NumberCategory` is `xs:integer` with pattern `[\-]?[1-9]\d{0,}|[0]`. Preserve lexical strings even where a numeric/date interpretation is useful. `CK` uses a text type, not a computed checksum rule in this research.

`PtType`, `Srvcs`, `XchType`, `CntrCd`, `Rgn`, `Tnp` and `CK` do not have XSD enumerations in these definitions. Do not promote observed values to a closed schema domain. Official code tables supply additional semantics/usage restrictions beyond the XSD.

### Shared XSD enumerations — VERIFIED / OFFICIAL XSD

These are full enumerations of the leaf types referenced by ED807. They are shared across messages: XSD admission does not mean every value is applicable to every ED807 field/context.

- **ReasonCodeType**: `ACCH`, `AICH`, `ALCH`, `APPA`, `RIRA`, `RIRP`, `RMAA`, `RMVA`, `RQST`, `SOBD`, `UIRA`, `UIRP`, `ARRD`, `ARRM`, `ARRS`, `EOBD`, `EOCC`, `ICLD`, `ICLM`, `ICLS`, `PCHD`, `CSCH`, `NSCH`, `FCBD`, `CIBD`, `PPAD`, `CHCN`.
- **RequestCodeType**: `FIRR`, `SIRR`, `PROF`.
- **ChangeType**: `ADDD`, `CHGD`, `NCNG`, `DLTD`.
- **ParticipantStatusType**: `PSAC`, `PSDL`.
- **AccountStatusType**: `ACAC`, `ACDL`.
- **AccountType**: `BANA`, `CBRA`, `CRSA`, `TRSA`, `CLRA`, `EPGA`, `EPSA`, `GARA`, `TRUA`, `UTRA`, `CLAC`, `CBDC`.
- **RstrType**: `NORS`, `URRS`, `LWRS`, `LMRS`, `CLRS`, `FPRS`, `MRTR`, `SDRS`, `FPIP`, `ESRS`, `RSIP`, `FOCL`, `SCRS`.

For example, the shared `RequestCodeType` allows `PROF`, but the official ED807 `InfoTypeCode` code table lists `FIRR` and `SIRR`. The shared `AccountType` contains values used by other messages. No business-rule validator or field-specific domain has been invented from the shared enumeration.

## Dataset counts and code observations — VERIFIED / FILE

Total participants: **1382** (directory entries, not commercial banks). Total accounts: **1339**; distinct account-number strings: **1297**. Participants with at least one account: **1183**; without accounts: **199**. Average accounts per participant: **0.9689**; per participant with accounts: **1.1319**. No missing/empty BIC, UID, NameP or Account in this snapshot.

### Participants by PtType

Labels are concise English descriptions of official code-value entries (item 72, PDF pp. 30–31); counts are from the input. Type `20` means credit organization; it is not a verified commercial-bank count.

| PtType | Count | Official meaning, abbreviated |
| --- | --- | --- |
| `00` | 7 | CBR main office / operations-cash center |
| `10` | 13 | Settlement-cash center / operations-cash center |
| `12` | 59 | CBR branch / national-bank branch / operations-cash center |
| `15` | 6 | CBR central-office structural unit |
| `20` | 370 | Credit organization |
| `30` | 302 | Credit-organization branch |
| `40` | 87 | CBR field institution |
| `51` | 1 | Federal Treasury |
| `52` | 141 | Territorial Federal Treasury authority |
| `65` | 9 | Foreign central/national bank |
| `71` | 27 | Credit-organization customer that is an indirect participant |
| `75` | 2 | Clearing organization |
| `90` | 280 | Insolvency administrator / liquidator / liquidation commission |
| `99` | 78 | CBR customer outside the payment system |

Official item 72 also defines unobserved types `16`, `60`, `78`. Their absence here does not prohibit future files from containing them.

### Accounts by RegulationAccountType

Labels follow official item 81 (PDF pp. 33–34), not guesses based on account-number prefixes.

| Code | Count | Official meaning, abbreviated |
| --- | --- | --- |
| `BANA` | 183 | Bank account other than correspondent/subaccount or unified treasury account |
| `CBDC` | 1 | Digital-ruble platform operator account |
| `CLAC` | 3 | Clearing account |
| `CRSA` | 952 | Correspondent account/subaccount |
| `TRSA` | 105 | Territorial Federal Treasury account |
| `TRUA` | 3 | Trust-management account |
| `UTRA` | 92 | Unified treasury account |

### Accounts per participant

| Account records | Participants |
| --- | --- |
| 0 | 199 |
| 1 | 1084 |
| 2 | 74 |
| 3 | 16 |
| 4 | 4 |
| 5 | 1 |
| 7 | 1 |
| 9 | 1 |
| 10 | 1 |
| 12 | 1 |

### Observed statuses and other categorical values

Values below are observations, not XSD enumeration definitions. Names, addresses and banking records are not reproduced.

| Field | Observed value: count |
| --- | --- |
| `ParticipantInfo.ParticipantStatus` | `PSAC`: 1382 |
| `Accounts.AccountStatus` | `ACAC`: 1339 |
| `ParticipantInfo.Srvcs` | `1`: 328; `2`: 1; `3`: 799; `5`: 227; `6`: 27 |
| `ParticipantInfo.XchType` | `0`: 341; `1`: 1041 |
| `ParticipantInfo.CntrCd` | `AB`: 2; `AM`: 1; `BY`: 1; `CN`: 1; `GE`: 1; `IR`: 1; `KG`: 5; `KZ`: 2; `MM`: 1; `OS`: 1; `RU`: 1169; `TJ`: 18; `TM`: 1; `US`: 2; `UZ`: 3; `VE`: 1 |
| `ParticipantInfo.Tnp` | `г`: 1324; `г.`: 1; `город`: 23; `нп`: 1; `п`: 9; `пгт`: 5; `рп`: 1; `с`: 3 |
| `RstrList.Rstr` | `FOCL`: 19; `LWRS`: 1; `URRS`: 274 |
| `AccRstrList.AccRstr` | `CLRS`: 16; `FPRS`: 4; `LMRS`: 16; `SCRS`: 1; `SDRS`: 7; `URRS`: 27 |
| `SWBICS.DefaultSWBIC` | `0`: 3; `1`: 285 |

`PSAC` and `ACAC` mean active in the official temporal lifecycle definitions (items 78 and 80, PDF pp. 32–33); they do not imply absence of restrictions or eligibility for every service. Participant restrictions affect 293 participants (292 with one, one with two); account restrictions affect 55 accounts (39 with one, 16 with two). Keep status and restrictions separate. The absence of `DateOut`, `PSDL` and `ACDL` in this full snapshot is not evidence that deletion never occurs.

SWIFT BICs occur on 285 participants: 282 with one and three with two. `DefaultSWBIC` occurs as 285 ones and three zeros. All observed default flags are lexical digits, but XSD admits boolean text too.

### Missing fields and observed identifiers

The attribute tables above contain all missing counts, including schema-defined but unobserved `EDReceiver`, `ChangeType` and `DateOut`. Location is not always complete: `Adr` missing 27, `Nnp` 14, `Tnp` 15, `Ind` 4, `CntrCd` 172. `EnglName` missing 1086, `RegN` 433 and `PrntBIC` 916. No present attribute anywhere is empty. All required XSD attributes are present. `Rgn` has 87 distinct strings; `CK` 98. Those high-cardinality text fields are not enumerated types.

All 1382 BICs have 9 characters; 1271 start with zero. All 1382 UIDs have 10 characters. All 1339 account numbers have 20 characters and are numeric in this input; the XSD account pattern is broader. No numeric coercion is appropriate for these identifiers.

### Duplicates and relationships

| Check | Result |
| --- | --- |
| BIC duplicate groups | 0 |
| UID duplicate groups | 0 |
| SWBIC duplicate groups | 0 |
| Account-number duplicate groups globally | 31; 42 extra rows beyond distinct numbers |
| Repeated account multiplicities | 25 numbers twice; 3 three times; 1 four times; 2 five times |
| Duplicate `(owning BIC, Account)` pairs | 0 |
| Duplicate `(AccountCBRBIC, Account)` pairs | 0 |
| Duplicate NameP groups | 46; 1321 distinct names |
| Duplicate nonmissing RegN groups | 2; one value occurs 8 times, another 2 times |
| PrntBIC edges | 466; all resolve to a BIC in this snapshot; no self-links/cycles |
| Parent-chain depth | 916 entries depth 0; 453 depth 1; 13 depth 2 |
| AccountCBRBIC references | 1339; one does not resolve in this snapshot; one self-reference on the CBDC account |
| SuccessorBIC references | 7 (all on SDRS restrictions); one distinct target, resolving in this snapshot |

Do not deduplicate accounts by account number alone or names by equality. Neither candidate account pair is established here as a universal key. The missing servicing reference is an observed join limitation; cause and handling are **UNKNOWN / DECISION REQUIRED**. No sensitive record list is published in this report. XSD validation passing does not enforce these joins or observed uniqueness: no `xs:key`, `xs:unique` or `xs:keyref` is declared in the four-member schema closure.

## Official document context and limitations

Within the [same official archive](https://cbr.ru/Content/Document/File/123129/UFEBS_v2026_09_0.zip):

- `Doc/УФЭБС_2026_09_0_КБР_Кодовые_Значения.pdf`, SHA-256 `3b9e5704da6dd0b05772798240b07f64620b57538d859c56a2c75ab3efa2e2a4`: entries 65–67 (p. 29), 72–74 (pp. 30–31), 75–81 (pp. 32–34) support the code interpretations above. These page numbers match the printed page numbers.
- `Doc/УФЭБС_2026_09_0_КБР_Реквизитный_Состав.pdf`, SHA-256 `296e1580b9de76a537dde7014c7bb3442c1be2b83742050b6cf69d82c4b36d5e`: section 4.118, table 126, pp. 481–483 inspected for message header, multipart and directory-entry context. Page 482 makes DirectoryVersion omission conditional on a full directory sent on request. This input has `CreationReason=FCBD`; do not generalize that conditional rule into a prohibition of DirectoryVersion in all FIRR files. Full review of conditional rules is still required.

### UNKNOWN

- Original download URL/time, chain of custody and authenticity of the supplied banking input. Hashes and ZIP equality establish local integrity only.
- Exact generating schema release. Compatibility with 2026.09.0 is verified; a release identifier is not present in the XML.
- Official completeness of this snapshot, freshness beyond its declared BusinessDay, and correctness of all records.
- Cause of the unresolved AccountCBRBIC reference and whether partial/historical reference resolution is appropriate.
- All conditional business rules, reference/uniqueness guarantees across snapshots, and changes/multipart behavior beyond the cited evidence.
- Redistribution terms and permissible publication/retention of derived information; no publication authorization is inferred from access to the source.

### DECISION REQUIRED

See [conceptual data model](data-model.md): snapshot identity, account identity, handling unresolved references, lexical preservation, validation policy, multipart/updates and publication scope. No output contract is approved.

## Verification

Completed on 2026-10-08:

- Both source hashes matched `SHA256SUMS` before research and after the local build; ZIP/member equality was rechecked.
- `pnpm run build` passed: zero errors, warnings or hints; all nine static routes generated.
- `public/` and `dist/` contain no XML/ZIP or byte-identical source copies. Original XML/ZIP remain ignored and untracked.
- The Git diff is limited to `tools/bic/docs/source-research.md` and `tools/bic/docs/data-model.md`. No converter, JSON Schema, published banking dataset, dependency or website architecture change was introduced.
- Research schema/PDF files remain in `/tmp/` and are not committed. PG27, Fake Bank and Fake Shop repositories were not modified.
