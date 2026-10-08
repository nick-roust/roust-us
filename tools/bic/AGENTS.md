# ED807 research and implementation boundaries

These rules apply to this workspace and any ED807 code or data work it governs. Root website rules still apply.

## Research first

- Use authoritative Bank of Russia documentation and the applicable official format specifications/XSD as primary sources. Record exact source URL, publication or version date, retrieval date and which claims it supports in `docs/source-research.md`.
- Treat the provided filenames as filenames, not proof of provenance, effective date, completeness, currency or authority. Provenance and redistribution terms are unresolved.
- A sample XML alone is not a specification. Do not infer optionality, cardinality, identifiers, account semantics, statuses, change rules or code lists solely from it.
- Identify the applicable namespace and format version only from verified evidence. Document ambiguities and conflicting sources; do not silently resolve them.
- Keep bank identifiers and account numbers as lossless text unless authoritative evidence requires a different representation. Do not coerce them into numbers or invent validation rules.

## Current authorized scope

- BIC-I1 authorizes the offline Python/lxml converter and unittest coverage under ADR-BIC-003. Local XML/ZIP input and private staging output only. Do not implement acquisition, release promotion, update workflows, search UI or publication without a separate task.
- Do not invent JSON Schema or create placeholder JSON/fixtures that resemble valid banking data.
- ADR-BIC-002 approves contract v1.0.0. Preserve its source-order mapping and consult ADR-BIC-003 for the approved diagnostic policy. Historical research proposals do not override those ADRs.
- Do not claim records are valid, current or complete without a defined, evidenced validation process.

## Source preservation and future implementation

- Original inputs belong in `data/ed807/`, never `public/` or `dist/`. Do not alter their bytes; verify `SHA256SUMS` before and after operations.
- Check whether inputs are Git-tracked before relocating them. If Git metadata cannot be read, record that limitation; do not claim the file is untracked or rewrite history.
- Before a future pipeline is built, document secure XML handling (including external entity/network access policy), limits, deterministic processing, diagnostics and failure behavior. No input should be overwritten on failure.
- Resolve the data model, source update policy, validation rules and publication/redistribution boundaries before publishing any derived records. Derived artifacts must be distinguishable from authoritative originals.
- Never modify PG27, Fake Bank or Fake Shop repositories as part of this tool.
