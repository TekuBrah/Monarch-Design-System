# Monarch Design System — Chat Handoff (2026-07-14)

Supersedes `MONARCH-CHAT-HANDOFF-07122026.md` for "current state" — that file
is left in place unedited as historical record (it predates this session's
`ProgressRing` rebuild and is now stale on that component specifically).
Earlier handoffs (`07052026`, `07082026`, `07102026`, `07102026-2`) also
untouched. Read this file for current state.

## Who / goal

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Per-component loop:
read from Figma via the **local figma-desktop MCP**, build consuming only
existing CSS tokens, document, add a showcase section, stop at checkpoints for
review. Teku pushes manually via Sourcetree — the assistant never pushes.

## Stack / environment (unchanged)

- Vite + React + TypeScript, `@fontsource/poppins`.
- Figma file `xhA5ARVgSeD3gA41lYDqST` ("Monarch design system"), read via the
  **local** figma-desktop MCP (`http://127.0.0.1:3845/mcp`), never remote.
- Token pipeline (Brand → Alias → Mapped → Responsive → Typography) complete;
  see `CLAUDE.md` for build scripts + cascade contract.
- `npm run dev` for the showcase (`src/App.tsx`, Foundations + Components tabs,
  light/dark toggle).
- **Verification discipline reminder (reinforced hard this session):** the
  Browser-pane screenshot tool timed out on nearly every attempt this session.
  Computed-style (`getComputedStyle`) checks and **canvas rasterization +
  pixel-sampling** (draw the exact live SVG/gradient markup to an off-DOM
  canvas, sample specific coordinates, assert on RGB values) were the only
  reliable verification method for the `ProgressRing` arc/gradient bugs below —
  screenshot-based "looks right" checks had already given false confidence
  twice this session before pixel-sampling caught the real issues.

## Current state (verified via `ls src/components/`, `git log`, `git status`, `grep -c "^## " docs/component-tokens.md`)

**40 components on disk.** No new components since the `07122026` handoff (still
Modal, ProgressBar, ProgressRing, RangeSlider, Slider, Toast, ToastMobile as
the most recent additions) — this session was entirely **bugfixes and Figma
re-verification on `ProgressRing`**, plus one showcase reorganization.
**`docs/component-tokens.md` has 40 `## ` sections — exact parity.**

### Recent commit history (unchanged — nothing committed this session)

```
194391b  no message                (large prior batch)
50d7c00  Align monarch-component skill with CLAUDE.md standing rules
bafb95a  Update Tab focus ring per Figma (offset + radius)
0dcb9ff  Add Field (input/field) component
baf710b  Document standing rules in CLAUDE.md; add handoff file
```

## What happened this session — `ProgressRing` went through 4 real bugfix rounds

The `07122026` handoff reported `ProgressRing` as "done." It was not. Teku
caught three separate, substantive problems across this session, each
requiring actual re-investigation rather than a quick patch:

### Round 1 — showcase demo semantics (the arc was driven by the wrong number)
Teku supplied a real app screenshot (Finance → Budget tab) showing two budget
gauges: one 82% spent (18% left) with a **large** colored arc, one 65% spent
(35% left) with a **visibly smaller** arc. The showcase demo (`App.tsx`,
`ProgressRingDemo`) was computing `value = left%` and feeding that straight
into the arc — backwards: an almost-exhausted budget was showing a tiny arc.
**Fix:** decoupled the two — `value` (arc fill) = spent%, `percentageLabel`
(caption text) = left%, passed separately. The `ProgressRing` component itself
was already correctly agnostic (`value` drives fill, `percentageLabel`
overrides the caption); only the demo's math was wrong. Verified against the
mockup's exact numbers (`RM 350 of RM 1,000`, 65% spent → 65.0% arc fill, "35%"
caption — exact match).

