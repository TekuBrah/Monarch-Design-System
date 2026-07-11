# Monarch Design System — Chat Handoff (2026-07-10, session 2)

Supersedes `MONARCH-CHAT-HANDOFF-07102026.md` for "what's the current state"
purposes — that file is left in place unedited as historical record (it in
turn superseded `07082026`, which superseded `07052026`, both also left
unedited). Read this file for current state; read the earlier ones only for
history.

**Naming note:** this session landed on the same calendar day as the prior
handoff, so the plain `mmddyyyy` name was already taken. This file uses a
`-2` suffix to avoid overwriting it — if a third session happens on
2026-07-10, continue the pattern (`-3`) rather than overwriting either.

## Who / goal

Teku is building a personal design-system codebase — a reusable component
library on top of Figma design tokens, for future apps/sites. Not a product.
The assistant's job across sessions: read each component from Figma via the
local figma-desktop MCP, build it as a typed React component consuming only
existing CSS tokens, document it, add it to the showcase, and stop for
review at defined checkpoints. Teku pushes to remote manually via
Sourcetree — the assistant never pushes.

## Stack / environment (unchanged)

- Vite + React + TypeScript, `@fontsource/poppins` (400/500/600).
- Figma file: `xhA5ARVgSeD3gA41lYDqST` ("Monarch design system"), read via the
  **local** figma-desktop MCP (`http://127.0.0.1:3845/mcp`) — never the
  remote Figma server.
- Token pipeline (Brand → Alias → Mapped → Responsive → Typography) is
  complete; see `CLAUDE.md` for build scripts and the cascade contract.
- `npm run dev` for the local showcase (`src/App.tsx`, Foundations +
  Components tabs, light/dark toggle).
- **Known MCP quirk (carried forward):** `get_design_context` reliably times
  out (~300s) when called on an entire component set, in parallel, or with
  `forceCode` — but returns fine called on **one variant node at a time,
  sequentially**.
- **New MCP quirk this session:** on `MenuItem`'s component set (node
  `43:1222`), `get_design_context` calls on individual variant nodes
  sometimes returned *merged* code covering **two** variants (e.g. asking
  for the `default` type returned a component with both `default` and
  `Crypto` type branches) instead of just the requested one. Distinct from
  the timeout-on-parallel-calls quirk — this returned successfully, just
  with unrequested extra content mixed in. Every variant was still confirmed
  individually regardless of what any single call returned; treat any one
  `get_design_context` response on a variant-set node as *possibly*
  containing more than what was asked for, not less.

## Standing rules — pointer only

Standing rules, token protocols (including the token-source gap protocol and
the `color-mix()` precedent), API conventions, the accessibility baseline,
and the exact showcase wrapper pattern all live in **`CLAUDE.md`** and
**`.claude/skills/monarch-component/SKILL.md`** — do not restate them here.

## Current state (verified via `ls src/components/`, `git log --oneline`, and `grep -c "^## " docs/component-tokens.md`)

**33 components on disk**, all in `src/components/`:

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Checkbox, Chips,
DatePicker, Divider, ElementWrapper, Field, FilterChips, Icon, IconButton,
IconObject, Label, Link, Loader, Logo, **Menu**, **MenuItem**,
ProgressStepper, Radio, Select, SelectTransfer, SelectWalletAccount, Tab,
Tabs, Tag, TextArea, TimePicker, Toggle.

Bold = new this session (31 → 33). Everything else was already present as of
the `07102026` (session 1) handoff.

**`docs/component-tokens.md` has 33 `## ` sections — matches the component
count exactly.** Every component on disk has a docs entry; nothing is
behind.

### Recent commit history (most recent first, unchanged from session 1)

```
50d7c00  Align monarch-component skill with CLAUDE.md standing rules
bafb95a  Update Tab focus ring per Figma (offset + radius)
0dcb9ff  Add Field (input/field) component
baf710b  Document standing rules in CLAUDE.md; add handoff file (07052026)
ba33dac  Remediation G4 — geometry hygiene
```

No new commits this session — everything below is still uncommitted, same
as it was at the start of this session (`Menu`/`MenuItem` are additions on
top of the already-uncommitted pile from session 1).

## Built this session

