# Monarch Design System — Chat Handoff (2026-07-12)

Supersedes `MONARCH-CHAT-HANDOFF-07102026-2.md` for "current state". Earlier
handoffs (`07052026`, `07082026`, `07102026`, `07102026-2`) left untouched as
history. Read this file for current state.

## Who / goal

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Per-component loop:
read from Figma via the **local figma-desktop MCP**, build consuming only
existing CSS tokens, document, add a showcase section, and stop at checkpoints
for review. Teku pushes manually via Sourcetree — the assistant never pushes.

## Stack / environment (unchanged)

- Vite + React + TypeScript, `@fontsource/poppins`.
- Figma file `xhA5ARVgSeD3gA41lYDqST` ("Monarch design system"), read via the
  **local** figma-desktop MCP (`http://127.0.0.1:3845/mcp`), never the remote.
- Token pipeline (Brand → Alias → Mapped → Responsive → Typography) complete;
  see `CLAUDE.md` for build scripts + cascade contract.
- `npm run dev` for the showcase (`src/App.tsx`, Foundations + Components tabs,
  light/dark toggle).
- **MCP quirks carried forward:** `get_design_context` times out (~300s) on
  heavy nodes (whole variant sets, or nodes nesting full Button/Link/Icon
  instances) — retry on a warm connection often succeeds (worked for Modal and
  the desktop Toast this session). Symbols/main-components read as opaque leaves
  in `get_metadata`. Fetching the exported asset SVGs (`curl localhost:3845/...`)
  is a reliable way to read exact geometry/gradients when the arc/thumb is baked
  as an image.
