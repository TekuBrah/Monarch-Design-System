# Monarch Design System — Chat Handoff (2026-07-10)

Supersedes `MONARCH-CHAT-HANDOFF-07082026.md` for "what's the current state"
purposes — that file is left in place unedited as historical record (it in
turn superseded `07052026`, also left unedited). Read this file for current
state; read the earlier ones only if you want the history of how each prior
phase went.

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
- **Known MCP quirk**: `get_design_context` reliably times out (~300s) when
  called on an entire component set, in parallel, or with `forceCode` — but
  returns fine called on **one variant node at a time, sequentially**. This
  is how every component this session was read, including two reads
  (DatePicker Focus, DatePicker Subtle-Focus) that returned payloads large
  enough to require paging through the persisted tool-result file rather
  than the inline response.

## Standing rules — pointer only

Standing rules, token protocols (including the token-source gap protocol and
the `color-mix()` precedent), API conventions, the accessibility baseline,
and the exact showcase wrapper pattern all live in **`CLAUDE.md`** and
**`.claude/skills/monarch-component/SKILL.md`** — do not restate them here.

## Current state (verified via `ls src/components/` and `git log --oneline`)

**31 components on disk**, all in `src/components/`:

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Checkbox, Chips,
**DatePicker**, Divider, ElementWrapper, Field, FilterChips, Icon, IconButton,
IconObject, Label, Link, Loader, Logo, ProgressStepper, Radio, **Select**,
**SelectTransfer**, **SelectWalletAccount**, Tab, Tabs, Tag, **TextArea**,
**TimePicker**, Toggle.

Bold = new since the `07082026` handoff (27 → 31, four added this session on
top of the three — Select, SelectTransfer — already present then; see below
for the full picture since `07052026`: 24 → 31, seven added total).

**`docs/component-tokens.md` has 31 `## ` sections — matches the component
count exactly.** Every component on disk has a docs entry; nothing is
behind.

**Icon set is now 96 icons** (was 94 as of `07082026`) — `calendar_month` and
`remove_circle` were added this session, both from the already-installed
`@material-design-icons/svg` package (no new dependency).

### Recent commit history (most recent first)

```
50d7c00  Align monarch-component skill with CLAUDE.md standing rules
bafb95a  Update Tab focus ring per Figma (offset + radius)
0dcb9ff  Add Field (input/field) component
baf710b  Document standing rules in CLAUDE.md; add handoff file (07052026)
ba33dac  Remediation G4 — geometry hygiene
7a6562c  Remediation G3 — accessibility
6b6116c  Remediation G2 — API consistency
3f7ad8e  Remediation G1 — token/doc defects
```

Everything from `50d7c00` and earlier is committed. **Everything built since
then — Select, SelectTransfer, and everything new this session — is
uncommitted.** See the "Uncommitted" section at the end.

## Built this session — checkpoint/verification status

Picking up from `07082026` (where `Select` was done and `SelectTransfer` had
two open items), this session closed out the `input/select` family and added
three more single-line form inputs that share the same box-token family. All
components below went through the full checkpoint discipline (read → report
→ STOP → build → report mapping → STOP → docs → showcase → verify in both
themes) — nothing here is partial or needs a follow-up pass, **with one
exception noted under `SelectWalletAccount` below.**

- **`SelectTransfer`'s two open items from `07082026` are both resolved.**
  The docs entry now exists. The `Attention` confirmation pass is done:
  every Attention state was re-read individually, three real bugs were
  found and fixed (Hover was a no-op, Invalid only recolored the border
  instead of changing shape, Focus/Selected/Filled wrongly inherited the
  glow-ring treatment). Docs entry has a "Provenance note" documenting what
  changed and why. Nothing outstanding on this component.

- **`SelectWalletAccount`** (node 189:5871) — built, then corrected twice
  on the same issue: a `logoSlot` prop was added (matching Figma's
  `iconLeft` toggle in the raw code-gen), first rendered inside the
  bordered trigger box, then moved outside it after user pushback, then
  **removed entirely** after a direct Figma screenshot showed `iconLeft` is
  `false` in all 14 real variants — the logo only belongs to the (still
  unbuilt) dropdown's `<item>` rows. Final state is clean and verified, but
  worth knowing this component went through more churn than the others.

- **`TextArea`** (node 53:2473) — clean build. One thing worth knowing: the
  raw code-gen's `justify-content` toggle per state looked like a real
  centering behavior but a screenshot proved it has no visible effect (the
  content is always top-aligned) — documented as a "screenshot correction,"
  not implemented.

- **`DatePicker`** (node 54:1550) — Figma's Focus state renders a complete
  working calendar (month header, prev/next nav, day grid), not a
  placeholder like Select's menu. Built as a `calendarSlot` prop per Teku's
  explicit direction, consistent with the rest of the family — a real
  `Calendar`/date-grid component is deferred, same as `Menu`/`Option` is for
  `Select`. Also has a genuinely non-obvious confirmed rule: the trailing
  icon is `calendar_month` vs `cancel` (clear) based on `hasValue &&
  !isFocused`, **except** `isInvalid` always forces `cancel` regardless of
  focus (that combination itself was never directly read — the safest
  interpretation of confirmed data, flagged as such in the docs).

- **`TimePicker`** (node 54:10462) — built as `TimePicker`'s own sibling,
  **not** copied from `DatePicker` despite the near-identical variant shape
  (same 7 states including "Hydrate"). Three confirmed rules genuinely
  diverge from `DatePicker`: single fading icon instead of a two-icon swap,
  Hydrate *hides* the icon (opposite of `DatePicker`), and Subtle-Hover
  gains a background tint (every other Subtle-Hover in this family is fully
  inert). Also has one corrected Figma anomaly: Standard-Disabled's
  background token in Figma resolves to white (`--border/on-color`, a
  border-family token misapplied to a background), breaking the pattern
  every sibling uses (`surface/disabled/default`) — flagged, approved by
  Teku, and normalized in code with the correction documented inline.

