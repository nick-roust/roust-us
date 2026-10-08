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

## Decisions still required

- Authoritative ED807 version/specification and input provenance.
- Derived model and validation rules, supported by source evidence.
- Future parser/tool location, secure XML handling and resource limits.
- Whether processing is offline, build-time or separately operated; no runtime architecture is selected.
- Dataset size, update cadence, full/incremental handling, reproducibility and failure recovery.
- Publication/redistribution permissions and which derived fields may be exposed.
- Long-term local source retention and backup policy.
- Tool interface and accessibility requirements once actual functionality is authorized.

Hosting, deployment and verified project/lab descriptions also remain open at the website level. This initialization makes no external integration or service capability claims.
