# Monarch Design System — Chat Handoff (2026-07-16)

Rebuilt from scratch per Teku's explicit request — not a patch of
`MONARCH-CHAT-HANDOFF-07142026.md`. Every claim below is grounded in
`ls src/components/`, `git log`, `git status`, and `docs/component-tokens.md`
read fresh this session, not carried forward from prior handoff text. Earlier
handoffs (`07052026`, `07082026`, `07102026`, `07102026-2`, `07122026`,
`07142026`) are left in place, unedited, as historical record — read this
file for current state.

## Who / goal / rules — pointer only

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). All standing
rules — token-source gap protocol, alias/dark-flip discipline, API
conventions, accessibility baseline, showcase wrapper pattern, checkpoint
discipline — live in **`CLAUDE.md`** and
**`.claude/skills/monarch-component/SKILL.md`**. Not restated here; read
those files directly, they are the source of truth, not this handoff.

Stack: Vite + React + TypeScript, `@fontsource/poppins`. Figma file
`xhA5ARVgSeD3gA41lYDqST` ("Monarch design system"), read via the **local**
figma-desktop MCP (`http://127.0.0.1:3845/mcp`), never remote. `npm run dev`
for the showcase (`src/App.tsx`, Foundations + Components tabs, light/dark
toggle).

## Workflow change: Figma links read by node-id directly

