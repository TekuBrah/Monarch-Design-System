# Monarch Design System — Chat Handoff (2026-08-07)

**This session ran Phase 5, Step 5.4 — Gap Resolution, in the design-system
repo.** Four gaps surfaced while building the MVP's Flow 1 (Homepage); the
roadmap is explicit that they get fixed here, properly, and never patched in the
MVP.

Every figure below comes from a command run fresh at close — `git status`,
`git log --oneline -4`, `git tag -l`, `npx vitest run`, `npm run build`,
`npm run build:lib`, `ls src/components`. Nothing is carried from session memory.

Earlier dated `MONARCH-CHAT-HANDOFF-*.md` files are left unedited as historical
record. Read this one for current state.

---

## CURRENT STATE — verified fresh

| Check | Result |
|---|---|
| Branch | `phase/5.4-gap-resolution` (created off `main` this session — the only git write Claude Code made) |
| HEAD | `82a9490` — "Donut chart prepared for flow 7" |
| Commits this session | `2890873` TrendIndicator · `22f1f49` Card → -500 · `82a9490` charts — **all committed by Teku via Sourcetree** |
| Tags | `v1.0.0` — **not yet bumped.** New components make the next one a minor bump, `v1.1.0` |
| Working tree | **3 modified, uncommitted** — `CLAUDE.md`, `docs/component-tokens.md`, `showcase/App.tsx` (work item D) |
| `npx vitest run` | ✅ **421 passed (421)** across **58 test files** |
| `npm run build` | ✅ clean, 7.80s |
| `npm run build:lib` | ✅ clean, 5.20s · `dist/index.css` 141.27 kB · `dist/index.js` 5,584.26 kB |
| Components on disk | **48 folders** → 46 showcase sections |

Session movement: **45 → 48 components**, **377 → 421 tests** (+44), **43 → 46
showcase sections**.

The only build warning is the pre-existing ">500 kB chunk" notice.

---

## What each work item did

### A — Contrast measurement, then the card sync

**Measured first, built second, by explicit instruction.** Walked all twelve
brand hues at 400/500/600/700/800 against white text, from rendered token values
via a freshly-inserted probe.

**The headline result inverted the expectation.** The concern was that
`--brand-*-400` mid-tones would fail against the *dark* page. They do not — all
twelve clear 3:1 on dark, lowest 5.02. **They fail on light** (10 of 12 below
3:1), and the genuinely unfixable problem is **white text ON the swatch**, which
is identical in both themes because `--brand-*` never dark-flips — confirmed
empirically, not assumed.

**Then: the card synced to `-500`, per Figma, read per variant.**
`Blue/500` `#046eff` · `Orange/500` `#ff8a47` · `Green/500` `#38b860` ·
`Purple/500` `#5e4db2`. Outline unchanged (carries no brand colour).

**DECIDED, not built:** per-hue steps (blue 600, orange 700, green 700, purple
500) were costed and **declined** — darkening further costs the hues their brand
identity. Dark text on orange and green was offered and declined. So the card
ships with a **recorded accessibility gap**: white titles measure blue 4.49,
orange 2.34, green 2.56, purple 6.60 against 4.5:1. Orange and green sit below
even the 3:1 non-text bar. Recorded in `docs/component-tokens.md` with the
decision attached — no substitute token, no `token-exempt`, no CSS workaround.

**Also fixed:** the icon slot used `--mapped-text-primary-on-color` where Figma
binds `icon/primary/on-color`. Corrected to `--mapped-icon-primary-on-color`;
both resolve `#ffffff`, verified unchanged before and after.

**Consequence, deliberate:** `CardFeaturesAndEducation` and `IconObject` now hold
**different values for the same colour name**. They carry different bars — a card
title is text (4.5:1), an `IconObject` glyph is non-text (3:1) — so they were
resolved separately. `IconObject` is **undecided and deliberately left on -400**.
The `ai` gradient's `blue-400` first stop stays, by decision.

### B — `TrendIndicator`, new component

**Why:** `ListItem type="crypto"` drew a green up-triangle unconditionally and
exposed no direction prop. Verified in the MVP's live DOM — Bitcoin (+10.2%) and
Ethereum (−2.49%) both computed `rgb(56,184,96)`, up. Figma's own
`Homepage_Crypto` draws a down triangle for Ethereum, so **the design used a
state the shipped component could not express.**

**Established from Figma, not assumed:** the down state is **not a variant**.
`Item/list` (`153:1841`) ships exactly three symbols and no direction axis; the
trend glyph is a swappable 12px `<element>` instance, and `Homepage_Crypto`
expresses a decline by swapping that instance and overriding the label colour on
that one instance. Verified by mapping every percentage on the screen to its
colour token — the Ethereum row is `--text/error/default`, every other is
`--text/success/default`.

