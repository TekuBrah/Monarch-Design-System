# Changelog

All notable changes to `@monarch/design-system`.

---

## v1.6.0

### ⚠️ ERROR TEXT AND CHIPS SUBTLE VARIANTS CHANGE COLOUR. THIS IS EXPECTED.

**Semver-minor — no API changed, no prop added or removed, no export moved.** But
this is a *visible* release. Anyone pinning this tag will see diffs in:

- **Error text, in BOTH themes** — `Checkbox` and `Radio` required asterisks,
  `Label` required asterisk, and `TrendIndicator`'s negative label. 12 elements in
  light, 15 in dark, measured across the showcase.
- **All six `Chips` `--subtle` variants, in both themes** — the text darkens to a
  fixed `--alias-<hue>-700`.
- **`Badge` `added` / `removed`, in dark** — text was flipping and no longer does.
- **`LineChart`'s `onColor` axis label, in dark only** — was near-black, now light.

`Badge` also gains a root class (`mn-badge`) and modifier classes
(`mn-badge--<appearance>`) where it previously had none. **Any consumer selector
relying on `Badge` having no class still works** — classes were added, none
removed — but snapshot tests over `Badge` markup will diff.

Dark-theme *and* light-theme visual baselines must be re-minted.

### Fixed — Item 1 · `--mapped-text-error-*` failed AA in both themes

The failing token was `-default`, **in both themes** — not just dark, and not
`-hover`. The red ramp has no stop clearing 4.5 on both white and black
(`red-500` is 3.64 on white / 5.77 on black; `red-600` is 5.35 / 3.93), so the fix
is necessarily per-theme.

A straight `default`↔`hover` swap was rejected: light `-hover` was already
`error-600` and dark `-hover` already `error-500`, so swapping would collapse the
two states onto one value and error text would stop responding to hover, with no
test to catch it. Instead the whole ladder shifts one step, keeping all three
states distinct. `-press` was found during the read and shifted with them.

| theme | token | v1.5.0 | CR | v1.6.0 | CR |
|---|---|---|---|---|---|
| light | `-default` | `error-500` `#eb4f52` | **3.64** ❌ | `error-600` `#bc3f42` | **5.35** ✅ |
| light | `-default-hover` | `error-600` `#bc3f42` | 5.35 | `error-700` `#8d2f31` | **8.13** ✅ |
| light | `-default-press` | `error-700` `#8d2f31` | 8.13 | `error-800` `#5e2021` | **12.32** ✅ |
| dark | `-default` | `error-600` `#bc3f42` | **3.93** ❌ | `error-500` `#eb4f52` | **5.77** ✅ |
| dark | `-default-hover` | `error-500` `#eb4f52` | 5.77 | `error-400` `#ef7275` | **7.33** ✅ |
| dark | `-default-press` | `error-400` `#ef7275` | 7.33 | `error-300` `#f39597` | **9.56** ✅ |

Against `--mapped-surface-page` (`#ffffff` light, `#000000` dark). Light hover
darkens, dark hover lightens — the conventional direction for each theme.

⚠️ **The elevated-surface gap NARROWS but does not close.** On dark
`--mapped-surface-elevation-default` (`#262626`) — i.e. inside a `Modal` or
`Sheet` — `-default` improves **2.83 → 4.16**. That now clears AA-large 3.0 where
it previously did not, but still misses AA 4.5. On
`--mapped-surface-subtlest-default` (`#131313`) it improves **3.48 → 5.11** and
passes. Remains a known gap; see item 3 below.

### Fixed — Item 2 · `Chips` `--subtle`: static background, flipping text

Six `--subtle` variants set their background from an `--alias-<hue>-100` tint
declared only in `:root` — it does not dark-flip — while pairing it with a
`--mapped-text-*` token that does. The pair drifted apart in dark. **All six
failed in dark; four of the six also failed in light.** Only two were previously
measured; the other four were never checked.