### Round 2 — the arc literally rendered as two disconnected pieces
After Round 1, Teku screenshotted the live showcase and the fill was clearly
**broken**: blue on the left, red on the right, gray in the middle, with the
gap in the wrong place — not one continuous arc. Root cause (found via canvas
rasterization + pixel sampling, not visual inspection):
**`vector-effect: non-scaling-stroke` renders inconsistently inside an SVG
`<mask>`**, combined with `<circle>` + `stroke-dasharray` having ambiguous
draw-direction/rotation semantics. Earlier in-session "verification" had
tested a *solid-stroke* reconstruction that never exercised the mask, so it
missed this. **Fix:** rebuilt the arc using explicit SVG `<path>` arc commands
(`M … A r r 0 largeArc 1 …`, exact φ=225°→135° start/end angles) instead of
dashed circles, and per-size stroke width (`800/renderWidth` viewBox units)
instead of non-scaling-stroke. Verified by rasterizing the *exact* masked
config and sampling all 12 clock positions — single continuous arc, gap
correctly at 6 o'clock — **and** a working screenshot this time (attached in
transcript) showing a clean single arc matching the reference.

While rebuilding, also **removed a token-gap literal**: the previous gradient
needed one un-tokenized hex (`#8c5b99`, Figma's own cyclic-gradient seam
artifact) to reproduce Figma's exact recipe. Restructuring the conic-gradient
stops around the new φ-based coordinate frame made every stop a real
`--brand-*` token — no literal needed. The gradient's rotation origin
(`from -15deg`) is an **empirically measured** compensation (the masked
foreignObject renders the conic ~15° clockwise of its nominal angle) — real
and verified via marker-color pixel-scanning, but its root cause (why exactly
15°) isn't fully explained; flagged in docs, not hidden.

### Round 3 — pill component swap (Teku's explicit request)
Teku pointed out the centre "of {total}" pill didn't match the shared `Badge`
component's geometry (`Badge` has `paddingBlock: 0`; Figma wants explicit 4px
top/bottom padding) and that both words in the row share one weight (a shape
`Badge`'s single-string `label` prop can't model). **Fix:** removed the
`Badge` reuse; built bespoke local markup/CSS in `ProgressRing.tsx`/`.css`
matching Figma's exact spec (`4px 8px` padding, `8px` radius, `--brand-slate-600`
bg). Verified: `padding: "4px 8px"` (was `"0px 8px"` via Badge), both spans
`fontWeight: 600` (matching Figma's medium-size spec).

### Round 4 — per-size spacing/type scale (Teku's most recent request, this turn)
Teku flagged spacing/text-scale/pill-size issues specific to comparing the two
**sizes** against the real Figma frame
(`figma.com/.../node-id=235-5711`). Re-reading **both** variants properly
(earlier session work had only fully read `medium`, 235:5710, and assumed
`large`, 235:5712, scaled identically) found two real deltas:
- **Caption row and pill text were hardcoded to caption-size (12px) for both
  sizes** — Figma's `large` variant uses body-size (16px) for both, and the
  pill additionally **drops semibold to regular** at `large`.
- **Centre content was vertically centred on the container's `w×h` box**
  (`top: 50%`), not the **arc's circle centre** (`0.5 × svg width` — the SVG
  is a `w×w` square top-aligned in a shorter box) — content sat ~11px
  (medium) / ~15px (large) too high in the open gauge for both sizes.