So `TrendIndicator` is a **designed addition, not a faithful build**. `flat` goes
further and exists in no Figma source at all — approved as an addition (a
stablecoin at 0.00% must not render a green up-arrow), and Teku is adding it to
Figma so the two do not diverge.

**API:** `direction` (required, no default — a defaulted direction is the defect
being fixed), `label` (pre-formatted string; the component never formats),
`ariaLabel`, `className`. No `previewState` — Figma defines no interaction states
and none were invented.

**Accessibility:** `role="img"` + a composed label, so direction reaches
assistive tech as a **word**. A leading sign is stripped from the announcement so
`-2.49%` is not voiced twice — the visible label keeps its sign.

**`ListItem` wiring:** `trendDirection?: TrendDirection = 'up'`.
`ListItemProps` is a flat interface, not a discriminated union — **no props type
in this library is** — so it could not be made required on the crypto branch
alone. `.mn-list-item__trend` was **deleted**; the crypto row now composes the
real component. Label colour moved from gray to status-coloured (option A).

### C — The charting primitives

**Scoped before building, and the scope survived contact.** Two public
components, not one and not three:

- **`DonutChart`** — G1 (Flow 3 allocation donut, Flow 10 budget pie). A pie is
  `innerRadius={0}`.
- **`LineChart`** — G3 (Flow 7 trend) **and** C1 (crypto sparkline). A sparkline
  is the same component with all chrome switched off, which is the default.

**Rule-1 check, both argued rather than asserted:**

- **`ProgressRing` is not the donut.** It is a 270° single-value gauge that
  strokes a masked path with a fixed gradient and a `progressbar` a11y model. The
  overlap is twelve lines of arc math. **Not extracted** — extracting would mean
  editing a shipped component `CardMonthlyBudget` consumes, for no behavioural
  gain. `polar()` is duplicated **deliberately**, with a comment in both saying
  so.
- **`ChartLegendItem` could never actually be a legend.** Its badge was
  hardcoded `IconObject color="gray"` — no way to show a series colour, which is
  exactly why the flow inventory found it "never once rendered a chart legend".
  **Widened, not superseded:** `iconColor?: IconObjectColor`, default `'gray'`,
  non-breaking.

**Every Figma source for all three shapes is FLATTENED OUTPUT** — the budget
pie's segments export as `<img>`, the trend chart is two flattened vectors, and
the sparkline is a single `<vector>` shared byte-identically by all three crypto
rows. **Both components are designed additions; the rendering is authored.**
What *was* sourced: the inner radius (0.648), the per-category hue assignment
(from the legend rows, not the chart), the extent behaviour, and the chrome
colours.

**Colour is not a token gap.** Figma already assigns seven distinct
`IconObject` hues one-per-category on the legend rows — red, purple, blue, cyan,
lime, yellow, orange. **The components ship no default palette**; every segment
states its own hue, typed `ChartHue = Exclude<IconObjectColor, 'ai'>` so passing
the gradient is a compile error rather than an unpainted segment.

**No dependency.** Hand-rolled SVG; a charting library would be a runtime
dependency for every consumer with its own theming system fighting the token
layer.

**Data vs chrome are two colour systems, deliberately.** Series colours are
brand primitives, byte-identical in both themes (verified: all twelve, zero
drift) — a category's identity must not change with the theme. Chrome uses the
mapped tier and dark-flips.

**The area fill avoided a token gap rather than negotiating one:** the same hue
at `-100`, not the line colour at reduced opacity. Opacity has no backing token,
so the conventional recipe would have needed a `color-mix` approval; a real step
on the same ramp reaches the same place with a token that exists.

### D — Housekeeping (this work item, uncommitted)

See "Files changed" below.

---

## ⚠️ WORK ITEM E — four token-layer findings, all registered, none fixed

These are **decisions, not defects to code around**. All four are token-layer and
move in Figma first.

**E-1 — Status tokens fail AA as text.** The trend caption is 12px, so 4.5:1
applies. `--mapped-text-success-default`: **2.56:1** light / 5.39:1 dark.
`--mapped-text-error-default`: **3.64:1** light / **3.93:1** dark. Three of four
combinations fail. Affects every success/error text consumer, not just
`TrendIndicator`. Dark mode maps these to the *darker* `-600` step, which is the
wrong direction on a black page.

**E-2 — Figma's Success value has drifted from the pipeline.** Figma reports
`icon/Success/default` and `text/Success/default` as **`#4ecd76`**; the pipeline
resolves both to **`#38b860`** (`Success.500` → `brand-green-500`). Error matches
exactly on both sides (`#eb4f52`), so the drift is isolated to green.

> **⚠️ E-1 and E-2 PULL AGAINST EACH OTHER.** `#4ecd76` is **lighter** than
> `#38b860`. A straight Token Studio re-export to resolve E-2 would make
> light-mode contrast **worse**, not better. **Do not treat the re-export as a
> fix for the contrast finding.** They need deciding together.