| variant | v1.5.0 light | v1.5.0 dark | v1.6.0 (both themes) |
|---|---|---|---|
| `default` | 4.07 ❌ | 2.73 ❌ | **6.35** ✅ |
| `inprogress` | 4.87 ✅ | 2.53 ❌ | **7.10** ✅ |
| `moved` | 3.04 ❌ | 1.98 ❌ | **4.91** ✅ |
| `new` | 6.53 ✅ | 2.04 ❌ | **8.77** ✅ |
| `removed` | 4.17 ❌ | 2.84 ❌ | **6.34** ✅ |
| `success` | 3.25 ❌ | 2.14 ❌ | **5.22** ✅ |

**Shape (b) — static tint + static text — was chosen on measurement, not
preference.** The preferred mapped-layer fix requires a per-hue *subtle surface*
token, and **there is none**: the mapped layer has
`--mapped-surface-<hue>-default/-hover/-pressed` (all saturated 500/600/700) and
only hue-less `--mapped-surface-subtle-*`. Routing all six through the hue-less
`--mapped-surface-subtle-default` was measured and left **three of six below AA in
light** (`default` 4.07, `moved` 3.20, `success` 3.48) *and* discarded the hue tint
that distinguishes the variants. Logged as a token gap — see item 11.

Both halves are now `--alias-*`, so each pair is theme-invariant **by
construction** rather than by coincidence. Step `700` is the shallowest clearing
4.5 on every tint (worst: `moved` 4.91). Verified: all six render byte-identical
in light and dark.

### Fixed — Item 2b · the rule that let this through, in `CLAUDE.md`

The old rule scoped the ban to interactive states:

> an alias token in a hover/pressed/selected/focus rule is a bug … any hit in an
> interactive state must be replaced with a mapped token

All eight `Chips.css` alias hits sat in **static variant** rules and passed that
rule at every audit while being broken. Rewritten to:

> **an alias token may not supply one half of a colour pair whose other half is a
> mapped token.**

Both-alias is fine (theme-invariant). Both-mapped is fine (they flip together).
The pairing test catches every defect in this release; the interactive-state test
caught none of them.

### Fixed — Item 3 · `Badge` had no CSS file

`Badge` styled itself through two inline `style={{}}` objects and had **no
companion `.css` file** — `ElementWrapper`'s failure mode, reproduced and still
live. That is *why* it carried its defects unchallenged: CSS audits in this repo
grep `src/components/<Name>/*.css`, so a component with no CSS file is a permanent
blind spot, and this one had been invisible for four releases.

- **`Badge.css` created**; every style moved out of the inline objects.
- **Registered in `src/styles/package.css`** — the registration that fails
  silently. Parity re-derived after the change: **58 `@import` lines against 58
  `.css` files on disk** (was 57/57), sets identical.
- `src/index.ts` already exported `Badge`; confirmed, not re-added.
- `Badge.test.tsx`: two tests asserted on `.style.background`, which no longer
  exists. Rewritten to assert the modifier class. **Same test count** — the file's
  13 tests are unchanged in number.

| appearance | defect | v1.5.0 light | v1.5.0 dark | v1.6.0 (both) |
|---|---|---|---|---|
| `added` | static `--alias-success-100` bg + flipping text | 5.22 ✅ | **1.77** ❌ | **5.22** ✅ |
| `removed` | static `--alias-error-100` bg + flipping text | 6.34 ✅ | **2.23** ❌ | **6.34** ✅ |
| `dark` | `var(--brand-slate-600)` — a **brand primitive** consumed directly, two layers below the cascade contract | 4.56 ✅ | 4.56 ✅ | **4.56** ✅ |

`dark` is a **layering fix with zero colour change**: `--alias-neutral-600`
resolves to the identical `#6b7786`.

**Raw-px census re-run including `Badge.css`: still 36.** `Badge.css` contributes
**zero** raw px. Known gap #4's figure is unchanged by this release — see below.

