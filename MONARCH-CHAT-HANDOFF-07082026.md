# Monarch Design System — Chat Handoff (2026-07-08)

Supersedes `MONARCH-CHAT-HANDOFF-07052026.md` for "what's the current state"
purposes — that file is left in place unedited as historical record of the
batch-build + post-batch-audit work. Read this file for current state; read
the 07052026 file only if you want the history of how the batch/remediation
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
  is how every component this session was read. Budget for it.

## Standing rules — pointer only

Standing rules, token protocols (including the token-source gap protocol and
the `color-mix()` precedent), API conventions, the accessibility baseline,
and the exact showcase wrapper pattern all live in **`CLAUDE.md`** and
**`.claude/skills/monarch-component/SKILL.md`** — do not restate them here.
Both were updated in the previous session (`baf710b`, `50d7c00`) and are
current as of this handoff.

## Current state (verified via `ls src/components/` and `git log --oneline`, 2026-07-08)

**27 components on disk**, all in `src/components/`:

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Checkbox, Chips,
Divider, ElementWrapper, **Field**, FilterChips, Icon, IconButton, IconObject,
Label, Link, Loader, Logo, ProgressStepper, Radio, **Select**,
**SelectTransfer**, Tab, Tabs, Tag, Toggle.

Bold = new since the `07052026` handoff (24 → 27).

**Docs (`docs/component-tokens.md`) currently has 26 `## ` sections** —
**one behind the component count**. `Field` and `Select` both have entries;
**`SelectTransfer` does not yet have a docs entry** (see below).

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

Everything from `50d7c00` and earlier is committed. **Everything built this
session (Select, SelectTransfer) is uncommitted** — see below.

## Built this session — checkpoint/verification status

This session built the start of the `input/select` family, which turned out
to be a searchable combobox (not a plain `<select>`) — the dropdown menu is
explicitly an app-provided slot per Figma's own annotation ("we suggest
creating your own slot component"), so neither component below renders or
owns a menu; they expose `menuSlot` props.

- **`Select`** (base, node 42:949) — **full rigor, same as prior work.**
  Read first → reported variants/nested instances → STOP → built → reported
  exact variant→token mapping → STOP → docs entry written → showcase added
  (including a real interactive open/type/filter demo) → verified via
  `getComputedStyle` in **both** light and dark (dark required a forced
  DOM reflow to get past a stale-computed-style artifact in the preview
  tool — documented in the docs entry) → zero console/server errors →
  alias-grep clean. Nothing outstanding on this one.

- **`SelectTransfer`** (node 189:2229) — **built and computed-style verified
  in both themes, but two things haven't had the full rigor prior
  components got — flagging explicitly:**
  1. **No docs entry yet.** The component exists and is wired into the
     showcase, but `docs/component-tokens.md` has no `## Select Transfer`
     section. This needs to be written before this component is considered
     done per the standing checkpoint discipline.
  2. **Not every `Attention` × state combination was individually read from
     Figma.** The build read `Default`, `Attention/Default`, and
     `Currency Focus` directly and confirmed those; hover/invalid/disabled
     behavior for the `Attention` appearance was extrapolated from the
     shared token pattern rather than individually confirmed per-variant.
     This was disclosed at build time, not discovered after the fact, but
     it's a lower confidence level than the rest of the codebase and should
     be spot-checked against Figma before being treated as final.
  3. Two dropdown menus (amount + currency) are unimplemented app slots,
     consistent with `Select`'s pattern and Figma's own guidance — not a
     gap, just noting scope.

**Not started:** `Select / Wallet Account` (the third node in the original
`input/select` frame, 189:5871) — read and reported once in a prior turn
(two-line account row + a 40px crypto-logo `ElementWrapper` slot) but not
built. **The dropdown `Menu` + `Option` component itself is also not
started** — by design, deferred until all three Select variants exist (per
Teku's explicit direction this session).

## Open decisions still parked for Teku

Carried forward from the `07052026` handoff, still unresolved:

- **Size-vocabulary normalization** — seven different size-name vocabularies
  across components (`s|m|l`, `xs..xxxl`, `small|medium|large|xl|xxl`,
  `regular|large`, `medium|large`, `M|S`, `S|M`). Not touched this session.
- **`disabled` vs `isDisabled` naming split** — Button/IconButton/ButtonGroup
  use `disabled`; Toggle/Tag/Checkbox/Radio/Field/Select/SelectTransfer use
  `isDisabled`. Not touched this session (new components followed the
  `isDisabled` convention, consistent with the majority, but the split
  itself is still unresolved).
- **Chips/Badge alias colors** — Chips' subtle-fill backgrounds and Badge's
  `added`/`removed`/`dark` backgrounds still use `--alias-*` directly
  (frozen across themes); both disclosed in their docs entries. Not touched
  this session.
- **`<Section>` wrapper extraction** — the showcase wrapper is copy-pasted
  inline in every section (now ~28 of them, including Field/Select/
  SelectTransfer, which follow the same pattern). Still not extracted;
  still needs Teku's go-ahead.
- **Field / "Chip" component** — the removable-tag component next to Filter
  Chips in Figma (node 228:1296). Still not built, still a future candidate.

**New this session:**
- **`Select`'s combobox model is now the established pattern** for the
  family — `Select` and `SelectTransfer` both own query/open state and
  expose `menuSlot`/`currencyMenuSlot` rather than rendering a menu
  themselves. This is a real design decision (confirmed with Teku
  mid-session), not just an implementation detail — worth being aware of
  before building `Select / Wallet Account` or the `Menu`/`Option`
  component, so they compose with this pattern rather than diverge from it.
- **`SelectTransfer`'s `Attention` appearance needs a confirmation pass**
  (see above) before being fully trusted.

## Deferred (carried forward, unchanged)

- **Icon bulk-populate on demand** — 94 icons currently (59 Material Round +
  35 custom); add more as components need them.
- **Token build script consolidation** — five `build-*.mjs` scripts could
  become one `npm run build:tokens`; Style Dictionary as a longer-term
  option. Still open, still low priority.
- **Doc site: Storybook vs. custom** — undecided, no pressure.
- **Figma "doc frames" experiment** — whether to propose a cleaner
  Figma-side convention separating real components from their documentation
  scaffolding. Still just an idea.
- **Commit-email privacy step** — revisit before any external sharing of
  this build process. Not urgent.

## Uncommitted / unpushed right now

Working tree is **not clean**. `git status --short`:

```
 M docs/component-tokens.md      (Select's docs entry)
 M src/App.tsx                   (Select + SelectTransfer showcase sections, imports)
?? src/components/Select/
?? src/components/SelectTransfer/
```

Nothing has been pushed to remote this session (or any prior session — Teku
pushes manually via Sourcetree). The last pushed-relevant local commit is
whatever Teku has already synced; ask before assuming anything beyond
`git log` is on the remote.