Picked up exactly where session 1 left off: the deferred "Menu/Option"
dropdown-chrome bucket. Both pieces are now built, each went through the
full checkpoint discipline (read → report → **STOP** → build → report
mapping → **STOP** → docs → showcase → verify in both themes).

- **`MenuItem`** (Figma node `43:1222`, the `<item>` component set) — the
  shared row atom. 22 variants across 5 `type`s (`default`, `crypto`,
  `account`, `checkbox`, `radio`) × state × `isSelected`. Reuses `Avatar`,
  `Checkbox`, `Radio` as real nested instances (not reimplemented). Two
  Figma-source anomalies found and resolved by explicit approval: (1)
  selected-state background was bound to a raw `Blue/50`/`Blue/100` swatch
  instead of any mapped token — resolved via the same `color-mix()`
  derivation already used by `Tag`/`FilterChip` (verified mathematically
  exact: 20% mix = literal `#cde2ff`); (2) the `default` type dimmed its
  label text on hover/press while `crypto`'s hover and `Checkbox`'s own
  press state did not — confirmed as an isolated Figma binding slip and
  normalized to constant text color across all types.
- **`Menu`** (Figma node `48:1701`, `<Menu>`) — the floating dropdown chrome
  that wraps `MenuItem` rows. A single Figma component, not a variant set.
  Reuses `Field` (search bar, real focus/hover states — not hardcoded to
  look permanently focused) and `Icon` (`search` glyph, hardcoded not
  swappable). `searchBar` prop (default `true`) can hide the search field
  entirely, and `slotContent` (no baked-in default, same pattern as every
  other slot prop in this codebase) accepts app-provided option content —
  together these cover both "menu with no search at all" and "one select
  with two independent dropdowns, each needing its own search" per Teku's
  clarification mid-session. One token gap: card shadow
  (`0px 0px 1px rgba(9,30,66,.31), 0px 8px 12px rgba(9,30,66,.15)`) has no
  matching `--shadow-*` token (existing three are flat black-alpha,
  single-layer) — recorded as a literal with a FAIL-LOUD comment.

### Worth flagging — not full-rigor on every point

- **The `Menu` shadow-gap approval was inferred, not an explicit option
  pick.** I asked a 3-option `AskUserQuestion` (literal+comment / reuse
  `--shadow-medium` / discuss a new token); the question went unanswered
  directly — Teku's next message gave scope context ("you may proceed")
  without naming one of the three options. I proceeded with the
  *Recommended* option (literal + FAIL-LOUD comment). Functionally this is
  almost certainly fine, but if Teku didn't actually mean to approve that
  specific option, this is the one place this session where "approved" means
  "inferred from context," not "explicitly selected." Flagging so a future
  session doesn't cite it as a clean explicit approval.
- **`MenuItem`'s nested `Checkbox`/`Radio` use the `inert` HTML attribute**
  (+ `aria-hidden`) so the row alone owns click/keyboard semantics. This was
  a unilateral implementation decision (not stopped-and-asked as its own
  question), though it's disclosed in both the build report and the docs
  entry, including a named trade-off: the nested control's own glyph can't
  show Figma's darker pressed-blue in the one checkbox/radio press+selected
  variant, because `inert` blocks real `:active`. Only the row's background
  gets the correct pressed tint. Low-stakes (cosmetic, 2 of 22 variants) but
  not independently reviewed by Teku the way the two `AskUserQuestion`
  items were.
- **A real structural bug was introduced and then caught/fixed within this
  same session**: the `MenuItem` docs entry got spliced into the middle of
  the `Time Picker` section (between its intro and its own Props table),
  orphaning Time Picker's Props/State/Geometry/Accessibility tables under
  the wrong `##` heading for part of the session. Found via a heading-level
  `grep` sanity check while adding the `Menu` section, fixed, and
  re-verified via the same grep. `docs/component-tokens.md` is correct now
  (33 `##` sections, each self-contained) — but worth knowing this class of
  error (Edit anchor matching the wrong occurrence in a long file) happened
  once and could recur with careless anchor strings in a doc this long.

## Open decisions still parked for Teku

Carried forward, still unresolved:

- **Size-vocabulary normalization** — seven different size-name vocabularies
  across components (`s|m|l`, `xs..xxxl`, `small|medium|large|xl|xxl`,
  `regular|large`, `medium|large`, `M|S`, `S|M`). Not touched this session.