### Fixed — Item 4 · E-3 closed: `on-color` tokens that wrongly flipped

The `on-color` contract, from `CLAUDE.md`: *"These tokens describe content on a
fixed colored surface that doesn't flip with the app theme."* A token that flips
cannot describe content on a surface that doesn't.

**Five members flipped, not three.** The two beyond the logged E-3 list are
`-label-hover` and `-label-pressed`, which nobody had checked.

| token | light | v1.5.0 dark | v1.6.0 dark |
|---|---|---|---|
| `--mapped-text-on-color-caption` | `neutral-100` `#e7eaed` | `neutral-950` `#0d0f11` | `neutral-100` `#e7eaed` |
| `--mapped-text-on-color-placeholder` | `neutral-100` `#e7eaed` | `neutral-950` `#0d0f11` | `neutral-100` `#e7eaed` |
| `--mapped-text-on-color-label` | `neutral-100` `#e7eaed` | `neutral-950` `#0d0f11` | `neutral-100` `#e7eaed` |
| `--mapped-text-on-color-label-hover` | `neutral-200` `#cfd5dc` | `neutral-800` `#363c43` | `neutral-200` `#cfd5dc` |
| `--mapped-text-on-color-label-pressed` | `neutral-300` `#b6bfca` | `neutral-700` `#505964` | `neutral-300` `#b6bfca` |

All five now resolve identically in both themes, matching `-heading` and `-body`,
which were already correct. **The light values were chosen**, on the evidence of
the only real usage: `LineChart`'s `onColor` chrome pairs
`--mapped-text-on-color-caption` (axis label) with `--mapped-text-on-color-heading`
(callout, white). A near-black caption beside a white callout on the same coloured
card is incoherent regardless of ratio. `LineChart.css`'s own comment recorded the
defect and declined to work around it; that note can now be retired.

⚠️ **The AA gap this exposes is NOT closed and is not closeable at the token
layer.** No `on-color` value clears 4.5 against the two brand surfaces most likely
to carry on-colour content:

| value | vs `--brand-blue-500` `#046eff` | vs `--brand-teal-500` `#00ace5` | vs `--brand-purple-500` `#5e4db2` |
|---|---|---|---|
| white (`-heading`/`-body`) | **4.49** ❌ | **2.61** ❌ | 6.60 ✅ |
| `neutral-100` (`-caption`/`-label`) | 3.72 ❌ | 2.16 ❌ | 5.47 ✅ |

This is a **surface** problem, not a text problem — `blue-500` and `teal-500` are
too light to carry any light text. Shipping a passing-but-wrong value was rejected.
See item 12.

### Changed — version

`package.json` `1.5.0` → `1.6.0`.

### Corrected — `src/styles/package.css` header comment