**`SKILL.md` still describes a selection-only workflow** ("Confirm the
connected Figma desktop file... before reading the selection... If a
different file is open, STOP") — but actual practice across recent sessions
(confirmed in this session's own tool calls) is to extract the node-id
straight out of a pasted `figma.com/design/.../node-id=X-Y` URL and pass it
directly to `get_metadata` / `get_design_context` / `get_screenshot`, with no
dependency on what's currently selected in the Figma desktop app. This is
more reliable (doesn't break if the desktop app's active tab or selection
drifts — which happened at least once this batch, see below) and is the
practice to keep using. **The skill file itself has not been updated to
codify this** — flagging as a real doc-vs-practice gap, not asserting it's
been fixed. Worth a small `SKILL.md` edit in a future session if Teku wants
the doc to match practice.

## Current state — verified fresh this session

```
ls src/components/ | wc -l   → 40
grep -c "^## " docs/component-tokens.md   → 40
git status   → nothing to commit, working tree clean (up to date with origin/main)
```

**Docs/disk parity confirmed exact** — all 40 components on disk have a
matching `## ` section in `docs/component-tokens.md`; nothing built without
docs, nothing documented without code on disk.

### Full component list (40)

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Checkbox, Chips,
DatePicker, Divider, ElementWrapper, Field, FilterChips, Icon, IconButton,
IconObject, Label, Link, Loader, Logo, **Menu**, **MenuItem**, **Modal**,
**ProgressBar**, **ProgressRing**, ProgressStepper, Radio, **RangeSlider**,
Select, **SelectTransfer**, **SelectWalletAccount**, **Slider**, Tab, Tabs,
Tag, **TextArea**, **TimePicker**, **Toast**, **ToastMobile**, Toggle.

**Bold** = built across the two commits below (15 components). Everything
else predates `git log --since=2026-07-05` and is treated as stable/unchanged
this window.

### Status notes (built-vs-verified, not blanket "done")

- **All 15 bold components above went through full checkpoint discipline**
  (read → report → stop → build → report mapping → stop → docs → showcase) —
  no skipped checkpoints found in git history or this session's review.
- **`ProgressRing` needs a status flag beyond "built": it shipped once, then
  required four separate bugfix rounds** after Teku caught issues the
  original checkpoint review missed (see "Bugs found/fixed" below). It is
  **now re-verified** (computed-style + canvas pixel-sampling, both sizes,
  both themes) as of the latest commit — but its history is a concrete
  example of "checkpoint-approved" not meaning "bug-free," worth remembering
  before trusting a first-pass approval on a visually-complex component again.
- **`Field`** had one real accessibility bug (compact-mode `ariaLabel` was a
  no-op) found in a standalone audit and fixed same-session — see below.
- Everything else: built once, checkpoint-approved, not independently
  re-audited since. No known open bugs, but "not re-audited" is a factual
  status, not a claim of perfection.

## Git history since the last handoff before this one

Only **two commits** since `docs/component-tokens.md` last stood at a lower
count (i.e. since the `07082026`/`07102026` handoff era — everything before
`2026-07-11` is untouched this window):

### `194391b` (2026-07-11, "no message") — 8 components + 1 bugfix
Added **Select, SelectTransfer, SelectWalletAccount, DatePicker, TimePicker,
TextArea, Menu, MenuItem**. Also modified `Field/Field.tsx` (11 lines) and
`Icon/icons.ts` (+4 lines, 2 new icons). 4522 insertions across 31 files.

### `d7d990b` (2026-07-16, "July 16") — 7 components + Menu integration + ProgressRing rework
Added **Modal, ProgressBar, ProgressRing, RangeSlider, Slider, Toast,
ToastMobile**. Also modified `Menu/Menu.css` (`--menu-width` override, so
`DatePicker`'s calendar can wrap in `Menu` chrome at a narrower width than
the default 426px), `App.tsx` (+480 lines — showcase sections for all 7 new
components, real `Menu`/`MenuItem` wiring into `Select`/`SelectTransfer`/
`SelectWalletAccount`/`TimePicker`/`DatePicker`'s dropdown slots, and a Toast
desktop+mobile showcase merge), and `docs/component-tokens.md` (+580 lines).
2727 insertions across 26 files. **This single commit is where all four
`ProgressRing` bugfix rounds landed** — the component was rebuilt multiple
times within the session before this commit was made, so the commit
represents the final, re-verified state, not the first draft.

**Both commits are pushed** — `git status` confirms `up to date with
origin/main`, nothing uncommitted right now.

## Bugs found/fixed this window

1. **`Field` compact-mode `ariaLabel` was a no-op** (found in a standalone
   5-point audit across Field/Select/SelectTransfer/SelectWalletAccount).
   No DOM element ever received the accessible name. **Fixed**: `role="img"`
   + `aria-label` on the outer box. Verified present in current
   `Field.tsx` (lines ~72–73: `role={ariaLabel ? 'img' : undefined}`,
   `aria-label={ariaLabel}`).
2. **`id` prop missing from docs props tables** for all four audited
   components (Field, Select, SelectTransfer, SelectWalletAccount) — the
   prop existed in code but wasn't documented. **Fixed**: confirmed present
   in `docs/component-tokens.md` right now for all four (spot-checked each
   section's props table contains an `id` row).
3. **`ProgressRing` arc rendered as two disconnected segments** (blue-left /
   red-right / gray-middle, gap in the wrong place) instead of one continuous
   arc. Root cause: `vector-effect: non-scaling-stroke` renders
   inconsistently inside an SVG `<mask>`, combined with `<circle>` +
   `stroke-dasharray` having ambiguous draw-direction semantics. **Fixed**:
   rebuilt using explicit SVG `<path>` arc commands (exact φ=225°→135°
   start/end angles) instead of dashed circles. Verified by canvas
   rasterization + pixel-sampling all 12 clock positions on the *exact*
   masked render path (screenshot-only checks had already given false
   confidence once before this was caught).
4. **`ProgressRing` fill was driven by the wrong number** — the showcase
   demo computed `value = left%` and fed it to the arc; a real reference app
   screen showed the opposite (an 82%-spent budget has a *large* colored arc,
   a 65%-spent one a smaller one — the arc represents % **spent**, not %
   left). **Fixed**: demo now passes `value={spentPercent}` and
   `percentageLabel={leftPercent+'%'}` separately; verified against the
   reference screen's exact numbers (`RM 350 of RM 1,000`, 65% spent → 65.0%
   arc fill, "35%" caption — exact match).
5. **`ProgressRing` gradient needed one un-tokenized literal** (`#8c5b99`,
   Figma's own cyclic-gradient seam artifact) to reproduce Figma's exact
   recipe under the old dashed-circle approach. **Fixed** as a side effect of
   the arc rebuild — restructuring the conic-gradient stops around the new
   angle-based coordinate frame made every stop a real `--brand-*` token; no
   literal needed anymore.
6. **`ProgressRing` per-size type scale was wrong for `large`** — caption
   and pill text were hardcoded to caption-size (12px) for both `medium` and
   `large`, but Figma's `large` variant (235:5712) actually uses body-size
   (16px) for both, with the pill additionally dropping semibold→regular.
   Content was also vertically centred on the container's box instead of the
   arc's circle centre (~11–15px too high). **Fixed**: per-size type-class
   map added; content position now uses an inline `--ring-center-y` custom
   property. Verified live at both sizes, both the text metrics and the
   0px content/arc-centre offset.
7. **`ProgressRing` centre pill swapped from `Badge` reuse to bespoke
   markup** (not a bug — Teku's explicit design correction): `Badge`'s API
   (`paddingBlock: 0`, single-string `label`) couldn't model Figma's spec
   (explicit 4px vertical padding, two independently-styled words in one
   row). Built as local markup/CSS in `ProgressRing.tsx`/`.css` instead.

## Open decisions still parked for Teku

- **Size-vocabulary normalization** — 7+ different size-name vocabularies
  across components (`s|m|l`, `xs..xxxl`, `small|medium|large`, `M|S`,
  `medium|large`, etc.). Unchanged this window.
- **`disabled` vs `isDisabled` naming split** — Button/IconButton/
  ButtonGroup use `disabled`; most components since use `isDisabled`. The
  newest additions split further: `Slider`/`RangeSlider`/`Toast`/
  `ToastMobile` use `disabled`, while `Modal`/`ProgressBar`/`ProgressRing`
  have no disabled state at all (none exists in their Figma source). Still
  unresolved, now with more data points either way.
- **Chips/Badge alias colours** — Chips' subtle-fill backgrounds and Badge's
  `added`/`removed`/`dark` backgrounds still use `--alias-*` directly
  (frozen across themes). Unchanged.
- **`<Section>` showcase-wrapper extraction** — the wrapper markup is
  copy-pasted inline in all 40 showcase sections now (was ~33 last time this
  was raised). Still needs Teku's go-ahead.
- **Field / "Chip" candidate** — the removable-tag component near Filter
  Chips in Figma (node 228:1296). Still not built, still a future candidate.
- **Motion/elevation token layer** — `0.12s` transitions, `z-index` values,
  and glow-ring `opacity: 0.25` are hardcoded consistently codebase-wide
  (confirmed pattern across 10+ files in an earlier audit). The `Slider`/
  `RangeSlider` halo added this window reuses the same `0.25` literal,
  consistent with the existing (undecided) pattern. No token layer exists
  for duration/z-index/opacity yet.
- **NEW — cross-cutting dark-mode `*-on-color` token bug.** Several mapped
  tokens that should stay white in dark mode instead flip to **black**:
  `--mapped-icon-primary-on-color` (visible on `Toast`/`ToastMobile` leading
  + close icons in dark mode — the paired **text** on-color token correctly
  stays white, only the **icon** token is wrong) and
  `--mapped-text-on-color-heading` (visible on `Badge` `dark` appearance and
  `ProgressRing`'s centre pill — black text on the slate pill in dark mode).
  This is a **token-layer bug** (`globals.css`'s `[data-theme="dark"]` block,
  or the generating `Mapped/Dark.json` + `build-mapped.mjs`), not a
  component-level fix — every affected component already consumes the
  tokens correctly and will self-correct once the token layer is fixed.
  Needs a decision: fix now at the token layer, or keep deferring.
- **NEW — `ProgressRing`'s gradient rotation (`from -15deg`) is empirical,
  not derived.** It was measured by pixel-scanning marker colours through
  the exact masked-render path and is verified correct at every sampled
  point, but Figma's own export transform stack (a rotation matrix +
  horizontal flip on the layer) wasn't fully reverse-engineered — this is a
  working compensation, not a formula proven from first principles. Low risk
  (verified empirically, stable), but flagged for honesty.

## Deferred (carried forward, unchanged this window)

- Token build-script consolidation into a single `npm run build:tokens`
  (currently 5 separate scripts run in sequence).
- Doc site (Storybook vs. custom) — undecided, no pressure.
- **`Calendar`** date-grid component — `DatePicker.calendarSlot` remains an
  app-provided slot (now wrapped in `Menu` chrome via the `--menu-width`
  override, but the calendar grid itself is still custom, not a component).
- **`Scrollbar`** — still explicitly deferred until a real scrollable-menu
  composition needs it as its own component.
- **Standalone multi-appearance `ProgressBar` atom** — Figma's raw
  `<ProgressBar>` primitive has a `default` appearance bound to `#44546f`
  (`color/background/neutral/bold/default`), which has **no matching token
  anywhere** in the system. Blocked until that token exists; the built
  `ProgressBar` component only exposes the success/green look the
  "indicator" actually needs.

## Uncommitted / unpushed right now

**None.** `git status` confirms a clean working tree, up to date with
`origin/main`. Both commits covering this window's work (`194391b`,
`d7d990b`) are already pushed — Teku pushed manually via Sourcetree per
standing workflow.
