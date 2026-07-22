# Monarch Design System — Chat Handoff (2026-07-18)

Every claim below is grounded in `ls src/components/`, `git log --oneline`,
`git status`, `git diff --stat`, and `docs/component-tokens.md` read fresh
this session — not carried forward from prior handoff text except where
explicitly marked "carried forward, unchanged." `MONARCH-CHAT-HANDOFF-07162026.md`
(and all earlier dated handoffs) are left in place, unedited, as historical
record — read this file for current state.

## Who / goal / rules — pointer only

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Standing rules —
token-source gap protocol, alias/dark-flip discipline, API conventions,
accessibility baseline, showcase wrapper pattern, checkpoint discipline — all
live in **`CLAUDE.md`** and **`.claude/skills/monarch-component/SKILL.md`**.
Not restated here; read those files directly, they are the source of truth,
not this handoff.

Stack: Vite + React + TypeScript, `@fontsource/poppins`. Figma file
`xhA5ARVgSeD3gA41lYDqST` ("Monarch design system"), read via the **local**
figma-desktop MCP (`http://127.0.0.1:3845/mcp`), never remote — node-ids
extracted directly from pasted `figma.com/design/.../node-id=X-Y` URLs (per
the workflow note already flagged in `07162026`'s handoff; still not codified
in `SKILL.md` itself). `npm run dev` for the showcase (`src/App.tsx`,
Foundations + Components tabs, light/dark toggle).

## CURRENT STATE — verified fresh this session

```
ls src/components/ | wc -l                 → 45 folders
grep -c "^## " docs/component-tokens.md     → 45 sections
git status                                  → 5 modified, 5 untracked folders — NOTHING committed
```

Docs/disk parity confirmed exact at the **folder** level (45/45). But folder
count no longer equals *component* count — this session introduced
multi-component folders for the first time (see "Convention shift" below).

### Full folder list (45)

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, **Card**, Checkbox,
Chips, DatePicker, Divider, ElementWrapper, Field, FilterChips, **Header**,
Icon, IconButton, IconObject, **Item**, Label, Link, Loader, Logo, Menu,
MenuItem, Modal, **Navigation**, ProgressBar, ProgressRing, ProgressStepper,
Radio, RangeSlider, Select, SelectTransfer, SelectWalletAccount, Slider,
**StatusBar**, Tab, Tabs, Tag, TextArea, TimePicker, Toast, ToastMobile,
Toggle.

**Bold** = new this session (5 folders, holding 15 individual exported
components — see breakdown below). Everything else predates this session and
is treated as stable/unchanged this window (last touched per `07162026`'s
handoff, itself grounded in `git log`).

### New this session — 15 components across 5 folders

- **`Navigation/`** → `BottomNavigation`, `SideNavigation`
- **`Header/`** → `HeaderBg`, `HeaderDefault`
- **`StatusBar/`** → `StatusBar`
- **`Item/`** → `ListItem`, `SummaryItem`, `ChartLegendItem`
- **`Card/`** → `CardSmartInsights`, `CardAction`, `CardBalance`,
  `CardDataDisplay`, `CardMonthlyBudget`, `CardGoals`,
  `CardFeaturesAndEducation`

Total exported components now: **55** (40 prior + 15 new), across 45 folders.

### Also modified this session (existing components extended, not rebuilt)

- **`Icon.tsx`**: added an `xs` (12px) size, mapping to `ElementWrapper`'s
  already-existing `xs` token (needed for `ListItem`'s crypto trend
  triangle). No new divergent size vocabulary introduced — extends the
  existing `xs|s|m|l` pattern.
- **`icons.ts`**: +5 icons (`wifi`, `signal_cellular_alt`, `receipt_long`,
  `question_mark`, `send`) — all mechanical additions from
  `@material-design-icons/svg/round`, same pattern as every prior icon.