**E-3 — The `on-color` family still dark-flips.**
`--mapped-text-on-color-caption`, `-label` and `-placeholder` all flip
`neutral-100` `#e7eaed` → `neutral-950` `#0d0f11`, i.e. near-white to near-black,
on surfaces that by definition do not flip. `-heading`, `-body` and
`--mapped-border-on-color` are correct (white in both).

This is a **surviving instance of the exact defect the 2026-07-22 audit claimed
to have fixed** across "the entire on-color family". It was found because
`LineChart`'s `onColor` chrome needed one of them.

**E-4 — No on-color area-fill token exists.** Tinting white needs an opacity and
no mapped alpha token can do it: the mapped alpha surfaces resolve fully
transparent in both themes, and the only other alpha family is alias tier, which
never dark-flips and may not be used in a component. The `-100` ramp step that
solves this for the twelve hues has **no white equivalent**.

**Related, registered but not part of E — adjacent-segment distinguishability.**
Measured across Figma's own seven-category budget sequence, identical in both
themes:

| Adjacent pair | Contrast | RGB distance |
|---|---|---|
| red \| purple | 1.46 | 136 |
| purple \| blue | 1.25 | 99 |
| blue \| cyan | 1.64 | 95 |
| cyan \| lime | 1.35 | 172 |
| **lime \| yellow** | **1.07** | **66** |
| yellow \| orange | 1.41 | 78 |
| orange \| red (wrap) | 1.44 | 50 |

**Every pair is below 3:1.** `IconObject`'s twelve hues are an icon-badge
palette, not an adjacent-distinguishable categorical scale. A real chart palette
would be its own token decision.

---

## 🔴 WHAT THE MVP INHERITS AND MUST ACT ON

**After the tag bump, these are required — not optional cleanup.**

**1. Crypto call sites MUST pass `trendDirection`.** This change makes the MVP's
Homepage *worse* until they do. Ethereum currently renders gray `-2.49%` with a
green up-triangle; with the status colouring and the `'up'` default it will
render **green `-2.49%` with a green up-triangle** — the same wrong direction,
now asserted in colour. The MVP's own seeded data has three holdings at
`changePct: 0`, which is what `flat` exists for.

**2. Check the MVP for anything targeting `.mn-list-item__trend`.** That selector
was **deleted**. Nothing in the DS references it; the MVP was not audited from
here.

**3. Flow 7's Total Networth card has two known shortfalls before it is built:**
- **It will render with NO area fill** (E-4). Figma's card has one. `LineChart`'s
  `onColor` series cannot paint it because no token can tint white.
- **Its axis labels will be near-black in dark mode** (E-3), on a card that does
  not itself flip. The component uses the semantically correct token and does not
  work around the defect.

**4. `LineChart` needs an explicit `domain` for Flow 7.** The data deliberately
stops before the axis does — see the A10 note below.

---

## ✅ A10 CORRECTION — Flow 7 must NOT inherit this as a defect

The flow inventory (F7 A10) flagged `Line 7` / `Line 8` as suspicious at
*"x=343 with width 343"*.

**They are correct full-width gridlines.** Design context shows
`left-0 … w-[343px]`. The inventory's reading was a **metadata artifact**, not a
defect. Nothing to fix.

The same read established the extent behaviour, which *is* real: gridlines span
the full 343 while the area and line are `w-[176px]`, and the marker (centre
x=176), the vertical rule (x=177) and the callout (x=182) all cluster at the
data's end — which is exactly the `15` tick on an axis labelled 01 / 15 / 31.
**Month-to-date on a full-month axis, deliberate.** A truncated export would not
place the marker and callout at the cut.

---

## 🛠 TOOLING NOTES — each cost time this session

**`read_page`'s accessibility tree is cached and truncates.** It returned
byte-identical 57,448-character output across three consecutive calls —
including one where the target section was `display: none`. It also truncates
long before a section 25 of 46 down the page. **Do not rely on it to verify
accessibility structure.** Fall back to DOM assertions plus the axe checks in the
suite, and say which you used.

**A green vitest suite does NOT prove a consumable package.** `ChartHue` was
added to `DonutChart.tsx` but not to its `index.ts`. Vitest resolves the module
directly and passed all 421 tests while the package was broken; **`tsc -b`
follows the barrel and failed the build.** `npm run build` is the gate that
catches barrel omissions — the suite structurally cannot. The same is true of
`src/styles/package.css`, which fails *nothing* if you forget it and ships a
component with no CSS.

