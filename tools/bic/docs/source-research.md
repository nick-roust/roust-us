# Source research and preservation

## Supplied inputs

The following files already existed in the workspace. Origin, retrieval method, applicable format version and redistribution terms have not been verified. No banking interpretation or validation was performed.

| Original path | Preserved path | Bytes |
| --- | --- | --- |
| `dist/20261008_ED807_full.xml` | `data/ed807/20261008_ED807_full.xml` | 715081 |
| `dist/20261008ED01OSBR.zip` | `data/ed807/20261008ED01OSBR.zip` | 107879 |

Preservation date: 2026-10-08. Both files were copied to new destinations, checked against pre-copy SHA-256, then removed from their original locations. The ZIP was relocated because the build owns `dist/`; it was not unpacked or interpreted.

XML SHA-256 before and after:

```text
b28862aa26ce5063846d7231477b611947afd91bef0c5707f3a26fd8382be779
```

ZIP SHA-256 before and after:

```text
17f241b5581cff94108eb99be953f2339c1733b92250527a4ba6dae8c36e4b12
```

`data/ed807/SHA256SUMS` records these hashes. Source content was preserved byte for byte.

## Git tracking check

Before relocation, `git ls-files --error-unmatch dist/20261008_ED807_full.xml` exited 128: “not a git repository.” `.git/` was empty and read-only. This is an unavailable tracking result, not evidence that the input is untracked. Existing history cannot be inspected in this workspace; no Git metadata was changed.

## Required research

No authoritative ED807 sources have yet been reviewed. Record exact URLs, document versions/publication dates, retrieval dates and supported claims when researching:

- Official Bank of Russia ED807 specification and applicable XSD/namespace.
- Directory publication/download process, full-versus-change semantics and effective dates.
- Definitions and code lists for participants, identifiers, accounts and statuses.
- Required and optional fields, relationships, cardinalities and validation rules.
- Redistribution terms and permitted publication of derived data.

Do not present this checklist as evidence. Unknowns remain unresolved until supported by primary sources.