The header claimed the lib build *"never included globals.css/typography.css
(nothing in `src/index.ts`'s tree imports them)"*. That was true when written
(`0d01759`, 2026-07-30) and stopped being true **one day later** (`a2b9bbf`,
2026-07-31), when `src/index.ts` line 1 became `import './styles/package.css'` —
and `package.css` lines 10–11 import both. Verified this release: token custom
properties and all 22 `.type-*` classes **do** reach `dist/index.css`. The comment
had been describing the wrong build for four releases.

### Verification

Token-only releases cannot be verified by the test suite — jsdom does not resolve
`var()` chains, which is how the `--shadow-*`/`--gradient-*` regression at
`142df40` survived a green run. Everything above was measured with
`getComputedStyle` in both themes, after `document.getAnimations().forEach(a =>
a.finish())`, with the CSSOM confirmed to hold the new rules first.

- **11 token declarations changed** — 3 in `:root`, 8 in `[data-theme="dark"]`.
  The regenerated `globals.css` diff is exactly those 11 and nothing else.
- **Canary census: 5919 painted elements**, identical count before and after, in
  both themes.
- **Containment: 12 changed elements in light, 15 in dark, zero orphans.** Every
  one is a `Checkbox`/`Radio`/`Label` required asterisk, a `TrendIndicator` label,
  or (dark only) a `LineChart` axis label — all predicted consumers.
- **Regression guard**: `--shadow-*` (3) and gradient (11) declarations confirmed
  still present after the pipeline re-run.
- `npm test` — **59 files / 487 tests, all passing**, 86.60s. Unchanged from
  v1.5.0, as a token-only release requires.

---


### ⚠️ THE DARK THEME RENDERS DIFFERENTLY. THIS IS EXPECTED.

**40 mapped colour tokens changed.** Anyone pinning this tag **will** see visual
diffs in dark theme. This is the intended content of the release, not a
regression. 38 of the 40 change in dark theme only; 2 change in light
(`--mapped-surface-default-pressed`, `--mapped-border-subtlest-hover`).

Downstream consumers holding dark-theme visual baselines must re-mint them
against this tag. The Monarch MVP will do so in a later gate.

The census is the evidence: of **192** `--mapped-*` declarations, **42** changed
(40 colour + the 2 gradient tokens below) and **150** were unmoved, derived by
diffing the generated CSS before and after. Six already-correct tokens were held
as explicit negative controls and confirmed unchanged
(`--mapped-icon-success-default`, `--mapped-icon-warning-default`,
`--mapped-text-error-default`, `--mapped-surface-page`,
`--mapped-text-default-default`, `--mapped-border-default`).

### Fixed — dark-mode token mappings

Full per-token tables, contrast figures and derivations are in
[`docs/component-tokens.md`](docs/component-tokens.md) under *v1.5.0 — dark-mode
token layer corrections*.

- **18 `-pressed` accent tokens never flipped**, authoring step `700` in both
  themes. Worst case `--mapped-text-interactive-default-pressed` measured
  **CR 1.77** on black — effectively invisible. All 18 now clear AA 4.5.
- **12 Primary / Interactive `default` and `hover` tokens** darkened an
  already-dark blue and purple in dark theme. `--mapped-text-interactive-default`
  went **2.38 → 5.02**; `--mapped-text-primary-default` **3.27 → 4.68**.
- **One alias misbinding** — `Surface.500` pointed at `{Gray.400}`, duplicating
  `Surface.400` and leaving `Gray.500` unreferenced. It had collapsed four
  sibling-state pairs into identical values, so those controls had **no hover
  feedback at all, in either theme**. Now distinct.
- **`subtle` / `subtlest` tier collapse in dark** — both ladders resolved to the
  same three values at all three states, for text and icon. Tier separation
  restored; hierarchy now correct at every state.

### ⚠️ Success, Warning, Information and Error `default`/`hover` were DELIBERATELY LEFT ALONE

These use the same `500 → 600` dark swap as the Primary/Interactive tokens that
were fixed, and for these hues it **improves** contrast:

| Token | light CR | dark CR |
|---|---|---|
| `--mapped-icon-warning-default` | 2.34 | **5.86** |
| `--mapped-icon-success-default` | 2.56 | **5.39** |
| `--mapped-icon-information-default` | 2.61 | **5.32** |

"Fixing" them to lighter steps would **regress** contrast. This is an intentional
exclusion, recorded here so a future session does not helpfully correct it back.

Relatedly: the original defect report named `TrendIndicator` as affected. It is
not. It has no tokens of its own, has no pressed state, and **measures better in
dark than in light**.

### Added — `--gradient-surface`

`--mapped-gradient-subtle` and `--mapped-gradient-default` previously pinned their
stops to `--mapped-surface-page`, leaving a visible seam over any other surface
(Δ6/channel light, Δ19/channel dark over `--mapped-surface-subtlest-default`).
They now resolve through a new indirection token:

```css
--gradient-surface: var(--mapped-surface-page);   /* default */
```

**`--gradient-surface` is the supported override point.** Set it on any scoping
element and the scrim fades into that surface:

```css
.my-screen { --gradient-surface: var(--mapped-surface-subtlest-default); }
```

With no override the two gradients resolve **character-identically** to their
v1.4.0 values — verified in both themes, and the one place in this release where
byte-identity was the goal.

**Breaking for one usage pattern:** the pair is declared on `*` rather than
`:root`, so **`--mapped-gradient-*` can no longer be overridden at an ancestor and
inherited down**. Override `--gradient-surface` instead. The `*` declaration is
required, not stylistic: a custom property referencing another custom property is
substituted where it is *declared*, so a `:root` declaration baked in the page
surface and made the override inert. Second cost: the pair recomputes per element.

### Added — two additive component props

**Both default to prior behaviour. No existing consumer changes.** Byte-identity
was measured, not assumed: `prop absent === prop set to its default` on rendered
markup for both components, plus computed geometry equal to pre-change values, plus
the observation that with the default value the modifier class is absent so
neither new CSS rule can match.

- **`BottomNavigation.barWidth?: 'hug' | 'fill'`** — default `'hug'`. `'fill'`
  stretches the bar to its container and gives the extra width to the items
  (`flex: 1 1 0`), holding the designed 16px gaps. `className` lands on the root,
  so there was no existing path to the bar's width.
- **`CardFeaturesAndEducation.sizing?: 'fixed' | 'fill'`** — default `'fixed'`.
  `'fill'` drops `width`/`max-width` so the parent's flex track decides.
  **`min-width: 90px` applies in both modes.**

⚠️ **Verifying `sizing` at a 375px viewport will wrongly suggest it does nothing.**
Three tiles fill a 343px container exactly (`3 × 109 + 2 × 8 = 343 = 375 − 32`), so
`fill` and `fixed` are byte-identical there. Verify at 390 or wider.

### Changed — version

`package.json` `1.4.0` → `1.5.0`.

---

## Known gaps and logged items

Originally ten items at v1.5.0. **v1.6.0 resolved #1 (and corrected it — it was
wrong as written), corrected #4's count, and appended #11–#15.** The count is the
length of the list below.