- **`disabled` vs `isDisabled` naming split** — Button/IconButton/ButtonGroup
  use `disabled`; everything built since uses `isDisabled` (`MenuItem`/`Menu`
  have no disabled state at all — Figma's source didn't define one for
  either, so none was added, consistent with the inferred-states rule).
- **Chips/Badge alias colors** — Chips' subtle-fill backgrounds and Badge's
  `added`/`removed`/`dark` backgrounds still use `--alias-*` directly
  (frozen across themes); both disclosed in their docs entries. Not touched.
- **`<Section>` wrapper extraction** — the showcase wrapper is copy-pasted
  inline in every section (now 33 of them, two more added this session).
  Still not extracted; still needs Teku's go-ahead.
- **Field / "Chip" component** — the removable-tag component next to Filter
  Chips in Figma (node 228:1296). Still not built, still a future candidate.
- **Motion/elevation token layer** — `0.12s` transitions, `z-index: 10`, and
  glow-ring `opacity: 0.25` are hardcoded consistently codebase-wide; no
  token layer covers duration/z-index/opacity. Not touched this session.
- **New this session — possible `--shadow-elevation` token.** `Menu`'s card
  shadow (two-layer, navy-tinted alpha) has no matching token and was
  recorded as a literal. Low priority on its own, but if any future
  floating-panel component (tooltip, popover) needs the same recipe, that's
  the trigger to formalize it as a real token instead of a second literal.
- **New this session — `MenuItem`'s inert-control pressed-glyph trade-off**
  (see "Worth flagging" above). Only matters if Teku wants pixel-exact
  fidelity on the checkbox/radio press+selected combo specifically; the
  fix would mean adding a forced-visual "pressed" prop to `Checkbox`/`Radio`
  themselves.

## Deferred (carried forward, with updates)

- **Token build script consolidation** — five `build-*.mjs` scripts could
  become one `npm run build:tokens`; Style Dictionary as a longer-term
  option. Still open, still low priority.
- **Doc site: Storybook vs. custom** — undecided, no pressure.
- **Figma "doc frames" experiment** — whether to propose a cleaner
  Figma-side convention separating real components from their documentation
  scaffolding. Still just an idea.
- **Commit-email privacy step** — revisit before any external sharing of
  this build process. Not urgent.
- **`Menu`/`Option` dropdown chrome — RESOLVED this session.** Both pieces
  (`MenuItem` as of session 1, `Menu` as of this session) are now built.
  Removed from the deferred list.
- **`Calendar` (the date-grid component)** — still deferred, still unbuilt.
  `DatePicker`'s `calendarSlot` remains an app-provided slot, same as
  before. Not touched this session.
- **`Scrollbar`** — still explicitly deferred. Came up twice more this
  session (once in `MenuItem`'s "Parts" frame, once in `Menu`'s own fallback
  demo content) and was excluded both times, consistent with the
  session-1 call to leave it out until a real scrollable-menu composition
  needs it built as its own component rather than raw demo markup.

## Uncommitted / unpushed right now

Working tree is **not clean**. `git status --short`:

```
 M docs/component-tokens.md
 M src/App.tsx
 M src/components/Field/Field.tsx
 M src/components/Icon/icons.ts
?? MONARCH-CHAT-HANDOFF-07082026.md
?? MONARCH-CHAT-HANDOFF-07102026.md
?? MONARCH-CHAT-HANDOFF-07102026-2.md
?? src/components/DatePicker/
?? src/components/Menu/
?? src/components/MenuItem/
?? src/components/Select/
?? src/components/SelectTransfer/
?? src/components/SelectWalletAccount/
?? src/components/TextArea/
?? src/components/TimePicker/
```

`Field.tsx` and `Icon/icons.ts` are still the same session-1 modifications
(compact `ariaLabel` a11y fix, two new icons). `App.tsx` and
`docs/component-tokens.md` now also carry this session's `Menu`/`MenuItem`
showcase and docs additions, plus the doc-structure bugfix described above.
`Menu/` and `MenuItem/` are new this session; everything else in the
untracked list was already untracked at session start. Nothing has been
committed or pushed this session (or any prior session — Teku pushes
manually via Sourcetree).
