# Gate 62b — predictions, written before the first edit (2026-09-22)

Baseline measured at HEAD dc73367 (gate62): 62 files / 579 tests.

## Test count
579 + 5 = **584**, files stay **62** (all additions land in InlineMessage.test.tsx):
- +1 warning title AND body bind the same text colour as neutral, framed and unframed (static CSS parse)
- +1 framed warning border binds --mapped-border-warning-default (static CSS parse)
- +2 it.each isFramed [true,false]: warning renders the leading `warning` glyph
- +1 neutral renders no tone glyph (neutral unchanged)
One EXISTING test is modified, not added: 'carries no dialog semantics and hides
nothing around it' queries [aria-hidden="true"] across the whole container, and the
new decorative glyph's <svg aria-hidden="true"> (from Icon) would trip it. Its
query will be narrowed to exclude the component's own decorative icon; intent kept.

## Token files
Zero changes. design-tokens/**, src/styles/globals.css, src/styles/typography.css,
src/tokens/*.ts byte-identical to v2.3.0; build:tokens produces zero diff.

## Files that change
- src/components/InlineMessage/InlineMessage.tsx
- src/components/InlineMessage/InlineMessage.css
- src/components/InlineMessage/InlineMessage.test.tsx
- docs/component-tokens.md (Inline Message entry)
- CHANGELOG.md (see version note)
- CLAUDE.md (Gate 62b subsection + dated corrections; +N/-0)
Not changing: showcase/App.tsx (already demos neutral, warning framed, warning unframed),
src/index.ts, src/styles/package.css (no new CSS file; detector stays 60/60), package.json.

## Version note (premise failure, see report §8)
v2.4.0 is already tagged (annotated, 2026-09-21 23:55:45) and pushed; main was
fast-forwarded to dc73367 and pushed. Version field left at 2.4.0 untouched; the
CHANGELOG change goes in an unversioned "Unreleased — Gate 62b" entry rather than
rewriting the released v2.4.0 notes. Version number is Teku's call.

## Gate 62 proofs to re-run
InlineMessage.tsx changes -> re-run the 3 InlineMessage proofs (focus, dialog
semantics, sibling operability). Sheet/Modal (4) and photo_camera (1) mutate files
this gate does not touch -> derived, not re-run.
