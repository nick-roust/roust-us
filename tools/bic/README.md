# BIK directory research workspace

The website route is `/bik`. The internal workspace is `tools/bic/`, as requested. The page currently reports research status only; there is no directory dataset, search, converter or JSON Schema.

## Documents

- [Source research and preservation](docs/source-research.md): supplied files, integrity records and research still required.
- [Data model](docs/data-model.md): unresolved modeling questions; no output contract.
- [Architecture decisions](docs/architecture-decisions.md): static website boundary and deferred implementation choices.
- [Agent rules](AGENTS.md): ED807 research and implementation restrictions.

## Inputs

Original files are in `../../data/ed807/`. They are not public website assets. The ZIP was also preserved outside `dist/` to prevent the Astro build from deleting it. Run `sha256sum -c SHA256SUMS` in that directory to verify both inputs.

No official ED807 research or validation has been completed by this initialization. Filenames do not establish origin, effective date or suitability for use. Before implementation, obtain authoritative documentation and decide the model, validation, secure parsing, publication and refresh policies. Do not fill those gaps with sample banking data or an invented schema.