**Token layer**

1. ~~**`--mapped-text-error-default` and `-hover` measure 3.93 in dark — below AA
   4.5.**~~ **RESOLVED in v1.6.0 — and this entry was WRONG as written.**

   Two errors. First, **`-hover` did not measure 3.93 and did not fail**: in dark
   it was `--alias-error-500` `#eb4f52` = **5.77, passing**. Only `-default` was at
   3.93. Second, the entry framed this as a dark-only problem; **`-default` also
   failed in light**, at 3.64 (`--alias-error-500` on white). The failing token was
   `-default`, in *both* themes.

   This mattered beyond the record: the MVP-side review inherited the "both tokens,
   dark only" framing from this entry and carried it into v1.6.0 scoping, where it
   was caught by re-measurement. Corrected here rather than only in code, so the
   wrong number stops propagating. See the v1.6.0 entry for the shipped ladder.
2. **`--mapped-text-error-default-press` is named `press`, not `pressed`**, unlike
   its 17 siblings. A source-data inconsistency. The **value** was fixed in this
   release; the **name** was not, because renaming is a breaking API change.
   Future major.
3. **Gradient stops use `transparent` (`rgba(0,0,0,0)`)**, which can produce a
   slight grey cast mid-fade. Pre-existing, untouched.
4. **The DS has no token guardrail while the MVP does.** The MVP has
   `check-tokens.mjs`; this repo has no equivalent and no `lint:tokens` script.
   Future gate.

   **Count corrected (v1.6.0): 36 raw-px declarations, not four.** This entry
   listed four files (`CardBalance.css:10`, `CardDataDisplay.css:10`,
   `CardFeaturesAndEducation.css:9`, `Modal.css:21`) and read as a count. It was a
   *sample*. A census across all `src/components/*/*.css` (non-zero px, comment
   lines excluded) returns **36** declarations spanning 12+ files, including
   `CardGoals.css:30` `height: 68px`, `CardMonthlyBudget.css:5` `width: 343px`,
   `SideNavigation.css:9` `width: 255px`, `BottomNavigation.css:87` `width: 134px`,
   `Radio.css` (14px/6px/2px), `Loader.css:15` `border: 3px`, `Logo.css:13`
   `height: 14px`. Several are legitimate under the gap protocol's pattern (b) and
   carry FAIL-LOUD comments; several do not. **Whoever scopes the `lint:tokens`
   gate should expect ~36 findings, not four.**

   Re-censused in v1.6.0 *after* adding `Badge.css` to the audit surface: still
   **36**. `Badge.css` was authored token-only and contributes zero. Note that the
   pre-v1.6.0 figure was itself a floor — `Badge` had no CSS file at all, so it was
   never in the census.