- **`Logo.tsx`**: added an `xs` (14px height) size for the compact brand mark
  used in `SideNavigation`. **Note**: this was built wrong once, same
  session — first attempt set `xs` to 24px height, which (because the
  Monarch mark's native SVG is 24×14, not square) rendered ~41px wide instead
  of Figma's 24px-wide mark. Caught and corrected to 14px before merging into
  any showcase-visible state.

### Convention shift this session — needs Teku's explicit sign-off

Prior sessions kept a strict 1:1 folder-per-component pattern, even for
closely-related components (`Select`/`SelectTransfer`/`SelectWalletAccount`
are three separate folders). This session grouped related components into
shared folders instead (`Navigation/` holds 2, `Header/` holds 2, `Item/`
holds 3, `Card/` holds 7) because the Figma source itself grouped them as one
family under one "Components" section, and/or explicit instruction described
them as "a few components, but essentially the same thing." **This is a real
convention change, not previously agreed** — worth Teku confirming it's the
right call going forward, or whether it should be reverted to 1:1 for
consistency with the other 40.

## Verification rigor — explicit flag per component group

All 5 new folders went through full checkpoint discipline (read → report →
stop → build → report mapping → stop → docs → showcase) and were verified via
`getComputedStyle` in both light and dark mode before each "done" report. But
rigor **after** that first pass varies a lot — flagging honestly:

- **`Navigation` has the most post-approval correction history of anything
  built this session** (comparable to `ProgressRing`'s history in the last
  handoff). After initial approval, Teku's re-inspection caught: (1) the
  search field wasn't stretching to fill the sidebar (Field's own fixed
  240px demo width leaking through) and the `Logo` `xs` size was wrong
  (24px height instead of 14px, same bug noted above); (2) the bottom-nav
  gradient was asked to use a theme-aware token instead of Figma's static
  white, which I implemented with a genuine bug I caught myself before
  shipping (`color-mix(X 0%, transparent)` resolves to *0% of X* — i.e.
  plain black-based transparent — not "X at 0% opacity"; fixed via CSS
  Color 4 relative-color syntax, `rgb(from var(--token) r g b / 0)`);
  (3) the gradient was then removed entirely per a follow-up request, along
  with the showcase demo's own background wrapper. Current state (verified,
  see `BottomNavigation.css`): no gradient/background on `.bottom-nav` at
  all, page bg shows through.
- **`Header`/`StatusBar` had one correction round**: Teku's re-inspection of
  a screenshot found `HeaderBg`'s bottom padding was missing entirely (I'd
  restructured per-row padding correctly but dropped a ~10px bottom margin
  that exists in Figma's fixed-frame geometry without being an explicit
  padding class in the raw codegen — back-solved from frame-height math
  across all 3 variants, confirmed clean at `--brand-scale-250`). This same
  conversation is also where `StatusBar` was built as its own component
  (previously omitted from `HeaderBg` entirely) and recomposed in.
- **`Item` had only cosmetic showcase follow-ups** (reorder `SummaryItem`
  below `ListItem`, add a real inline SVG sparkline instead of a gray
  placeholder box) — not component bugs, no logic changed.
- **`Card` has had zero re-inspection rounds** — built once, checkpoint
  reported, computed-style verified in both themes, and that's it. Of
  everything built this session, **`Card` is the least battle-tested** and
  the most likely to have an undiscovered issue if given the same scrutiny
  `Navigation` and `Header` got. Flagging explicitly per the request not to
  claim more confidence than earned.

## Open decisions still parked for Teku

Carried forward, unchanged unless noted:

- **Size-vocabulary normalization** — still 7+ different size-name
  vocabularies across components. Unchanged this window; no new divergent
  scheme was introduced (this session's `Icon`/`Logo` `xs` additions extend
  existing vocabularies rather than adding a new one).
- **`disabled` vs `isDisabled` naming split** — unchanged. None of this
  session's new components have a disabled state at all (none exists in
  their Figma source), so no new data point either way.
