# Monarch Design System — Chat Handoff (2026-07-24)

Every claim below is grounded in `ls src/components/`, `git log --oneline`,
`git status`, `git diff --stat`, and a live rebuild of the token pipeline —
run fresh this session, not carried forward from prior handoff text except
where explicitly marked "carried forward, unchanged." All earlier dated
`MONARCH-CHAT-HANDOFF-*.md` files are left in place, unedited, as historical
record — read this file for current state.

## Who / goal / rules — pointer only

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Standing rules —
token-source gap protocol, alias/dark-flip discipline, API conventions,
accessibility baseline, showcase wrapper pattern, checkpoint discipline — all
live in **`CLAUDE.md`** and **`.claude/skills/monarch-component/SKILL.md`**.
Not restated here; read those files directly, they are the source of truth,
not this handoff.

Stack: Vite + React + TypeScript, `@fontsource/poppins`. `npm run dev` for
the showcase (`src/App.tsx` — Foundations + Components tabs, sidebar nav with
search, top nav with Logo/Tabs/theme-Toggle, light/dark toggle).

## CURRENT STATE — verified fresh this session

```
ls src/components/ | wc -l                 → 45 folders
grep -c "^## " docs/component-tokens.md     → 45 sections
```

Docs/disk parity confirmed exact (45/45). **No new component folders were
built this session** — the component list is identical to `07182026`'s
handoff. This was entirely a token-layer repair + showcase-shell session.

### Full folder list (45, unchanged from last handoff)

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Card, Checkbox,
Chips, DatePicker, Divider, ElementWrapper, Field, FilterChips, Header, Icon,
IconButton, IconObject, Item, Label, Link, Loader, Logo, Menu, MenuItem,
Modal, Navigation, ProgressBar, ProgressRing, ProgressStepper, Radio,
RangeSlider, Select, SelectTransfer, SelectWalletAccount, Slider, StatusBar,
Tab, Tabs, Tag, TextArea, TimePicker, Toast, ToastMobile, Toggle.

(`Card`, `Header`, `Item`, `Navigation`, `StatusBar` — the 5 multi-component
folders flagged as "new, needs sign-off" in `07182026`'s handoff — are now
committed, in `142df40` "Before dark mode fix July 22". That convention-shift
question was never explicitly re-raised or re-answered this session; treat
it as still technically open unless Teku has separately decided it in
Sourcetree/elsewhere.)

## What happened this session (chronological)

1. **Alpha token addition** — user manually added new Figma variables
   (`Alpha light mode` / `Alpha dark mode` alias primitives, `surface.Alpha`
   mapped group) via screenshots, not a Figma export. Added to
   `Alias/Alias.json` and `Mapped/Light.json` + `Mapped/Dark.json` by hand
   (source JSON, not generated files). Two script bugs fixed to support
   space-containing group names (`build-alias-colors.mjs` allowlist +
   slugify, `build-mapped.mjs` slugify) — both still in place, needed for any
   future rebuild.
2. **Dark-mode audit + repair** (read-only audit → 3 clusters, applied by
   explicit per-cluster approval, light mode proven byte-identical after
   each): Cluster A fixed the whole `on-color` family (`text.on-color.*`,
   `icon.*.on-color`, `border.on-color`, `Blanket.on-color`) that was bound
   to `Foundations.black` in dark — this **resolves** the cross-cutting
   dark-mode bug flagged as open in `07162026`/`07182026`'s handoffs. Cluster
   B fixed the neutral surface ramp (`subtlest`/`subtle`/`default`) which was
   resolving to *light* grays on a black page. Cluster C fixed
   `primary.default-subtle` hover/pressed/selected collapsing to page-black.
   Confirmed real breakage fixed: Badge `default` text contrast was 1.03,
   now 10.24.
3. **Button/IconButton refactor** — collapsed the old `appearance="inverse"`
   prop into `[data-theme="dark"]` (Figma's "Inverse" = dark mode, not a
   separate mode). Tokens moved from inline JS objects into `Button.css`
   variant classes + dark overrides. Dark-mode primary fill routed through
   the buttons-only `interactive-on-color` family (not the shared
   `surface-primary-default`, which 35 other components consume) — a
   deliberate, approved deviation from Figma's literal token binding,
   documented in `docs/component-tokens.md`.