5. **`*` block cost** — the mapped gradient pair recomputes per element.
6. **`*` block cost** — loss of ancestor inheritance for `--mapped-gradient-*`.
   `--gradient-surface` is the override point.

**Environment hazards** (also recorded in `CLAUDE.md`, where sessions will look)

7. **Vite HMR does not apply edits to CSS reached through `package.css`'s
   `@import` chain.** A full reload is required, and CSSOM must confirm the rule is
   loaded before any geometry is trusted. This produced a false
   `IconObject.hasPadding` verdict during v1.5.0 — both new props measured
   byte-identical to their defaults and would have been deleted as no-ops. The
   declarations gave it away (`alignSelf: "auto"` where the rule says `stretch`).
8. **`clientWidth` differs by harness.** The MVP's Playwright harness reports
   `1280` at a 1280 viewport; the dev browser pane reports **1265**, a 15px
   scrollbar gutter. Neither figure corrects the other — key measurements to
   `document.documentElement.clientWidth` and record which harness produced them.

**Component layer**

9. **`justify-content: space-between` was rejected for `barWidth='fill'`**, on
   measurement rather than taste: it left items at 64px and inflated the designed
   16px gap to **315px** against a 1233px container, growing without bound.
   `flex: 1 1 0` on the item holds the gap at 16px at every width.
10. **`BottomNavigation` `hug` mode overflows the `"Transfer"` label by 0.9px**
    (48.9px against a 48px item content box), at every viewport and in both
    themes. Visually harmless — nothing sets `overflow`, so nothing clips — and
    `fill` resolves it. Not fixed because changing item padding would move every
    `hug` baseline downstream for no visible gain.

**Added in v1.6.0**

11. **No per-hue *subtle surface* token exists in the mapped layer.** The layer has
    `--mapped-surface-<hue>-default/-hover/-pressed` — all saturated 500/600/700 —
    and only hue-less `--mapped-surface-subtle-*`. There is no
    `--mapped-surface-<hue>-subtle` that dark-flips. This is the direct reason
    `Chips --subtle` had to be fixed with static alias pairs rather than staying in
    the mapped layer, and the reason `Badge`'s `added`/`removed` are static too.
    Adding the family would let both components flip properly and keep their hue.
    **Requires new tokens, therefore a Figma Variables change — not a code fix.**

12. **`--brand-blue-500` and `--brand-teal-500` are too light to carry any light
    text.** White measures **4.49** on `blue-500` (missing AA by 0.01) and **2.61**
    on `teal-500`. This is not an `on-color` token problem — no value in the neutral
    ramp does better, and the two "correct" members (`-heading`/`-body`, white) fail
    identically. It is the same root cause as the parked promo-band gradient
    finding. Any fix is a **surface** decision (darker stop, or a scrim), and it is
    Teku's design call — deliberately not made here.

