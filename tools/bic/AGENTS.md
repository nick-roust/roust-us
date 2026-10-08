# ED807 research and implementation boundaries

These rules apply to this workspace and any ED807 code or data work it governs. Root website rules still apply.

## Research first

- Use authoritative Bank of Russia documentation and the applicable official format specifications/XSD as primary sources. Record exact source URL, publication or version date, retrieval date and which claims it supports in `docs/source-research.md`.
- Treat the provided filenames as filenames, not proof of provenance, effective date, completeness, currency or authority. Provenance and redistribution terms are unresolved.
- A sample XML alone is not a specification. Do not infer optionality, cardinality, identifiers, account semantics, statuses, change rules or code lists solely from it.
- Identify the applicable namespace and format version only from verified evidence. Document ambiguities and conflicting sources; do not silently resolve them.
- Keep bank identifiers and account numbers as lossless text unless authoritative evidence requires a different representation. Do not coerce them into numbers or invent validation rules.

## Current authorized scope

- Documentation and the minimal `/bik` status page only. Do not implement an ED807 converter, parser pipeline, search index or publication job in this foundation task.
- Do not invent JSON Schema or create placeholder JSON/fixtures that resemble valid banking data.
- `docs/data-model.md` records questions, not an approved schema. Obtain verified source research and an explicit later implementation task before defining output contracts.
- Do not claim records are valid, current or complete without a defined, evidenced validation process.

## Source preservation and future implementation

- Original inputs belong in `data/ed807/`, never `public/` or `dist/`. Do not alter their bytes; verify `SHA256SUMS` before and after operations.
- Check whether inputs are Git-tracked before relocating them. If Git metadata cannot be read, record that limitation; do not claim the file is untracked or rewrite history.
- Before a future pipeline is built, document secure XML handling (including external entity/network access policy), limits, deterministic processing, diagnostics and failure behavior. No input should be overwritten on failure.
- Resolve the data model, source update policy, validation rules and publication/redistribution boundaries before publishing any derived records. Derived artifacts must be distinguishable from authoritative originals.
- Never modify PG27, Fake Bank or Fake Shop repositories as part of this tool.