4. **FilterChip fixes**: icon color now inherits from the chip root (was
   unset → always black, didn't follow selected-state blue); selected chips
   gained hover/press feedback (previously excluded entirely).
5. **Menu fix**: `.menu__list` inter-item gap set to 0 (was reusing the
   card's own 8px gap).
6. **Showcase redesign** — sidebar navigation + search (categorized,
   collapsible on <1024px behind a hamburger), new top nav (Monarch `Logo` +
   `Tabs` + `Toggle`, replacing hand-rolled buttons), single-page infinite
   scroll preserved. Required physically reordering all 43 Components-tab
   sections into new categories (Actions / Selection & Input / Sliders /
   Status & Feedback / Navigation / Data Display / Overlays / Media &
   Branding) — done via a scratch Node script, not hand-edits, with
   brace-balance and content-integrity checks before touching the live file.
   New file: `src/AppShell.css`.
7. **Logo SVG seam fix** — the Monarch mark is 8 adjacent triangular paths
   with an anti-aliasing gap at their shared edges; welded via a matching
   `stroke` on the `<g>` in `Assets/logo/brand/Monarch logo, Style = Thick.svg`.
8. **UI polish round** (most recent): found and fixed a real bug where 42
   `<hr>` separators between Components-tab sections were unconditionally
   rendered (never gated by `tab === 'components'`) — a latent bug dating
   back to whenever sections were first individually-wrapped, not something
   this session introduced but only now fully fixed across all of them; this
   was producing the "stray lines at the bottom of Foundations" artifact.
   Also: Foundations tab's 8 sections converted from hardcoded light-only
   hex colors to `--mapped-*` tokens (previously never dark-flipped at all);
   removed 7 unnecessary `maxWidth` caps that were leaving visible unused
   space on wide screens (Field, Select, SelectTransfer,
   SelectWalletAccount, DatePicker, TimePicker, TextArea); added a shared
   `.showcase-interactive` container style and applied it to all 17
   "interactive example" blocks across the showcase for visual consistency;
   implemented scrollspy (sidebar highlights the section currently in view).

## Needs review — flagged explicitly, not verified to the same rigor as prior work

- **Scrollspy is implemented but UNVERIFIED.** The browser tool's tab was
  backgrounded (`document.hidden: true`) for the second half of this
  session, and Chrome suspends `IntersectionObserver`/`requestAnimationFrame`
  entirely on hidden tabs — confirmed via a bare vanilla-JS observer test
  that also never fired. The trigger-zone geometry and CSS active-state
  styling were verified independently (manually applying the active class
  renders correctly), but the actual auto-highlight-on-scroll behavior has
  **never been observed working**. Teku needs to check this in a real,
  foregrounded browser tab before trusting it.
- **The 43-section reorder is mechanically verified, not visually
  re-reviewed.** Content-preservation was checked via component-tag-count
  diffing, brace/paren balance, and spot-checking ~10 sections' rendered
  text — but a transformation this size (2923-line diff in `App.tsx`)
  deserves a human visual pass across the full Components tab, not just the
  items explicitly called out in later polish rounds.
- **`docs/component-tokens.md` and `CLAUDE.md`** were updated for the
  Button/IconButton/dark-mode-repair work but **not** for the showcase-shell
  work (sidebar, top nav, `AppShell.css`, scrollspy) — that's shell/harness
  code, not a documented component, so this is likely correct as-is, but
  flagging since nothing describes the new shell anywhere in docs.

## Open decisions still parked for Teku

Carried forward, unchanged unless noted:

- **Size-vocabulary normalization** — still 7+ different size-name
  vocabularies across components. Untouched this session.
- **`disabled` vs `isDisabled` naming split** — unchanged.
- **Chips/Badge alias colours** — unchanged.
- **`<Section>` showcase-wrapper extraction** — still copy-pasted inline
  across 45 showcase sections. (Somewhat more urgent now — the showcase
  redesign touched every section's wrapper anyway; if this extraction ever
  happens, doing it now while the wrapper pattern is fresh in context would
  be cheaper than later.)
- **Field / "Chip" candidate** — still not built.
- **Motion/elevation token layer** — unchanged.
- **Multi-component-folder convention** (`Card`/`Header`/`Item`/
  `Navigation`/`StatusBar`) — see note under "Full folder list" above; never
  explicitly re-confirmed this session, technically still open.
- **RESOLVED THIS SESSION — cross-cutting dark-mode `*-on-color` bug.**
  Previously flagged in `07162026`/`07182026` handoffs as unfixed
  (`--mapped-icon-primary-on-color`, `--mapped-text-on-color-heading`
  flipping to black in dark). Fixed at the token layer this session (see
  "What happened," item 2). `HeaderBg`'s workaround (static
  `--alias-foundations-white` instead of the token) was **not** reverted —
  it's still valid (different reasoning: content on an arbitrary
  user-supplied photo, not an app-controlled surface) — but could now be
  revisited since the underlying token bug that originally motivated extra
  caution there is fixed.