- **Chips/Badge alias colours** — unchanged.
- **`<Section>` showcase-wrapper extraction** — still copy-pasted inline,
  now in **45** showcase sections (was ~40 last handoff).
- **Field / "Chip" candidate** — still not built.
- **Motion/elevation token layer** — unchanged.
- **Cross-cutting dark-mode `*-on-color` token bug** (`--mapped-icon-primary-on-color`,
  `--mapped-text-on-color-heading` flipping to black in dark mode when they
  shouldn't) — unchanged, still unfixed at the token layer. **New evidence
  this session**: `HeaderBg`'s on-photo text/icons had to deliberately avoid
  these exact tokens and use the static `--alias-foundations-white`
  primitive instead, specifically because `--mapped-text-on-color-heading`
  and `--mapped-icon-primary-on-color` were confirmed (again) to invert in
  dark mode — same root cause flagged in `07162026`'s handoff, now with a
  second independent confirmation from a different component.
- **`ProgressRing` gradient rotation empirical note** — unchanged, not
  touched this session.
- **NEW — `CardSmartInsights.titleColor` is an open raw-CSS-color prop, not
  a token.** Confirmed necessary via the Figma "Ready-made examples"
  reference frame, which shows the same component with 3 different title
  colors (cyan/default/error) across 3 instances — no single token captures
  a per-instance category color. This is the first component in the system
  to accept an arbitrary CSS color as a prop rather than a token reference.
  Worth Teku deciding whether this is an acceptable escape-hatch precedent,
  or whether a proper "category color" token set should be added to the
  pipeline instead so future cases like this stay token-driven.
- **NEW — `Link`'s weight limitation keeps causing friction.** Flagged once
  already on `HeaderDefault`'s "Action" link (Figma wants SemiBold, `Link`'s
  caption class is Regular-only). This session, `CardSmartInsights` avoided
  reusing `Link` altogether for its own "View"/"Plan" trailing link, building
  bespoke markup instead — partly for the same weight reason. Two
  independent workarounds around the same gap suggests `Link` may be worth a
  proper weight prop rather than continuing to route around it per-caller.
- **NEW — `icon_Spend` has no equivalent anywhere** (Material or custom).
  Substituted `icon_track_spending` in `CardMonthlyBudget` per explicit
  approval — noting as a standing precedent for the next "Figma references
  an icon we don't have and there's no obvious substitute" case.

## Deferred (carried forward, unchanged this window)

- Token build-script consolidation into a single `npm run build:tokens`.
- Doc site (Storybook vs. custom) — undecided, no pressure.
- **`Calendar`** date-grid component — still an app-provided slot inside
  `DatePicker`, not a component.
- **`Scrollbar`** — still explicitly deferred.
- **Standalone multi-appearance `ProgressBar` atom** — still blocked on a
  missing token (`color/background/neutral/bold/default`, `#44546f`, no
  mapped equivalent).

## Uncommitted / unpushed right now

**Everything from this session is uncommitted.** `git status`:

```
Changes not staged for commit:
  modified:   docs/component-tokens.md
  modified:   src/App.tsx
  modified:   src/components/Icon/Icon.tsx
  modified:   src/components/Icon/icons.ts
  modified:   src/components/Logo/Logo.tsx

Untracked files:
  src/components/Card/
  src/components/Header/
  src/components/Item/
  src/components/Navigation/
  src/components/StatusBar/
```

`git diff --stat` on the modified files: 785 insertions / 2 deletions across
5 files. Untracked: 35 new files across the 5 new component folders. Last
commit on `main` is `9387a3c` ("New handoff for new Claude Code session"),
and `git status` confirms the branch is otherwise up to date with
`origin/main` — i.e. **none of this session's work exists in git history or
on the remote yet.** Per standing workflow, Teku commits/pushes manually via
Sourcetree — nothing has been staged or committed by me this session.
