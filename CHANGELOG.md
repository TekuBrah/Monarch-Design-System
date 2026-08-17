# Changelog

All notable changes to `@monarch/design-system`.

---

## v1.5.0

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

Ten items, deliberately not fixed in this release. The count is the length of the
list below.

**Token layer**

1. **`--mapped-text-error-default` and `-hover` measure 3.93 in dark — below AA
   4.5.** Correctly excluded from the Cluster 2 fix because it *improved* relative
   to light (3.64 → 3.93), but improved is not passing. Known remaining gap.
2. **`--mapped-text-error-default-press` is named `press`, not `pressed`**, unlike
   its 17 siblings. A source-data inconsistency. The **value** was fixed in this
   release; the **name** was not, because renaming is a breaking API change.
   Future major.
3. **Gradient stops use `transparent` (`rgba(0,0,0,0)`)**, which can produce a
   slight grey cast mid-fade. Pre-existing, untouched.
4. **The DS has no token guardrail while the MVP does.** Four components ship raw
   px unchallenged: `src/components/Card/CardBalance.css:10`,
   `src/components/Card/CardDataDisplay.css:10`,
   `src/components/Card/CardFeaturesAndEducation.css:9`,
   `src/components/Modal/Modal.css:21`. The MVP has `check-tokens.mjs`; this repo
   has no equivalent and no `lint:tokens` script. Future gate.
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