- **NEW — `text.on-color.heading/body`-adjacent members not fully audited.**
  The dark-mode repair fixed the specific `on-color` tokens found via live
  computed-style probing (Cluster A). A few sibling tokens in that same
  family tree may not have been individually verified — worth a targeted
  grep-and-check pass if any component shows unreadable dark-mode text on a
  colored surface going forward.
- **`CardSmartInsights.titleColor` raw-CSS-color prop** — unchanged, still
  the only component accepting an arbitrary CSS color instead of a token.
- **`Link`'s weight limitation** — unchanged, still causing friction
  (SemiBold needed, `Link`'s caption class is Regular-only).
- **`icon_Spend` substitution precedent** (`icon_track_spending` used
  instead) — unchanged, standing precedent for future missing-icon cases.

## Deferred (carried forward, unchanged this window)

- Token build-script consolidation into a single `npm run build:tokens`.
- Doc site (Storybook vs. custom) — undecided, no pressure.
- **`Calendar`** date-grid component — still an app-provided slot inside
  `DatePicker`, not a component.
- **`Scrollbar`** — still explicitly deferred as a component (note: the
  *showcase sidebar's* scrollbar was themed this session via
  `scrollbar-color`/`::-webkit-scrollbar-*` in `AppShell.css` — that's shell
  chrome, not the deferred design-system `Scrollbar` component itself).
- **Standalone multi-appearance `ProgressBar` atom** — still blocked on a
  missing token (`color/background/neutral/bold/default`, `#44546f`, no
  mapped equivalent).

## Uncommitted / unpushed right now

```
Changes not staged for commit:
  modified:   Assets/logo/brand/Monarch logo, Style = Thick.svg
  modified:   CLAUDE.md
  modified:   design-tokens/Mapped/Dark.json
  modified:   docs/component-tokens.md
  modified:   src/App.tsx
  modified:   src/components/FilterChips/FilterChip.css
  modified:   src/components/Menu/Menu.css
  modified:   src/styles/globals.css

Untracked files:
  src/AppShell.css
```

`git diff --stat`: 1702 insertions / 1543 deletions across 8 tracked files
(`src/App.tsx` alone: 2923 lines changed — the section reorder plus this
session's showcase/polish work). `design-tokens/Mapped/Light.json` and
`src/tokens/*.ts` show **no diff** — they already match what's on disk from
a prior commit; this session's `Light.json`-touching work (Alpha steps,
subtle-hover revert) landed back at values identical to `HEAD`, confirmed via
`git diff --stat`.

Pipeline health double-checked by running all 5 build scripts fresh against
the current uncommitted `Dark.json` — reproduces the exact same
already-present `globals.css` diff, no drift introduced.

Last commit on `main` is `142df40` ("Before dark mode fix July 22"). Per
standing workflow, Teku commits/pushes manually via Sourcetree — nothing
staged or committed by me this session.