13. **Ten `--mapped-text-*` tokens fail AA 4.5 in LIGHT mode**, measured against
    `--mapped-surface-page` `#ffffff` across the full 54-token family (28 excluding
    `on-color`, which sits on a different surface):

    | token | light CR | dark CR |
    |---|---|---|
    | `--mapped-text-warning-default` | **2.34** | 5.86 |
    | `--mapped-text-subtlest-subtlest` | **2.36** | 4.61 |
    | `--mapped-text-success-default` | **2.56** | 5.39 |
    | `--mapped-text-information-default` | **2.61** | 5.32 |
    | `--mapped-text-subtlest-hover` | **3.06** | 6.87 |
    | `--mapped-text-warning-default-hover` | **3.59** | 8.98 |
    | `--mapped-text-success-default-hover` | **3.89** | 8.19 |
    | `--mapped-text-information-default-hover` | **3.95** | 8.03 |
    | `--mapped-text-primary-default` | **4.49** | 4.68 |

    (A tenth, `--mapped-text-disabled-default` at 1.48, is **excluded as a defect** —
    WCAG 1.4.3 exempts inactive controls.)

    **v1.5.0 audited dark and explicitly declined to touch the warning/success/
    information family**, on the correct grounds that the `500 → 600` dark swap
    *improves* those hues in dark. That reasoning holds. What it left unstated is
    that the same tokens were **already failing in light**, and v1.5.0's own table
    records the light figures (2.34 / 2.56 / 2.61) without flagging them. **Light
    mode has never had the audit dark mode got.** `--mapped-text-error-*` was the
    only member of this family fixed in v1.6.0; its siblings remain. This is the
    largest single block of remaining contrast debt in the DS.

14. **Four `Chips --bold` and three `Badge` appearances fail AA**, all from the same
    cause as #13 — white text on a saturated `--mapped-surface-<hue>-default`, which
    is the `500` step in light:

    | component · variant | light | dark |
    |---|---|---|
    | `Chips` `success--bold` | **2.12** ❌ | **2.12** ❌ |
    | `Chips` `moved--bold` | **2.34** ❌ | **3.59** ❌ |
    | `Chips` `removed--bold` | **3.64** ❌ | 5.35 ✅ |
    | `Chips` `inprogress--bold` | **4.49** ❌ | 6.42 ✅ |
    | `Badge` `important` | **3.64** ❌ | 5.35 ✅ |
    | `Badge` `primary` | **4.49** ❌ | 6.42 ✅ |
    | `Badge` `inverted` | **4.49** ❌ | 4.68 ✅ |

    Out of v1.6.0's stated scope (`--subtle` only) and **not fixable from existing
    tokens**: `success--bold` and `moved--bold` fail in *both* themes, and no
    `on-color` text token clears green-400/green-500 or orange-500. Fixing them
    means moving `--mapped-surface-<hue>-default` off the `500` step in light, which
    is a broad visual change touching many components — a release of its own.

    `Chips` `success--bold` carries a second, separate defect: it binds its
    background to **`--alias-success-400`** while every other bold variant uses
    `--mapped-surface-<hue>-default`. It is the odd one out, and it is the worst
    contrast in the set. `Chips` `default--bold` likewise uses `--alias-neutral-800`
    (though it passes at 11.15, being theme-invariant white-on-dark).

15. **`--mapped-text-error-default-hover` and `-default-press` now have zero
    consumers.** `Chips --subtle` and `Badge removed` were the only two, and both
    moved to static alias tokens in v1.6.0. The tokens are correct and were shifted
    with the rest of the ladder, but nothing in `src/components/` reads them. Worth
    knowing before anyone concludes from a grep that they are dead and removable —
    they are the documented hover/press contract for error text and a consumer may
    rely on them.

    Related and still open: **`--mapped-text-error-default-press` is the only
    `-press` among 56 `-press`/`-pressed` tokens** (item 2 above). v1.6.0 changed
    its *value* again without renaming it. Confirmed by census this release: 55
    siblings use `-pressed`, this one does not.