- **New this session:** the Figma desktop **active tab silently switched to a
  FigJam file** mid-batch — every design node then errored ("FigJam files may
  only use get_figjam/get_screenshot" / "node not found"). Fix is Teku-side:
  re-focus the Monarch **design** tab. Recovered by asking and retrying.

## Standing rules — pointer only

Standing rules, token-source gap protocol, `color-mix()`/opacity precedents,
API conventions, accessibility baseline, showcase wrapper pattern, and
checkpoint discipline all live in **`CLAUDE.md`** and
**`.claude/skills/monarch-component/SKILL.md`** — not restated here.

## Current state (verified via `ls src/components/`, `git log`, `git status`, `grep -c "^## " docs/component-tokens.md`)

**40 components on disk**, all in `src/components/`:

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Checkbox, Chips,
DatePicker, Divider, ElementWrapper, Field, FilterChips, Icon, IconButton,
IconObject, Label, Link, Loader, Logo, Menu, MenuItem, **Modal**,
**ProgressBar**, **ProgressRing**, ProgressStepper, Radio, **RangeSlider**,
Select, SelectTransfer, SelectWalletAccount, **Slider**, Tab, Tabs, Tag,
TextArea, TimePicker, **Toast**, **ToastMobile**, Toggle.

Bold = new this session (7 added; 33 → 40). **`docs/component-tokens.md` has 40
`## ` sections — exact parity with the component count.**

### Recent commit history (unchanged this session — nothing committed here)

```
194391b  no message                (large prior batch — Menu/MenuItem/Select*/DatePicker/TextArea/TimePicker etc.)
50d7c00  Align monarch-component skill with CLAUDE.md standing rules
bafb95a  Update Tab focus ring per Figma (offset + radius)
0dcb9ff  Add Field (input/field) component
baf710b  Document standing rules in CLAUDE.md; add handoff file
```

## Built / done this session

Two phases, both complete and verified in light **and** dark via
`getComputedStyle` (screenshot tool timed out repeatedly, as expected — not the
primary check):

1. **Menu wired into the Select/Picker family.** Replaced the ad-hoc inline
   dropdown markup in the `App.tsx` demos with real `Menu`/`MenuItem`:
   `Select`/`SelectTransfer`/`TimePicker` → `Menu searchBar={false}` +
   `MenuItem type="default"`; `SelectWalletAccount` → `searchBar` + `crypto`
   rows; `DatePicker` → calendar wrapped in `Menu` chrome (added
   `--menu-width` override to `Menu.css`, `426px` default). Docs for those five
   updated. (This is why `Menu/Menu.css`, `App.tsx`, `docs` show as modified.)

2. **`/monarch-component` batch — 4 requests = 7 components** (each through full
   checkpoint discipline, docs + showcase, verified both themes):
   - **`Modal`** (207:3898) — portal dialog over `Blanket`; title + `children`
     content slot + `footer` slot; `IconButton` close; focus trap / Escape /
     restore.
   - **`ProgressBar`** (260:506) + **`ProgressRing`** (235:5711) — bar with
     %/total labels; ring is a 270° conic-gradient gauge (SVG + masked
     foreignObject) reusing `Badge` (dark) for the pill.
   - **`Slider`** + **`RangeSlider`** (234:5319) — single + dual-thumb; drag +
     keyboard + track-click; RangeSlider has a tooltip on the active thumb and
     two **two-way-synced `Field`** inputs (type ↔ drag, no-cross clamp).
   - **`Toast`** (110:4032, desktop) + **`ToastMobile`** (110:4631) — 6
     appearances incl. an `ai` gradient; description + actions are app slots
     (compose inverse `Link`s / inverse-tertiary `Button`).

Every new component: tokens-only (**0 `--alias-` hits**), `tsc --noEmit` clean,
`role`/`aria` wired, 0 console errors.

## ⚠️ Cross-cutting token bug to fix at the token layer (NOT per-component)

**Several `*-on-color` mapped tokens flip to black in dark mode where white is
almost certainly intended** — a token-layer authoring issue, surfaced by (not
caused by) three components this session:

- **`--mapped-icon-primary-on-color`** — white in light, **black in dark**
  (`globals.css` ~line 552 = `alias-foundations-black`), while its paired
  **`--mapped-text-primary-on-color` stays white** (~line 505). Result: on the
  coloured `Toast`/`ToastMobile` banners, the title is white but the leading +
  close icons turn black in dark mode. Kept as-bound by Teku's decision
  (faithful to Figma), but it reads as broken.
- **Badge `dark` appearance** — its `--mapped-text-on-color-heading` flips to
  black in dark, giving black text on the slate pill (low contrast). Surfaced
  via `ProgressRing`'s reused Badge pill.
- (Related family: verify the other `*-on-color` / `on-color-heading` /
  `on-color-label` tokens in the dark block — likely the same slip.)

**Recommended fix:** in the `[data-theme="dark"]` block of
`src/styles/globals.css` (and the generating `build-mapped.mjs` +
`Mapped/Dark.json` source), the `*-on-color*` foreground tokens that sit on
saturated coloured surfaces should resolve to **white** (`alias-foundations-white`),
not black — matching their light values and the `text-primary-on-color` token
that already stays white. This is a **Figma Variables / Mapped-Dark** fix, not a
component patch; once corrected, `Toast` icons and `Badge` dark text become
white in dark mode with no component changes (they already consume the tokens).

## Per-component decisions logged this session (all in docs' "Known Figma inconsistencies")

- **Modal** card bg normalized `Neutral01` → `--mapped-surface-elevation-default`
  (dark-flips); close upgraded to `IconButton` (+4px vs Figma's bare icon);
  no shadow (scrim provides depth).
- **ProgressBar** fill → `--mapped-surface-success-default` (Green/500, dark-flips;
  Figma's Green/400 has no token). Multi-appearance raw atom **deferred** — its
  `default` navy `#44546f` has **no token at all**.
- **ProgressRing** gauge gradient uses brand primitives (blue→purple→red conic);
  arc geometry verified by pixel-sampling.
- **Slider / RangeSlider** track 6→8px (approved round-up, no 6px token); thumb
  ring → `--mapped-surface-elevation-default` (approved, so the knob stays
  visible in dark rather than going black).
- **Toast / ToastMobile** `ai` gradient = brand primitives; icons kept on
  `--mapped-icon-primary-on-color` (the dark-black bug above); built as **two
  components** not one `layout` prop.

## Open decisions still parked for Teku (carried forward)

- Size-vocabulary normalization (7 different size vocabularies across
  components; the new sliders/toasts add nothing new here).
- `disabled` vs `isDisabled` naming split (Button/IconButton/ButtonGroup use
  `disabled`; the new Slider/RangeSlider/Toast use `disabled` to match those,
  while most other recent components use `isDisabled` — split persists).
- Chips/Badge alias colours still frozen across themes (disclosed in docs).
- `<Section>` showcase-wrapper extraction (now 40 inline copies).
- Motion/elevation token layer (durations, z-index, `opacity: 0.25` glow all
  hardcoded — the sliders' halo reuses the 0.25 glow literal).
- Possible `--shadow-elevation` token (Menu's two-layer shadow literal).

## Deferred (carried forward)

- Token build-script consolidation into `npm run build:tokens`.
- Doc site (Storybook vs custom).
- **`Calendar`** date-grid component — `DatePicker.calendarSlot` still
  app-provided (now wrapped in `Menu` chrome).
- **`Scrollbar`** — still deferred.
- Standalone multi-appearance **`ProgressBar` atom** (blocked on the missing
  `#44546f` navy token) — build when that token exists.

## Uncommitted / unpushed right now

Working tree **not clean**. `git status --short`:

```
 M docs/component-tokens.md
 M src/App.tsx
 M src/components/Menu/Menu.css
?? src/components/Modal/
?? src/components/ProgressBar/
?? src/components/ProgressRing/
?? src/components/RangeSlider/
?? src/components/Slider/
?? src/components/Toast/
?? src/components/ToastMobile/
```

`Menu.css` = this session's `--menu-width` override. `App.tsx` +
`docs/component-tokens.md` carry the Menu-integration edits **and** the 7 new
components' showcase + docs. The 7 folders are new this session. **Nothing
committed or pushed this session** — Teku handles all pushes via Sourcetree.
