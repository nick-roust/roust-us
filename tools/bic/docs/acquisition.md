# BIC-R6 — Official ED807 acquisition

Research date: 2026-10-08. HTTP probes were performed around 06:25–06:27 UTC from the current development environment. Scope: research and documentation only. No downloader, dependency, update workflow, converter, JSON Schema, dataset publication or website change is implemented.

The approved target strategy is [ADR-BIC-001](architecture-decisions.md#adr-bic-001--data-acquisition--update-strategy). **VERIFIED** below means a documented official link or an observed HTTP/file property. **PROPOSED** means a future implementation recommendation. **UNKNOWN / DECISION REQUIRED** marks unverified guarantees and policy choices.

## Findings

| Question | Result |
| --- | --- |
| Current directory URL | **VERIFIED:** `https://cbr.ru/s/newbik`, linked from the official payment-system page |
| HTTP mechanism | **VERIFIED:** GET, observed 301 redirect followed by 200 ZIP; HEAD also succeeded |
| Authorization/browser requirement | **VERIFIED in this environment:** ordinary curl without credentials, cookie jar, JavaScript, browser or special user-agent successfully downloaded the ZIP |
| Date/version | **VERIFIED:** inspect XML metadata; filename and Last-Modified are supporting transport information, not schema-release identifiers |
| Update checking | **VERIFIED:** conditional GET with the observed Last-Modified returned 304 and zero body bytes; an older condition returned 200 |
| ETag | Not present on the tested current ZIP responses; future/global support **UNKNOWN** |
| Historical versions | **VERIFIED:** dated GET form returned links; archives for 2026-10-07 and 2018-07-01 downloaded successfully |
| Automation limits | Numeric ED807 rate limit, SLA and formal endpoint contract **UNKNOWN**; official general web-service guidance asks clients to minimize calls/transfers and cache locally |
| GitHub-hosted runner access | **UNKNOWN:** successful development-environment requests do not establish reachability from GitHub Actions |

## Methodology and primary sources

Official sources inspected:

1. [Payment-system page](https://cbr.ru/PSystem/payment_system/): current ED807 link, declared directory date and date-search GET form. The directly fetched HTML displayed 08.10.2026; a web-tool rendition displayed 07.10.2026. The mismatch shows why HTML labels/cached renditions must not replace XML metadata.
2. [Current-directory link](https://cbr.ru/s/newbik): live GET, HEAD and conditional GET probes. Final response headers and response-body fingerprints were recorded in `/tmp/`.
3. [Historical date query](https://cbr.ru/PSystem/payment_system/?UniDbQuery.Posted=True&UniDbQuery.To=07.10.2026): server-rendered archive link, followed with an unauthenticated GET.
4. [Historical lower-bound date query](https://cbr.ru/PSystem/payment_system/?UniDbQuery.Posted=True&UniDbQuery.To=01.07.2018): links to ED807 and a separate legacy DBF archive. Only the ED807 archive was downloaded.
5. [Technical resources](https://www.cbr.ru/development/): general guidance for web services to reduce requests/transfers, optimize calls and use intermediate storage. This guidance does not provide an ED807-specific quota or availability guarantee.
6. [robots.txt](https://cbr.ru/robots.txt): retrieved with curl; the observed rules do not disallow `/s/newbik`, `/Queries/XsltBlock/File/` or `/vfs/mcirabis/BIKNew/`, and contain no Crawl-delay. This is not a license, SLA or contractual authorization for unlimited automation. The web tool returned 403 for the same robots URL; network/client-dependent access remains possible.

Requests used curl with default TLS verification and bounded timeouts, without retries or parallel bulk history enumeration. Independent probes were limited to the questions above. Downloaded archives stayed in `/tmp/`; XML entries were read in memory with ZIP CRC checking and secure XML parsing (no external entities, DTD loading or network resolution). No entry was extracted into the repository. Existing source files and their manifest were read only.

## Current download — VERIFIED

Entry URL:

```text
https://cbr.ru/s/newbik
```

Observed response chain:

```text
GET /s/newbik
301 Location: /Queries/XsltBlock/File/101478?fileId=0

GET /Queries/XsltBlock/File/101478?fileId=0
200
Content-Type: application/x-zip-compressed
Content-Length: 107879
Content-Disposition: inline; filename=20261008ED01OSBR.zip
Last-Modified: Wed, 07 Oct 2026 21:08:00 GMT
Cache-Control: private
```

The Content-Disposition header also contains a UTF-8 `filename*` parameter with the same name. No ETag was returned. curl negotiated HTTP/2 for the source responses. The proxy's `200 Connection established` is not a Bank of Russia application response and is excluded from the chain above.

Resolved URL observed on this date:

```text
https://cbr.ru/Queries/XsltBlock/File/101478?fileId=0
```

Use the published `/s/newbik` entry point for future current-directory checks. The internal block ID/redirect target is an observation, not a guaranteed stable API; re-resolve it instead of constructing internal IDs or freezing this target. Default curl did not persist or resend response cookies; authentication was not supplied. This establishes browser-free acquisition in the tested environment, not availability on every IP/network.

### Downloaded content and metadata

The official current response ZIP has SHA-256:

```text
17f241b5581cff94108eb99be953f2339c1733b92250527a4ba6dae8c36e4b12
```

It contains one XML member, `20261008_ED807_full.xml`, whose SHA-256 is:

```text
b28862aa26ce5063846d7231477b611947afd91bef0c5707f3a26fd8382be779
```

The downloaded ZIP and its XML member are byte-identical to the existing local inputs. This newly establishes correspondence with bytes served by the official HTTPS source on the research date. It does not reconstruct the original local files' download time or chain of custody.

| Meaning | XML evidence |
| --- | --- |
| Message type | Root `ED807`, namespace `urn:cbr-ru:ed:v2.0` |
| Declared encoding | WINDOWS-1251 |
| Directory business date | `BusinessDay=2026-10-08` |
| Message date | `EDDate=2026-10-07` |
| Creation instant | `CreationDateTime=2026-10-07T18:01:01Z` |
| Full/delta discriminator | `InfoTypeCode=FIRR` (full, per official code table researched in BIC-R2) |
| Intraday directory version | `DirectoryVersion=1` |
| Generating schema release | Not declared; **UNKNOWN**. BIC-R2 verified compatibility with official XSD 2026.09.0. |

The ZIP filename date matches BusinessDay here; Last-Modified is the HTTP representation modification time, not BusinessDay, EDDate or CreationDateTime. Do not infer directory version from `ED01` in the filename. Date/version identification must come from validated XML plus fingerprints; different snapshots can share a date or nominal version. Version-history naming remains a separate design decision.

## Conditional requests and update detection — VERIFIED / PROPOSED

Observed at the current entry URL, following its redirect:

| Request condition | Final status | Body |
| --- | --- | --- |
| No condition | 200 | 107879-byte ZIP |
| HEAD, no condition | 200 | No body; matching representation headers |
| `If-Modified-Since: Wed, 07 Oct 2026 21:08:00 GMT` | 304 | Zero bytes |
| `If-Modified-Since: Thu, 01 Jan 1970 00:00:00 GMT` | 200 | ZIP identical to the unconditional response |

The observed 304 contained Cache-Control but did not repeat Last-Modified or an ETag. Retain the previously accepted validator when omitted from a valid 304. ETag was absent from the tested current GET and HEAD responses; the unrelated robots response did have an ETag. Do not infer ZIP ETag support from robots.txt. If a future ZIP response supplies an ETag, preserve it exactly and investigate conditional support before treating it as verified.

**PROPOSED:** use one conditional GET per daily check, avoiding a routine HEAD-then-GET pair. On 200, compare the unpacked XML SHA-256 as well as archive SHA-256 and validated source metadata. ZIP repackaging can change the archive hash without changing XML. Do not treat Content-Length, filenames, Last-Modified or DirectoryVersion alone as proof of a new dataset. Save validators only with successfully accepted content; otherwise a failed validation could become a cached 304 and mask an invalid update.

A 304 means the server considers this HTTP representation unchanged relative to the request condition. It does not certify the data's freshness, validity or identity against arbitrary local files. Honor it only when the request condition corresponds to a known accepted source state. Without that state, retry once without conditions. Discard validators if the resolved resource identity changes, and use an unconditional GET. A controlled unconditional recheck cadence can be decided later because header changes/delivery behavior are not guaranteed by a published contract.

**PROPOSED force mode:** bypass conditional request headers and fetch current content; retain deduplication, XSD/integrity checks and publication gates. Force does not mean publish invalid data or create a duplicate history version. Manual import bypasses HTTP and feeds local bytes into the same processing gates; it must retain manual-import provenance rather than claiming an official network acquisition that did not occur.

## Historical acquisition — VERIFIED

The official page contains a GET form with:

```text
UniDbQuery.Posted=True
UniDbQuery.To=DD.MM.YYYY
```

Example page request:

```text
https://cbr.ru/PSystem/payment_system/?UniDbQuery.Posted=True&UniDbQuery.To=07.10.2026
```

The returned HTML includes the archive link. JavaScript only supports the user interface; an ordinary GET obtains the link without running it. Follow the ED807 result link, not unrelated HTML links or the legacy DBF result. HTML structure is not a documented versioned API.

Verified historical downloads:

| Requested date | Link returned by the official form | Result |
| --- | --- | --- |
| 07.10.2026 | `https://cbr.ru/vfs/mcirabis/BIKNew/20261007ED01OSBR.zip` | 200, application/zip, 107859 bytes; one `20261007_ED807_full.xml` member; BusinessDay 2026-10-07, EDDate 2026-10-06, DirectoryVersion 1 |
| 01.07.2018 | `https://cbr.ru/vfs/mcirabis/BIKNew/20180701ED02OSBR.zip` | 200, 677872 bytes; one `20180701_807_full.xml` member, 9838893 XML bytes; EDDate 2018-07-01, no BusinessDay or DirectoryVersion |

Historical ZIP hashes respectively: `1df2fa78057233d5954d7b2e432d227a0ef8b068ee8b364ad74ea8799b3aa3f0` and `c58fcff90176c874be579a7e07c8de041a168e042c56e551a5367ecd07cae2a4`.

The 2018 XML has the same root/namespace but lacks BusinessDay, which is required by the researched 2026.09.0 schema. The namespace alone therefore cannot establish historical compatibility. No claim of current-XSD validity is made for that archive. Historic import requires a supported-release policy; do not add guessed BusinessDay/DirectoryVersion fields or silently validate against the wrong release. Its XML naming also differs from the current file, so a fixed `_ED807_full.xml` suffix is not a reliable universal selector.

The UI declares a minimum date of 01.07.2018 and maximum 08.10.2026 on the research date. This is an observed search range, not proof of every day's availability, a retention guarantee, a guarantee of all intraday revisions, or support before July 2018. The archive suffix differs (`ED02` versus `ED01`); do not synthesize filenames. No complete historical enumeration or missing-date behavior test was performed. Bulk backfill is outside the minimal daily mechanism.

## Request restrictions and availability

**VERIFIED:** the technical-resources page recommends fewer calls, less transferred data and intermediate storage; its general web-service notes reserve the ability to discontinue service and disclaim technical support. This supports conservative acquisition and independent serving of accepted local data. It is not an ED807-specific SLA or redistribution license.

**UNKNOWN:** exact allowed requests per unit time, mandatory user-agent requirements, ED807 availability SLA, publication time, retention guarantees, whether WAF/rate limits differ on GitHub-hosted runners, and whether an ED807-specific automation policy exists outside the inspected public pages. No robots prohibition was observed for these endpoints, but absence of a prohibition does not prove unrestricted permitted use. No load test, bypass or high-frequency polling was performed.

**PROPOSED:** retain the approved daily target, avoid per-user or page-load calls to CBR, cache accepted state, serialize concurrent scheduled/force updates, and use bounded backoff. Do not enable the schedule during this research task. An exact UTC schedule time and deployment-environment reachability check are still required; a page date does not establish a guaranteed publication hour.

## Minimal future acquisition mechanism — PROPOSED

1. Read the last accepted source fingerprint, validator, XML metadata and validation evidence from durable project-owned state. Its physical storage and version-history convention remain to be designed; no backend/database is required by ADR-BIC-001.
2. For scheduled mode, GET the official current entry URL with an applicable accepted Last-Modified validator. For force mode, GET without conditions. Resolve a bounded HTTPS redirect chain and check that destinations remain on explicitly permitted official CBR hosts; reject an unexpected host or downgrade instead of forwarding headers blindly.
3. Accept only a valid 200 candidate or a meaningful 304. Stage 200 bytes in temporary storage outside public/build output. Check complete transfer, configured byte limits, actual ZIP/XML format, archive CRC/member selection and decompressed-size limits. Do not trust a filename, MIME type or a 200 status containing an HTML error page. Do not extract arbitrary ZIP paths.
4. Feed official downloads and local XML/ZIP imports into one shared pipeline: safe parsing and namespace check → supported official XSD → agreed integrity/business checks → content identity/deduplication → versioned JSON generation. Integrity checks need a reviewed policy for known unresolved references from BIC-R2; this research does not silently classify every unresolved reference as fatal.
5. Only after successful checks, promote the candidate and its history entry together with accepted metadata/validators. Preserve the last good published version and history on any acquisition, parsing, validation or publication failure. No JSON shape or publication transaction implementation is selected here.
6. Record successful checks separately from successful content updates: 304 or identical XML does not create a history version. Keep checked-at, source BusinessDay and last-successful-update distinct. Assess backward dates or altered same-day content with an explicit rollback/revision policy; never silently replace current content with an older candidate.

### Failure handling recommendations

These rules are **PROPOSED**, not verified server behavior. No destructive or outage-inducing probes were made.

| Failure | Future behavior |
| --- | --- |
| DNS, connect/read timeout, interrupted body | Discard incomplete candidate; bounded retries; retain accepted state |
| TLS certificate/hostname error | Fail closed; no insecure TLS bypass |
| HTTP 429 or 503 with Retry-After | Honor the delay within the run budget; otherwise stop and report deferred/failed acquisition |
| Other transient 5xx or connection reset | A small capped number of retries with increasing delay/jitter; stop after the budget |
| HTTP 401/403 | Report unavailable access; no auth invention, browser emulation or restriction bypass |
| Current alias/redirect 404/410 or unexpected host | Report source contract change/unavailability; no guessed replacement URL or third-party fallback |
| Historical no-result/404 | Treat as unavailable historical artifact, not an empty valid directory; retain current version |
| HTTP 200 HTML, truncated ZIP, CRC failure, ambiguous members | Reject candidate; do not publish or advance accepted validators |
| Unknown schema/failed XSD/failed agreed integrity checks | Retain last valid version; report diagnostics; do not repair identifiers or missing metadata by guessing |
| 304 without matching accepted state | One unconditional retrieval; failure still preserves current publication |
| Source unchanged but business date old | Report unchanged/stale according to an agreed calendar/age policy; do not invent today's version |
| Conversion/publication failure or concurrent update | Do not promote partial output; serialize promotion and retain the last valid version |

Suggested initial network settings to review before implementation: 10-second connect timeout, 60-second request timeout, at most three total attempts, bounded redirect count, and increasing retry delays with jitter. These are engineering proposals, not Bank of Russia limits. Byte/decompression bounds and retry/schedule budgets require explicit values suitable for supported releases; the 2018 sample is much larger than the current one.

## Decisions and remaining unknowns

- Official browser-free acquisition and conditional Last-Modified checks are technically confirmed from this environment. Test GitHub-hosted runner reachability before enabling the approved daily schedule; no update workflow is created here.
- Choose durable state and atomic version-history promotion, supported schema releases, artifact/version identity, rollback policy and force-mode behavior details.
- Establish exact stale-data/calendar policy, resource limits and bounded retry budget. No source publication-time guarantee was found.
- Historical retrieval by date is confirmed; full archive coverage, missing-date semantics and access to every intraday revision remain unknown.
- ETag support for the ED807 artifact remains unverified; Last-Modified behavior observed today is not a permanent contract.
- Clarify any ED807-specific automation and redistribution requirements before publication; general website guidance is not a data license.

## Verification

Verified on 2026-10-08: source XML/ZIP hashes match SHA256SUMS, and the manifest matches its committed bytes. New downloads exist only in `/tmp/`; none are copied to `public/`, `dist/` or the repository. Only this acquisition document and the architecture-decisions ADR record are changed. No production code, dependency, workflow or JSON output is added. `git diff --check` passed. `pnpm run build` passed with zero errors, warnings or hints and generated all nine static pages.