**Fix:** `SIZES` map in `ProgressRing.tsx` now carries per-size type classes
(`captionType`/`captionEmphType`/`pillType`, medium=caption/caption-semibold,
large=body/body-semibold+body-regular-for-pill) instead of one hardcoded set;
`.progress-ring__content` now positions via an inline `--ring-center-y: {w/2}px`
custom property instead of `top: 50%`. Verified live at both sizes: medium
12px/600 caption+pill, large 16px/400 caption + 16px/400 pill (400, not
600 — Figma's spec), amount 24px/32px (32px confirmed at ≥768px — the
responsive type layer's `h4` is 28px mobile / 32px desktop, so 28px alone
isn't a bug), content-to-arc-centre offset = 0px both sizes, all spacing
(content gap 4px, caption-row gap 2px, pill padding/gap/radius) matches Figma
for both sizes.

**Net effect:** `ProgressRing` is now, as of this handoff, verified correct on:
fill semantics (spent vs left), arc continuity, gradient token-cleanliness,
custom pill geometry, and per-size type/spacing — each confirmed by
computed-style + pixel-sampling, not visual impression alone.

### Also this session (minor)
- Merged the separate "Toast (desktop)" / "Toast (mobile)" showcase sections
  in `App.tsx` into one "Toast" section with both side by side (Teku's
  request) — no component code changed, App.tsx only.

## Known Figma inconsistencies / decisions — `ProgressRing` (superseding the `07122026` version)

- **`value` prop = "% spent", not "% left."** The component itself is
  business-agnostic (`value` just drives the arc fill 0–100); callers pass
  `value={spentPercent}` and `percentageLabel={leftPercent+'%'}` separately.
  Documented prominently in `docs/component-tokens.md` so a future consumer
  doesn't repeat Round 1's mistake.
- **Gradient rotation (`from -15deg`) is empirical, not derived.** Measured by
  pixel-scanning marker colors through the exact masked-foreignObject render
  path; verified correct at all sampled clock positions, but Figma's own
  transform stack (a rotation matrix + horizontal flip on the exported layer)
  wasn't fully reverse-engineered — this is a compensation that works, not a
  formula proven from first principles.
- **Pill is custom, not `Badge`.** Both sizes use bespoke local
  markup/CSS now — see Round 3 above.
- **Per-size type scale is real, not a copy-paste of `medium`.** See Round 4 —
  `large`'s caption/pill are body-size (16px), and the pill drops to regular
  weight at `large`. Any future size addition to this component must be
  independently read from Figma, not assumed to scale uniformly.
- Cross-cutting token bug from the `07122026` handoff **still open, still
  unfixed** (this session didn't touch token files): `--mapped-icon-primary-on-color`
  and `--mapped-text-on-color-heading` both flip to **black** in dark mode
  where white is intended — visible on `ProgressRing`'s pill text, `Badge`
  dark, and `Toast` icons in dark mode. Needs a `Mapped/Dark.json` /
  `build-mapped.mjs` fix, not a component patch. See that handoff for the full
  writeup — still accurate, not re-duplicated here.

## Open decisions still parked for Teku (carried forward, unchanged)

- Size-vocabulary normalization (7 vocabularies across components).
- `disabled` vs `isDisabled` naming split.
- Chips/Badge alias colours frozen across themes.
- `<Section>` showcase-wrapper extraction (40 inline copies now).
- Motion/elevation token layer (durations, z-index, `opacity: 0.25` hardcoded).
- Possible `--shadow-elevation` token (Menu's two-layer shadow literal).
- **The on-color dark-mode token bug above** — needs a decision on whether to
  fix at the token layer now or keep deferring.

## Deferred (carried forward, unchanged)

- Token build-script consolidation into `npm run build:tokens`.
- Doc site (Storybook vs custom).
- `Calendar` date-grid component — `DatePicker.calendarSlot` still app-provided.
- `Scrollbar` — still deferred.
- Standalone multi-appearance `ProgressBar` atom (blocked on a missing navy
  token, `#44546f`, `color/background/neutral/bold/default`).

## Uncommitted / unpushed right now

Working tree **not clean**. `git status --short`:

```
 M docs/component-tokens.md
 M src/App.tsx
 M src/components/Menu/Menu.css
?? MONARCH-CHAT-HANDOFF-07122026.md
?? src/components/Modal/
?? src/components/ProgressBar/
?? src/components/ProgressRing/
?? src/components/RangeSlider/
?? src/components/Slider/
?? src/components/Toast/
?? src/components/ToastMobile/
```

Same untracked component folders as `07122026` (no new ones — this session was
fixes, not new builds). `App.tsx` and `docs/component-tokens.md` carry all
four `ProgressRing` rounds' changes plus the Toast showcase merge.
`ProgressRing/ProgressRing.tsx` and `.css` were substantially rewritten
(Round 2's arc/gradient rebuild, Round 3's pill, Round 4's per-size scale).
**Nothing committed or pushed this session** — Teku handles all pushes via
Sourcetree.