**A comment naming the alias prefix trips the mandated grep.** The skill requires
`grep --alias-` on every component CSS file to return zero. A comment explaining
*why* the alias tier must not be used contains the literal string and makes that
check return 1 — permanently, for a file that is actually clean. Hit twice
(`TrendIndicator.css`, `LineChart.css`); both reworded to describe the tier
without naming it.

**Smooth scrolling and `requestAnimationFrame` do not run while the preview pane
is hidden.** A settle-loop on rAF times out, and `.click()` on a sidebar entry
leaves `scrollTop` at 0. Use an instant `scrollIntoView` and say that the
animation was not verified, only the final placement.

**The preview tool binds to one repo's `launch.json`.** Passing
`name: "design-system"` from a session whose cwd is the MVP returns the MVP's
server on 5174. Starting the DS server needs either a `url:` preview against an
already-running server, or explicit authorisation to launch it.

---

## Files changed in work item D (uncommitted)

**`CLAUDE.md`**
- **Structure section rewritten and verified against disk.** It pointed at
  `src/main.tsx` and `src/App.tsx`, neither of which has existed since Phase 2 —
  this had already cost a fresh session a failed read. Now documents
  `showcase/` (main.tsx, App.tsx, AppShell.css, Section.tsx), `docs/`,
  `src/index.ts`, `src/styles/package.css`, `src/test/`, and the 48-folder
  component count, with a note naming the two registration steps that fail
  silently.
- **Git workflow replaced.** It said local staging and committing was fine,
  contradicting the roadmap's own standing rule. Now: branch creation is Claude
  Code's; staging, committing, pushing and tagging are Teku's alone via
  Sourcetree. **Wording matched to the MVP repo's `CLAUDE.md`** so the two agree.
- **On-color audit entry corrected** — see E-3. It claimed the fix covered "the
  **entire** `on-color` family"; three members still flip. Table added naming
  them.
- **"Next" section replaced.** It said *"Build the first component (e.g.
  Button)"* — 48 components exist.

**`docs/component-tokens.md`**
- **File-key mislabel fixed — and it was systemic, not the single entry
  reported.** `**Source frame:** \`xhA5ARVgSeD3gA41lYDqST\`` appeared on **20**
  entries; that string is the *file key*, not a frame ID. Rewritten to
  `**Source file:**` and, where a node followed, split into
  `**Source file:** … · **frame:** …`. Done with a scratch script and integrity
  checks (line count unchanged 3761, file-key count unchanged 20, zero residual
  mislabels). The 4 remaining `Source frame:` lines carry real node IDs and are
  correct.
- **`#0caaff` decision recorded** under `Toast` (`❖ System message`): no new
  token, `--brand-teal-500` stays, Figma gets updated to match — **and the Figma
  edit has not happened yet**, so the divergence is recorded as intentional
  rather than an oversight.
- **Second instance of the "whole on-color family" claim corrected** in the
  `Toast` entry. Same false statement as `CLAUDE.md`'s, different file. `Toast`
  itself is unaffected (it uses the correct members); `LineChart` is not.
- **`Item` nested-components table corrected** — it still listed
  `icon_triangle_up` as something `ListItem` renders. It does not;
  `TrendIndicator` owns the glyph. Row added for `TrendIndicator`, and
  `ChartLegendItem`'s badge updated to `color={iconColor}`.

**`showcase/App.tsx`**
- Bitcoin row `trendDirection="flat"`. It showed `0%` with a green up-arrow —
  precisely the defect `TrendIndicator` exists to fix, demonstrated in the
  showcase for the component that fixes it.

---

## Stale claims found and NOT fixed

**`docs/component-tokens.md` — "it's consumed by 35 components"** (Button entry,
on `surface/primary/default`). A grep of component CSS today counts **19**.
**Left alone deliberately:** this session did not make it untrue — none of the
three new components consume that token — and the original figure may have
counted differently (TSX as well as CSS, or the whole `surface-primary-*`
family). Correcting it needs knowing what it measured. **Needs a judgement call,
flagged rather than guessed.**

Also deliberately untouched, per instruction: the `ElementWrapper` inline-style
finding (separately parked), all four E items, the adjacency finding, and the
card's recorded accessibility gap.

---

## NEXT — Teku's, not Claude Code's

1. Review and commit the three work-item-D files via Sourcetree.
2. **Tag `v1.1.0`** — three new components make it a minor bump.
3. Update the MVP's pinned dependency to the new tag. Local dev is unaffected
   either way (the alias points at source); the tag only matters on deploy.
4. **Update Figma** for the two recorded edits: `TrendIndicator`'s `flat`
   direction, and the `#0caaff` → teal-500 gradient stop.
5. Decide work item E — **E-1 and E-2 together**, since they pull against each
   other, plus E-3 and E-4.
6. Then the MVP resumes at **Flow 7 (Finance Overview)**, where the trend chart
   is the hero card — and where the three MVP inheritance items above become
   live.