## Audit performed this session (Field, Select, SelectTransfer, SelectWalletAccount)

Teku requested a standalone 5-point audit (token-only check, alias-vs-mapped
check, token-existence check, API-consistency check, docs-vs-code check)
across these four already-built components. Findings and fixes:

- **Real bug found and fixed**: `Field`'s compact-mode (`isCompact`)
  `ariaLabel` prop was a no-op — no element in the DOM ever received an
  accessible name. Fixed with `role="img"` + `aria-label` on the outer box,
  verified via DOM inspection (not just attribute presence).
- **`id` prop was missing from all four components' docs props tables** —
  scoped-checked against `Checkbox`/`Radio`/`Tab` (which already documented
  it correctly) to confirm this was isolated to the batch, not
  codebase-wide, then fixed in all four.
- Minor docs drift fixed: `name`/`type` added to `Field`/`Select` docs
  tables; `Select`'s accessibility section corrected (`aria-autocomplete`
  is conditional on `searchable`, not unconditional).
- **Parked, not fixed**: untokenized `0.12s` transition / `z-index` /
  `opacity` values — confirmed as a codebase-wide pattern (10+ files use
  `0.12s`), not specific to the audited four. Fixing it means deciding
  whether to add a motion/elevation token layer to the pipeline — a
  design-system decision for Teku, not a code fix. Left as-is on purpose.

## Open decisions still parked for Teku

Carried forward, still unresolved:

- **Size-vocabulary normalization** — seven different size-name vocabularies
  across components (`s|m|l`, `xs..xxxl`, `small|medium|large|xl|xxl`,
  `regular|large`, `medium|large`, `M|S`, `S|M`). Not touched this session.
- **`disabled` vs `isDisabled` naming split** — Button/IconButton/ButtonGroup
  use `disabled`; everything built since (including all seven new
  components across the last two sessions) uses `isDisabled`. Not resolved,
  just consistently deferred to the majority convention.
- **Chips/Badge alias colors** — Chips' subtle-fill backgrounds and Badge's
  `added`/`removed`/`dark` backgrounds still use `--alias-*` directly
  (frozen across themes); both disclosed in their docs entries. Not touched.
- **`<Section>` wrapper extraction** — the showcase wrapper is copy-pasted
  inline in every section (now 31 of them). Still not extracted; still needs
  Teku's go-ahead.
- **Field / "Chip" component** — the removable-tag component next to Filter
  Chips in Figma (node 228:1296). Still not built, still a future candidate.
- **Motion/elevation token layer** — new this session (see audit above).
  `0.12s` transitions, `z-index: 10`, and glow-ring `opacity: 0.25` are
  hardcoded consistently across the whole codebase because no token layer
  covers duration/z-index/opacity. Not a defect in any one component: a
  pipeline-scope question (add a 6th token layer, or accept these as
  permanently-literal CSS mechanics) for Teku to decide.

**New this session:**

- **The "app-provided slot" pattern is now fully established across three
  different complexity levels**: a plain option list (`Select`,
  `SelectTransfer`, `TimePicker`), and a full calendar widget
  (`DatePicker`). All follow the same `isOpen`/`onOpenChange` +
  `<name>Slot` shape. `Menu`/`Option` (the shared dropdown chrome) and
  `Calendar` (the date-grid) remain deferred, unbuilt component candidates —
  every consumer of them so far has used inline app-level demo content in
  the showcase instead.
- **Two Figma-source anomalies were found and resolved this session, both
  documented as deliberate corrections, not silent fixes**: `SelectWallet
  Account`'s phantom `iconLeft` toggle (removed), and `TimePicker`'s
  anomalous Disabled background token (normalized, approved by Teku).

## Deferred (carried forward, unchanged)

- **Token build script consolidation** — five `build-*.mjs` scripts could
  become one `npm run build:tokens`; Style Dictionary as a longer-term
  option. Still open, still low priority.
- **Doc site: Storybook vs. custom** — undecided, no pressure.
- **Figma "doc frames" experiment** — whether to propose a cleaner
  Figma-side convention separating real components from their documentation
  scaffolding. Still just an idea.
- **Commit-email privacy step** — revisit before any external sharing of
  this build process. Not urgent.
- **`Menu`/`Option` and `Calendar` components** — see "New this session"
  above. Every Select-family and picker component built so far treats these
  as app-provided slots rather than building them; they remain real,
  unbuilt candidates whenever Teku wants to tackle them.

## Uncommitted / unpushed right now

Working tree is **not clean**. `git status --short`:

```
 M docs/component-tokens.md
 M src/App.tsx
 M src/components/Field/Field.tsx
 M src/components/Icon/icons.ts
?? src/components/Select/
?? src/components/SelectTransfer/
?? src/components/SelectWalletAccount/
?? src/components/TextArea/
?? src/components/DatePicker/
?? src/components/TimePicker/
```

`Field.tsx` and `Icon/icons.ts` are modified (not new) — the compact
`ariaLabel` a11y fix and the two new icon additions, respectively. Everything
else is new. Nothing has been pushed to remote this session (or any prior
session — Teku pushes manually via Sourcetree). The last pushed-relevant
local commit is whatever Teku has already synced; ask before assuming
anything beyond `git log` is on the remote.
