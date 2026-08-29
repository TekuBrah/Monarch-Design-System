# Changelog

All notable changes to `@monarch/design-system`.

---

## v1.14.0

### The primary accent ramp moves one step. Eight components change colour.

**Consumers WILL see this.** `--mapped-text-primary-default` and its
`-hover` / `-pressed` siblings move one ramp step outward in light and two in
dark. Links, selected navigation labels, card labels, chips, menu rows and
outline buttons all render a different blue. Six token values changed, plus two
component CSS edits. `--mapped-border-primary-*` and `--mapped-icon-primary-*`
were deliberately NOT moved — see item 3.

Gate 36 was briefed to "re-derive the primary accent ramp" against gap #13. The
brief was right that a re-derivation was needed and wrong about its size: the
failure is **larger and in both themes**, and the worst instance of it is a
component the gap never named.

### 1 · What the census actually found

Gap #13 recorded `--mapped-text-primary-default` as **9 declarations across 8
components**. Re-derived from disk: **12 declarations across 9 components**, and
**22 across 11** once `-hover` and `-pressed` are included. The three it missed
are all in `Button.css` (`:107`, `:124`, `:142`), invisible to a `color:`-scoped
grep because Button assigns through a `--btn-text` indirection and consumes it
one rule later.

Measured across every (token, surface) pair the census proves reachable —
69 cells, both themes, translucent fills composited over each backdrop they can
actually land on:

| | before | after |
|---|---|---|
| text cells failing AA 4.5 | **20 of 69** | **0 of 69** |
| worst text cell | **1.6452** | **4.8638** |
| cells below the 0.30 margin floor | — | **0** |
| border cells failing 3.0 (of 33) | 1 | 1 *(pre-existing, improved — gap #23)* |

Every text site is 12–16px at weight 400–600. Nothing reaches WCAG large text
(24px regular / 18.66px bold), so **4.5 applies at every text site without
exception**; no site qualified for the 3.0 relaxation.

### 2 · The Figma variables panel and this repo disagree, in both directions

The gate brief carried a description of the Figma panel as `[reported]` and
asked for it to be checked. It disagrees with disk on **all three** points it
names:

| the panel [reported] | disk [verified] |
|---|---|
| default = Primary/500 light, **Primary/600 dark** | 500 light, **500 dark** |
| default-hover = 600 light, **Primary/500 dark** | 600 light, **400 dark** |
| on-color pair = white light, **black dark** | white light, **white dark** |

The load-bearing one is the first. **`-default` was the only member of the
family that did not flip between themes** — both its siblings did. That
asymmetry is the defect, and it is not what the panel describes. The on-color
disagreement matters too: had the panel been right, the `on-color` family would
carry E-3's black-binding defect, which v1.6.0 already repaired.

*Nothing in Figma was changed. This records that a re-export will reintroduce
the old values unless the panel is corrected first.*

### 3 · Text and border now diverge, and that was measured, not assumed

All 33 border cells already passed 3.0 before this release, so the border family
needed no move. Moving it anyway was tested and is **strictly worse**: the
selected-tint fills in `FilterChip`, `MenuItem` and `Tag` are `color-mix()`
washes derived *from* `--mapped-border-primary-default`, so darkening the border
darkens the backdrop the text sits on and the text chases its own fill.
Measured, moving both families **reintroduces 4 text failures** (worst 4.0050)
where moving text alone leaves zero.

**The visible consequence, stated rather than discovered later:** where a
primary border and a primary label co-occur they are now one ramp step apart
instead of identical — `FilterChip` selected, `Tag` hover/press. The same is
true of `--mapped-icon-primary-default`, which mirrors the border family, so a
selected `BottomNavigation` / `SideNavigation` item now pairs a blue-500 icon
with a blue-600 label. That is a design consequence of the fix, not a defect,
and it is the reason the divergence is recorded here in full.

### 4 · Three of the six token moves fixed no contrast failure

Worth stating because it changes what a mutation proof can even mean. Against
the pre-release baseline:

| move | driven by |
|---|---|
| `-default` light 500 to 600 | **contrast** — 4.4876 on white everywhere |
| `-default` dark 500 to 300 | **contrast** — 3.3723 on elevation, 3.0948 on the rest tint |
| `-default-hover` dark 400 to 200 | **contrast** — `Tag` hover label 4.1596 on elevation |
| `-default-hover` light 600 to 700 | **monotonic ordering only** — 600 passed everywhere (5.6021–6.4187) |
| `-default-pressed` light 700 to 800 | **monotonic ordering only** — 700 passed (7.0980–9.3673) |
| `-default-pressed` dark 300 to 150 | **monotonic ordering only** — 300 passed (5.1474–8.6337) |

The three ordering-driven moves exist so hover and pressed stay distinct from
the new resting value and keep moving *away* from the page surface. They cannot
be mutation-proven against a contrast threshold because **there was no failing
figure to reintroduce**; reverting them instead collapses two ladder steps onto
the same hex, a state with no visible feedback. They were proven against that
invariant instead. A proof that passes before and after proves nothing, and
three of these would have looked exactly like that.

Final ladder — monotonic within each theme, opposite directions between them:

| theme | rest | hover | pressed |
|---|---|---|---|
| light | `#0358cc` (600) | `#024299` (700) | `#022c66` (800) |
| dark | `#68a8ff` (300) | `#9bc5ff` (200) | `#b4d4ff` (150) |

### 5 · The FilterChip wash change is margin-driven, not compliance-driven

`FilterChip.css:78` — the selected-pressed wash goes **24% to 20%**, matching
MenuItem's existing 20%. Once the text token moved, the 24% wash **already
passed** at 4.5898; what it did not clear was the 0.30 margin floor, at 0.0898.
At 20% the same cell reads 4.8638, margin 0.3638.

This is the one value in the set safe to move without contradicting Figma:
FilterChip's 16% and 24% selected washes are annotated in its own CSS as "a
deliberate addition beyond Figma source". The 10% rest wash, which Figma does
specify, is untouched.

### 6 · The dark-mode primary Button was the worst failure in the system

Found by census, recorded in no gap, changelog or handoff. In dark,
`.mn-btn--primary` inverts to a **white** fill —
`--mapped-surface-interactive-on-color` resolves `#ffffff` in *both* themes —
while its label took the dark ladder, which runs *lighter*:

| state | fill | label before | CR before | label after | CR after |
|---|---|---|---|---|---|
| rest | `#ffffff` | `#046eff` | **4.4876** ❌ | `#0358cc` | **6.4187** ✅ |
| hover | `#e7eaed` | `#368bff` | **2.7630** ❌ | `#024299` | **7.7569** ✅ |
| pressed | `#cfd5dc` | `#68a8ff` | **1.6452** ❌ | `#022c66` | **9.1362** ✅ |

**No token move could have fixed this, and the ramp move made it worse.** In
dark, `--mapped-text-primary-default` must serve both `#ffffff` (this button)
and `#000000` (the page); the best any single colour can do against both is
**4.5826**, and against `#262626` elevation it is worse. There is no such ramp
step and none could be added. Confirmed structurally: **no theme-invariant
`--mapped-text-*` token is a dark accent colour** — the only theme-invariant
blue in the family was `-default` itself, and this release removes that
property.

So it is a **binding** defect, not a value defect. Fixed at
`Button.css:142-144` by binding the label to the light ladder directly
(`--brand-blue-600/700/800`), the same buttons-only exception `--btn-bg-hover`
on `.mn-btn--secondary` has always taken. A named inverse token family would be
the purer answer and was rejected for now: it would mirror no Figma variable,
which is the thing `build-mapped.mjs` exists to refuse.

### Verification

- `build:tokens` regenerated **`src/styles/globals.css` only** — 6 declarations,
  3 in `:root` and 3 in `[data-theme="dark"]`. `src/tokens/mapped.ts` did **not**
  change: `build-mapped.mjs:96-98` writes names, never values. No other generated
  file moved.
- **All 8 edits mutation-proven**, each against the invariant it actually
  governs: 5 against a measured contrast failure, 3 against the ordering
  invariant, 1 against the 0.30 margin floor. Every file restored and verified by
  `git hash-object` against its pre-mutation blob, per gap #18.
- Gates: `tsc -b --force` 0 · `npm test` 0 (**60 files / 508 tests, delta 0** —
  predicted by filename beforehand: none, because no test pins a hex, tests 6/7
  read only `on-color` tokens which did not change, and test 12's `TOKEN_PREFIX`
  already accepts declared `--brand-*`) · `check:css-registration` 0 (58/58) ·
  `build` 0 · `build:lib` 0. `dist/index.css` confirmed carrying the new values.

---

## v1.13.0

### ✅ NOTHING A CONSUMER CAN SEE CHANGES. THIS RELEASE IS DOCUMENTATION ONLY.

No source file changed. No component, token, generated file, build script or
test was touched — confirmed by `git diff --stat -- src/styles src/tokens
design-tokens` returning empty, and by the test suite holding at 60 files / 508
tests with a delta of zero. `build:tokens` was deliberately not run, because
nothing that feeds it moved. The only changes are `CHANGELOG.md`, `CLAUDE.md`
and the three version fields.

**The gate's headline item did not ship, and the tag records the gate closing,
not a feature landing.** Gate 35 was briefed to implement touch feedback and
halted before writing any code, for a reason recorded in full as known gap #21.
What it did produce is measurement, and that is what this entry records.

### 1 · The four flip-parity call sites are measured

v1.12.0's known gap #19 reported four call sites where both halves of a colour
pair come from the mapped layer — which the pairing rule permits on the stated
grounds that mapped tokens "flip together" — and yet only one half flips. It
recorded that **none of the four had been contrast-measured**, and that the next
step was measurement rather than a rule rewrite. This release takes that step.

The hit list was re-derived from scratch rather than trusted. A scan of all 58
component CSS files, resolving the full `var()` chain in both themes, returns 30
flip-parity mismatches; filtering to pairs where *both* halves are actual colours
— dropping every rule whose other half is `none`, `transparent` or `currentColor`,
which is not a colour pair at all — reproduces **exactly** the four survivors and
both false positives. The Gate 34 list was correct.

**Falsifier checked and clear.** Every token in all four pairs resolves to a flat
six-digit hex in both themes. Nothing touches `--mapped-gradient-*` or a scrim, so
the standing caveat that arithmetic contrast is not a lower bound — which applies
to a gradient's interpolation — does not apply here, and no browser measurement
was needed.

**Every figure below names its backdrop, because two of the four are
translucent.** Both `Tag` rules paint `color-mix(…, transparent)`, whose rendered
value depends on what is behind the component. That is not a gradient, so it
passed the falsifier as posed, but it is not flat either. Alpha compositing over a
flat backdrop is exact arithmetic — unlike gradient interpolation it does not
dither — so it remains measurable, but a bare number is meaningless. Both
backdrops the DS actually offers are given.

| pair | threshold | light | dark |
|---|---|---|---|
| `Badge --inverted` — opaque | 4.5, body 14px/400 | on page `#ffffff`: **4.4876 ❌** | on page `#000000`: 4.6795 ✅ |
| `CardMonthlyBudget __add-icon` — opaque | 3.0, graphical object | on `#6b7786`: 4.5572 ✅ | on `#8695a7`: 3.0565 ✅ |
| `Tag --default:hover` — translucent | 3.0 border / 4.5 label | page `#e6f1ff`: 5.6021 ✅ · elevation `#e6f1ff`: 5.6021 ✅ | page `#000b1a`: 5.9217 ✅ · **elevation `#232d3c`: 4.1596 — border ✅, label ❌** |
| `Tag --default:active` — translucent | 3.0 border / 4.5 label | page `#cde2ff`: 7.0980 ✅ · elevation `#cde2ff`: 7.0980 ✅ | page `#011633`: 7.4198 ✅ · elevation `#1f3451`: 5.1474 ✅ |

`Tag`'s border colour and its label colour are **two different tokens that resolve
to the identical value** in both themes, so one composited pair carries two
thresholds at once — 3.0 as a UI-component boundary, 4.5 as 14px text. Dark-on-
elevation is the only cell in the whole set that fails, and it fails only the
label reading.

**Verdict: three of the four are harmless, and the fourth is not a call-site
defect.** `Badge --inverted` is gaps #13 and #14 seen from a third angle — gap
#14's table already recorded it at 4.49/4.68, matching this re-derivation to the
digit, which means **gap #19's claim that none of the four had been measured was
false when written.** Tracing that token out of `Badge` found eight further call
sites, including `Link`; the census is recorded as an amendment to gap #13, where
it belongs, and it is pending a Figma decision.

### 2 · The load-bearing conclusion: flip-parity alone is not evidence of a defect

Three of the four pairs mismatch on flip parity and pass their threshold, two of
them comfortably. A gate built on gap #19's formulation 2 would have flagged four
call sites of which **zero needed a code change**, and would then have required a
whitelist to go green — the exact failure class the registration detector was
built to avoid.

The pairing rule is therefore **left as written and no gate was shipped for it**,
now on measured grounds rather than on the judgement call v1.12.0 had to make.
Two corrections to gap #19's own reasoning are recorded there: `Tab.css`
`:focus-visible` was dismissed for a wrong reason (its outline does carry a colour
token and the rule is a genuine mismatch — it simply passes at 4.4876/4.6795
against a 3.0 threshold), while `LineChart __marker` was dismissed correctly.

A hazard no rule-scoped check can see is recorded alongside them: `Tag`'s label
colour lives in a *sibling* rule, so nothing comparing declarations within a
single rule will ever pair it against the fill it sits on.

### 3 · The touch-feedback gate halted, and why

No scope record for "touch feedback" exists anywhere in this repo, and its stated
provenance — split out of v1.7.0 — is false. Implementing from the label alone
would have meant inventing interaction states Figma does not define, which the
standing component rules forbid, so **Phase 2 halted and nothing was written.**

The full evidence base is recorded as known gap #21 so a successor can scope from
it without re-deriving it: which components declare `:active`, the state of the
press token layer, the complete absence of any touch-versus-mouse distinction, and
the one concrete defect the search did surface — hover styling persisting after a
tap on mobile, in 11 components.

### 4 · Known gaps

#13 amended (the primary-text token is a system-wide finding and fails in dark on
card surfaces as well as in light on the page), #14 cross-referenced, #19
corrected and fully annotated with backdrops, and **#20–#21 added**: the token
tests cover values but not pairings, and the touch-feedback evidence base.

---

## v1.12.0

### ✅ NOTHING A CONSUMER CAN SEE CHANGES. THIS RELEASE IS TOOLING ONLY.

**Semver-minor and entirely non-visible.** Unlike v1.6.0 and v1.5.0 below, anyone
pinning this tag sees **no diff at all** in what they import or render:

- **No export changed.** `src/index.ts` and `src/tokens/index.ts` are untouched.
- **No component changed.** No `.tsx`, no prop, no class name, no markup.
- **No CSS changed.** No component `.css`, no `globals.css`, no `typography.css`,
  no `package.css`. `npm run build:tokens` was deliberately **not run**, because
  nothing under `design-tokens/` or in any of the seven build scripts was
  touched — confirmed by `git diff --stat -- src/styles src/tokens
  design-tokens` returning empty.
- **No token value changed.** All 195 `--mapped-*` tokens resolve to the same
  values they did at v1.11.0.

Everything added is a **guard**: two of them, plus the CI wiring that makes one
of them mandatory. The whole release exists because two of this repo's worst
historical defects — `ElementWrapper` and `Badge` shipping with no CSS, and the
`--shadow-*`/`--gradient-*` regression at `142df40` — were invisible to every
gate that existed at the time.

### Added — Item 1 · the component CSS registration detector

`scripts/check-css-registration.mjs`, wired as `npm run check:css-registration`.

A component `.css` file that is not reachable from `src/styles/package.css`
**ships to the consumer with no styles and no error anywhere**. It compiles, the
tests pass, and it renders correctly in the showcase — because the component's
own `.tsx` imports its own CSS. Only the packaged build is missing it. `Badge`
sat in exactly that state for four releases (Item 3 of v1.6.0 below), reproducing
`ElementWrapper`'s original failure mode. The defence until now was a **hand**
derivation: re-count the `@import` lines against the `.css` files on disk at each
release, and remember to do it.

Two properties are deliberate and must survive any rewrite:

- **The component list comes from the filesystem**, never from an array in the
  script. A detector you have to remember to update is the same failure class it
  guards against.
- **Reachability resolves the `@import` graph transitively**, rather than
  pattern-matching `package.css`'s text. An `@import` of an index that imports
  the component still counts as reachable.

Both error classes exit 1 and name every offending file: an unreachable
component `.css`, and an `@import` whose target does not exist on disk.

**What it does NOT catch**, recorded so nobody over-trusts it: a component with
**no `.css` file at all** — which is `ElementWrapper`'s and `Badge`'s actual
failure mode, and is reported as a `NOTE`, never a failure, because `Icon`
legitimately has none (it delegates all styling to `ElementWrapper`); a `.tsx`
that does not import its own CSS (breaks the showcase, not the package); missing
registration in `src/index.ts` (`tsc -b` already fails on that); rules that are
reachable but dead or overridden; and anything at all about `dist/` — it reads
source, so it proves the graph Vite is *asked* to follow, not the bytes it
emitted. `npm run build:lib` remains the gate on the artefact.

Current state: **58 component `.css` files on disk, all 58 reachable**, 61 files
in the `@import` graph, 49 component folders scanned, one `NOTE` (`Icon`).

### Added — Item 2 · CI runs the detector

`.github/workflows/ci.yml`, job `verify`, new step **6 of 8** — *Check component
CSS registration* — between the pipeline-drift check and *Typecheck*.

**This is the half that matters.** A detector that only runs when someone
remembers to run it reproduces the exact failure mode it was built to catch:
registration parity was already being derived at each release, by hand, and the
hand derivation is what failed. Steps are sequential and fail-fast, so a non-zero
exit blocks the run.

Positioned before *Typecheck* and *Test* because it reads source only, needs no
build output, and takes milliseconds — a broken registration fails the run in
seconds rather than after the suite.

Verified by breaking it: removing the `HeaderBg.css` registration made the step
exit **1** and name the file; restoring it returned exit **0**. Restoration proven
by blob identity — `git hash-object` returned
`7fc890bb0313ae5ee72f0c2284ccee25fa380404`, equal to
`git rev-parse HEAD:src/styles/package.css`, before and after.

The job's display name is still `Tokens, types, tests` and was **not** renamed,
to avoid moving a check name anything external might key on.

### Added — Item 3 · token-value coverage, 14 tests

`src/test/tokens.test.ts` with its helper `src/test/tokenCss.ts`. **Test count
494 → 508; test files 59 → 60.** No existing test was modified and no component
test was added.

**Before this, nothing asserted that a token RESOLVES to anything.** The CI drift
gate proves the generated files match the generator; it says nothing about
whether what the generator produced is usable. An unresolved `var()` yields the
**empty string** — no error, no warning, no symptom except an unstyled element.
That is how the `--shadow-*`/`--gradient-*` regression at `142df40` survived a
green run, as v1.6.0's own *Verification* section notes.

**It resolves the CSS statically rather than through `getComputedStyle`.**
`vitest.config.ts` sets no `test.css` option, so CSS imports are stubbed and no
stylesheet is ever applied in jsdom — nothing in this suite can read a resolved
custom property from the DOM. Parsing `globals.css` is not a workaround for that;
it is the stronger check, because it walks the whole `var()` chain and names
**which link** is missing instead of returning the empty string a browser hands
back.

**Declarations are collected by SELECTOR, never by assuming `:root`.** The four
`--mapped-gradient-*` are emitted on `*` deliberately; a `:root`-scoped read
returns nothing for them and looks like a failure. The parser is a brace-depth
scan with a selector stack, so a `:root` nested inside `@media` is not confused
with a top-level one.

| # | assertion |
|---|---|
| 1–2 | every `--mapped-*` resolves non-empty in light / in dark |
| 3 | every declared custom property resolves in both themes, no cycles |
| 4 | the light and dark mapped blocks declare identical name sets |
| 5 | `[data-theme="dark"]` declares **only** `--mapped-*` |
| 6 | every `on-color` token stays on the light side of the ramp, both themes |
| 7 | every pure-white `on-color` token stays `#ffffff` in dark |
| 8 | the page chrome (one token per family) actually flips |
| 9 | every `--mapped-gradient-*` is on `*`, none on `:root` |
| 10 | the brand endpoints resolve to a bare colour — no angle, no `%`, no wrapper |
| 11 | the scrims re-resolve per theme with no dark block |
| 12 | component CSS references only DS tokens that are declared |
| 13–14 | resolver self-check: undeclared name throws, cycle throws |

**Every one was mutation-proven, not asserted.** The mutation was applied to
`globals.css` (or `Toggle.css` for 12), the suite re-run, exit 1 confirmed, the
file restored: a renamed link in a `var()` chain, a two-token reference cycle, a
deleted line from the dark block, an `--alias-*` injected into the dark block, an
`on-color` token rebound to black (E-3's shape), a white drifted to a light grey,
the light `--mapped-surface-page` copied into the dark block, the `*` selector
changed to `:root`, an endpoint re-wrapped in `linear-gradient()`,
`--gradient-surface` flattened to a literal, and every `--mapped-` in `Toggle.css`
typo'd. **All eleven mutations produced exit 1.** A test that cannot fail is
worse than no test.

**Deliberate exclusions**, so nobody reads the scope as an oversight:

- **Exact colour values.** Pinning `--mapped-surface-page === '#ffffff'` restates
  the token source in a second place, and the next legitimate Figma change fails
  a test that was only ever a copy. Nothing here pins a hex. What is pinned is
  **structure**: does it resolve, does it flip, is it declared in both themes.
- **Contrast ratios.** They belong to a component plus a pairing, not to a token
  in isolation, and this repo measures them in a real browser because rendered
  and computed figures differ.
- **`--brand-*` / `--spacing-*` / `--responsive-*` as separate suites.** Covered
  transitively — every `--mapped-*` resolves *through* them, so a broken
  primitive fails at the mapped token that consumes it, naming the missing link.
- **The `@media (min-width: 768px)` block.** It redeclares 14
  `--responsive-font-*` tokens that no `--mapped-*` consumes.
- **"Zero `--alias-*` in component CSS."** Proposed and **rejected**: it fails
  today on **22 references across 5 files** (`Badge`, `Chips`, `HeaderBg`,
  `StatusBar`, `TrendIndicator`), and every one is legitimate. `CLAUDE.md`'s
  pairing rule permits a both-halves-alias pair — theme-invariant by
  construction — and those five use exactly that. The rule is about **mixing**
  layers, not about alias itself. Replaced with a stronger assertion (12): every
  DS-prefixed `var()` in component CSS must name a **declared** token.
- **The pairing rule as an automated gate.** Attempted and **not shipped** — see
  known gap #19.

### Changed — version

`package.json` `1.11.0` → `1.12.0`, via `npm version 1.12.0 --no-git-tag-version`.
`package-lock.json` agrees at **both** root entries (`version` and
`packages[""]`), verified after the bump. Tag count unchanged at 12.

**Minor, not patch — ruled by Teku, and the reasoning is recorded so the next
tooling-only release does not re-open it.** Strict semver would make this a
patch: there is no public-API change, and this entry says so at the top. It is a
minor anyway, for two reasons.

**First, this repo's tags mean "a gate closed", not "an API changed."** All
twelve existing tags are minors, and v1.10.0 — a **one-line CSS fix** — took one.
Introducing the first patch here would make *this* release the anomaly rather
than the correct one, and the signal a patch would carry is already carried far
better by the entry itself, which states in its headline that nothing a consumer
can see changes.

**Second, the distinction never reaches the consumer.** The MVP consumes the
design system as a **git dependency pinned to an annotated tag**, not through a
semver range — so no `^` or `~` resolution ever reads these numbers, and no
consumer can be moved by a version bump without an explicit re-pin. There is
nothing for the major/minor/patch boundary to protect. *(Stated by Teku from the
MVP side; not verified here, since this gate did not open the MVP tree — the same
convention `docs/mvp-migration-v1.5.0.md` uses for downstream facts.)*

The rule this sets, for the next release that hits it: **a tooling-only release
still takes a minor.** What distinguishes it is the entry's headline, not the
number.

### Corrected — `CLAUDE.md` had been carrying E-3 as open for two releases

See known gap #17. `CLAUDE.md`'s `on-color` correction block, dated 2026-08-07,
lists three tokens as still flipping to `neutral-950` in dark. **All three now
resolve `#e7eaed` in both themes.** Item 4 of v1.6.0 below records the repair;
`CLAUDE.md` was never updated to match. Corrected there this release, with the
stale table left in place — the *shape* of the defect is what tests 6 and 7 exist
to catch — but explicitly marked closed so nobody acts on it as live.

### Verification

Every figure below was read from a direct exit code captured into a variable, not
through a pipe.

- `npx tsc -b --force` — **0**. Forced, because the incremental cache otherwise
  reports success on stale input.
- `npm test` — **0**, **60 files / 508 tests**, all passing. Delta of exactly
  **+14 tests / +1 file** against the v1.11.0 baseline of 59/494, which is the
  new file and nothing else.
- `npm run check:css-registration` — **0**, 58/58 reachable.
- `npm run build` — **0**.
- `npm run build:lib` — **0**. `dist/index.css` 147.94 kB, `dist/index.js`
  5,590.07 kB — unchanged from v1.11.0, as a tooling-only release requires.
  **A green suite does not prove a consumable package; this step is that proof.**
- `.github/workflows/ci.yml` parses to a single job `verify` with 8 steps, the
  detector at position 6.
- **`npm run build:tokens` was not run**, and that is deliberate: it dirties
  `globals.css` and `gradients.ts` through the index stat-cache artefact
  documented in `CLAUDE.md`, and nothing this release touched feeds the pipeline.

The detector was proven in **three** directions, all with the file restored
afterwards and restoration verified by blob identity rather than checksum (see
known gap #18): a removed registration exits 1 and names the file; a broken
`@import` target fires both error classes; and routing a component through an
intermediate index file — which leaves **zero** textual matches in `package.css`,
so a text-matching detector would false-alarm — still exits **0**.

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

Originally ten items at v1.5.0. **v1.6.0 resolved #1 (and corrected it — it was
wrong as written), corrected #4's count, and appended #11–#15. v1.12.0 partially
addressed #4 and appended #16–#19. v1.13.0 amended #13 (the token is a
system-wide finding, and it fails in dark as well), corrected #19's figures and
annotated every translucent one with its backdrop, and appended #20–#21.
v1.14.0 RESOLVED #13 and #20, and appended #22–#23.** The
count is the length of the list below.

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

   **PARTIALLY ADDRESSED in v1.12.0 — but not the part this item is about.**
   The DS now has two guardrails it lacked: `npm run check:css-registration`
   (component CSS reachability, in CI) and 14 token-value tests. **Neither is a
   raw-px linter**, `check-tokens.mjs` still does not exist here, and there is
   still no `lint:tokens` script — do not go looking for one. The ~36 raw-px
   declarations are untouched and the figure was not re-censused this release.
   What changed is that "the DS has no token guardrail" is no longer true as
   written; the raw-px gap it was filed for remains fully open.
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

13. ~~**Ten `--mapped-text-*` tokens fail AA 4.5 in LIGHT mode.**~~
    **`--mapped-text-primary-*` RESOLVED in v1.14.0. The other nine remain open —
    see the note at the end of this item.**

    **What v1.14.0 fixed.** `--mapped-text-primary-default` and its `-hover` /
    `-pressed` siblings moved one ramp step outward in light and two in dark:
    light `#0358cc` / `#024299` / `#022c66`, dark `#68a8ff` / `#9bc5ff` /
    `#b4d4ff`. All 69 measured (token, surface) cells now clear 4.5 with at least
    0.30 of margin; the worst is 4.8638. See the v1.14.0 entry for the full
    derivation, the mutation proof and the blast radius.

    **Two corrections to what this item recorded**, both found by re-deriving
    from disk rather than adopting the table below:

    - **The census was an undercount.** It recorded 9 declarations across 8
      components. Disk holds **12 across 9** for `-default` alone and **22 across
      11** including `-hover` / `-pressed`. The three missed are
      `Button.css:107`, `:124` and `:142`, invisible to a `color:`-scoped grep
      because Button assigns through a `--btn-text` indirection.
    - **The worst instance was never in this item at all.** The dark-mode primary
      Button puts a blue label on a WHITE fill and measured **1.6452** when
      pressed — worse than every figure recorded here, and unfixable by any ramp
      move. Filed as #22.

    The original table is left below because the *shape* of the finding is worth
    keeping, and because the nine non-primary tokens in it are still open. Do not
    act on the `--mapped-text-primary-default` rows as live.

    Measured against
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

    **AMENDED (Gate 35, 2026-08-29) — `--mapped-text-primary-default` is a
    design-system-wide finding, not the `Badge` finding it has been recorded as,
    and its dark figure above is only true against ONE of the two surfaces it
    actually lands on.** Reached from the opposite direction: gap #19's flip-parity
    measurement flagged `Badge --inverted`, and tracing the token out of that one
    call site found eight more.

    It is consumed as a text colour in **9 declarations across 8 components**, and
    in light every one measures **4.4876** — `#046eff` on `#ffffff` — because
    `--mapped-surface-page` and `--mapped-surface-elevation-default` are the same
    colour in light:

    | site | surface it sits on | light | dark |
    |---|---|---|---|
    | `Badge.css:60` `.mn-badge--inverted` | page `#ffffff` / `#000000` | **4.4876** ❌ | 4.6795 ✅ |
    | `CardBalance.css:84` `__name` | **elevation** `#ffffff` / `#262626` | **4.4876** ❌ | **3.3723** ❌ |
    | `CardMonthlyBudget.css:48` `__details` | **elevation** `#ffffff` / `#262626` | **4.4876** ❌ | **3.3723** ❌ |
    | `FilterChip.css:69` | page | **4.4876** ❌ | 4.6795 ✅ |
    | **`Link.css:21`** | page | **4.4876** ❌ | 4.6795 ✅ |
    | `MenuItem.css:49` | page | **4.4876** ❌ | 4.6795 ✅ |
    | `MenuItem.css:119` | page | **4.4876** ❌ | 4.6795 ✅ |
    | `BottomNavigation.css:82` | page | **4.4876** ❌ | 4.6795 ✅ |
    | `SideNavigation.css:148` | page | **4.4876** ❌ | 4.6795 ✅ |

    **The `4.68 ✅` in the table above is the page-surface figure and it is not the
    whole story.** On a card — `--mapped-surface-elevation-default`, `#262626` in
    dark — the same token measures **3.3723**, which fails 4.5 by a wide margin and
    is worse than the light-mode failure this item was filed for. Both
    `CardBalance` and `CardMonthlyBudget` set that surface on their own root and
    then place this token on it. So the token fails AA **in both themes**, at
    different call sites, and this item has only ever recorded half of that.

    **`Link` is the consequential entry.** A hyperlink is the single most
    contrast-sensitive text role in any design system, it renders at 14px/400, and
    it fails in light everywhere it appears.

    ~~**Pending a Figma decision from Teku.**~~ **DONE in v1.14.0** — the token
    moved off its step, in both themes, and the eight components did visibly
    shift. Cross-referenced from gaps #14 and #19; #14's `Badge inverted` row is
    superseded by that move and should be re-measured when #14 is next opened.

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
    <!-- Badge inverted: re-measured at Gate 35 as 4.4876 / 4.6795 — this row was
         right all along. See gap #13's Gate 35 amendment: the same token fails at
         eight further call sites, and gap #19's claim that the four flip-parity
         hits had never been contrast-measured was false because of this row. -->


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

**Added in v1.12.0**

16. **Two `on-color` tokens change with the theme, and should not.** Found by
    writing the theme-invariance assertion and watching it fail; **not fixed**,
    because the repair is a hand edit to `Mapped/Dark.json` and that is a
    Figma-source decision.

    | Token | light | dark | Δ luminance |
    |---|---|---|---|
    | `--mapped-text-disabled-on-color` | `#b6bfca` 0.5147 | `#8695a7` 0.2935 | −0.2212 |
    | `--mapped-icon-disabled-on-color` | `#b6bfca` 0.5147 | `#8695a7` 0.2935 | −0.2212 |

    The `on-color` family describes content on a surface that stays the same
    colour in both themes, so content on it should not move either. This is the
    same semantic class as E-3 (#17 below) at a much smaller magnitude: greyed-out
    labels and icons on coloured surfaces read darker in dark mode than they
    should.

    **Two more tokens flip and are DELIBERATE — do not re-file them as defects.**
    `--mapped-surface-interactive-on-color-hover` (`#f2f2f2` → `#e7eaed`) and
    `-pressed` (`#e5e5e5` → `#cfd5dc`) were set to Figma's Inverse-variant dark
    values on purpose by v1.6.0's Item 4. Four tokens in the family differ between
    themes; only these two disabled ones are unexplained.

    **This is why test 6 asserts a luminance FLOOR rather than theme-invariance.**
    The threshold is derived, not fitted: the lowest relative luminance across all
    53 `on-color` tokens in both themes is **0.2935**, and E-3's defect value
    `#0d0f11` is **0.0047**. The floor sits at **0.15** — roughly 2× headroom above
    every legitimate value and 30× below the defect it exists to catch. The
    stricter assertion would have needed a four-name exception list, i.e. the
    hand-maintained array the registration detector was specifically built to
    avoid.

17. **`CLAUDE.md` carried E-3 as an open defect for two releases after it was
    fixed.** The finding is the documentation failure, not the tokens — the tokens
    are correct.

    `CLAUDE.md`'s `on-color` correction block, dated 2026-08-07, lists
    `--mapped-text-on-color-caption`, `-label` and `-placeholder` as flipping from
    `neutral-100` `#e7eaed` in light to `neutral-950` `#0d0f11` in dark. Measured
    at v1.12.0 by resolving the full `var()` chain in both themes: **all three
    resolve `#e7eaed` in light and `#e7eaed` in dark.** The `neutral-950` bindings
    are gone. Item 4 of the v1.6.0 entry above records the repair.

    Corrected in `CLAUDE.md` this release. The stale table was left in place
    rather than deleted, because the *shape* of the defect is what tests 6 and 7
    exist to catch, but it is now explicitly marked closed.

    **The general hazard**: this file and `CLAUDE.md` record the same findings and
    drift independently. A defect fixed in one and left standing in the other
    reads as live to the next session, which is exactly what happened here. When
    closing an item, close it in both.

18. **A checksum is not a valid restoration proof in this repo. Use the git blob
    SHA.** Found while restoring a scratch-mutated file during the detector proof.

    With `core.autocrlf=true` set globally and no `.gitattributes`, `git checkout
    -- <path>` re-smudges LF to CRLF on the way out of the index. A file restored
    that way is **content-identical to `HEAD` and byte-different on disk** from
    what was there before the mutation, so an MD5 taken before and after will not
    match even though nothing is wrong. Measured on `src/components/Toggle/Toggle.css`:
    MD5 `90b535cb…` before, `ff407b69…` after, while `git hash-object` returned
    `f16f2cb70cce09bd2a73c03bd843883bdb078cd8` — equal to
    `git rev-parse HEAD:src/components/Toggle/Toggle.css` — and `git status` was
    clean.

    It happens to work on a file that is already CRLF on disk, which is how
    `src/styles/package.css` gave a matching MD5 in the same session and made the
    method look sound. **The correct check is `git hash-object <path>` against
    `git rev-parse HEAD:<path>`.** Same family as the CI drift gate's own
    stat-cache artefact already documented in `CLAUDE.md`: the tool answered a
    slightly different question than the one being asked, and its answer looked
    reasonable.

19. **The pairing rule permits four call sites that do the thing it exists to
    prevent, and v1.12.0 deliberately shipped no gate for it.** Two formulations
    were built and measured; neither is shippable, and the reason is worth
    recording so nobody rebuilds them.

    The rule (rewritten in v1.6.0, Item 2b) forbids an alias token supplying one
    half of a colour pair whose other half is mapped, on the grounds that
    both-mapped pairs "flip together".

    **Formulation 1 — layer-mixing**, the letter of the rule. Returns **3 hits**:
    `Badge.css .mn-badge--dark`, `Chips.css .mn-chips--default.mn-chips--bold`,
    `.mn-chips--success.mn-chips--bold`. **All three are false positives** — the
    mapped half is an `on-color` token, which is theme-invariant, so the pair
    cannot drift. Testing the layer tests the wrong thing.

    **Formulation 2 — flip-parity**, the purpose of the rule: exactly one half
    changes between themes. Returns **6 hits**, all mapped-on-mapped and therefore
    permitted by the rule as written:

    | file | rule | mismatch |
    |---|---|---|
    | `Badge.css` | `.mn-badge--inverted` | bg `--mapped-surface-page` flips, `color` static |
    | `CardMonthlyBudget.css` | `__add-icon` | bg `--mapped-icon-subtle-default` flips, `color` static |
    | `LineChart.css` | `__marker` | **false positive** — the border colour is `currentColor` |
    | `Tab.css` | `:focus-visible` | **false positive** — `outline` is a width token plus a static border token |
    | `Tag.css` | `--default:hover` | bg `color-mix(…)` static, `border-color` flips |
    | `Tag.css` | `--default:active` | bg `color-mix(…)` static, `border-color` flips |

    Four survive scrutiny. They are **not rule violations** — both halves are
    mapped, which the rule explicitly permits — but the rule's stated reasoning is
    not true of them. Either the wording or these four call sites is wrong, and
    **none of the four has been contrast-measured**, so calling them defects would
    be carrying an unverified figure.

    Shipping either check would have required a whitelist to get it green, which
    is the failure class the registration detector was built to avoid. **Reported,
    not asserted.** The next step is measurement, not a rule rewrite.

    ### MEASURED (Gate 35, 2026-08-29). Three of the four are harmless; one is a
    ### restatement of gaps #13 and #14, not a new finding.

    The six-hit table above was re-derived from scratch before measuring, not
    trusted. A broader scan (any rule setting both a background-ish and a
    foreground-ish property, resolved through the full `var()` chain in both
    themes) returns **30** flip-parity mismatches across the 58 component CSS
    files. Filtering to pairs where *both* halves are actual colours — dropping
    every rule whose other half is `none`, `transparent`, or `currentColor`, which
    is not a colour pair at all — reproduces exactly the four survivors and both
    false positives. The Gate 34 list is correct.

    **The falsifier was checked and is clear of gradients.** Every token in all
    four pairs resolves to a flat six-digit hex in both themes; none touches
    `--mapped-gradient-*` or a scrim. The standing caveat that arithmetic contrast
    is not a lower bound applies only across a gradient's interpolation, so
    arithmetic is valid here and no browser measurement is needed.

    **But two of the four are not flat on one side, in a way the falsifier as
    posed did not name.** Both `Tag` rules paint
    `color-mix(in srgb, var(--mapped-border-primary-default) N%, transparent)`,
    which is a *translucent* fill, not a gradient. Its rendered value depends on
    the backdrop behind the Tag. Alpha compositing over a flat backdrop is exact
    arithmetic — unlike gradient interpolation, it does not dither — so this is
    still measurable, but the backdrop must be stated. Both backdrops the DS
    actually offers are measured below.

    **P1 and P2 are opaque on both halves, so a backdrop does not apply to them:**

    | # | file · rule | pair | light | dark | threshold | verdict |
    |---|---|---|---|---|---|---|
    | P1 | `Badge.css` `.mn-badge--inverted` | `--mapped-surface-page` / `--mapped-text-primary-default` | `#046eff` on `#ffffff` **4.4876** ❌ | `#046eff` on `#000000` 4.6795 ✅ | 4.5 (body, 14px/400) | **FAILS light** |
    | P2 | `CardMonthlyBudget.css` `__add-icon` | `--mapped-icon-subtle-default` / `--mapped-text-primary-on-color` | `#ffffff` on `#6b7786` 4.5572 ✅ | `#ffffff` on `#8695a7` 3.0565 ✅ | 3.0 (graphical object) | passes, **0.0565 of headroom in dark** |

    **P3 and P4 paint a translucent fill, so every figure below names the backdrop
    it was composited over.** No figure for these two rules is meaningful without
    one; a bare number is not comparable to another bare number.

    | # | rule | theme | backdrop | composited fill | border vs 3.0 | label vs 4.5 |
    |---|---|---|---|---|---|---|
    | P3 | `--default:hover` | light | page `#ffffff` | `#e6f1ff` | 5.6021 ✅ | 5.6021 ✅ |
    | P3 | `--default:hover` | light | elevation `#ffffff` | `#e6f1ff` | 5.6021 ✅ | 5.6021 ✅ |
    | P3 | `--default:hover` | dark | page `#000000` | `#000b1a` | 5.9217 ✅ | 5.9217 ✅ |
    | P3 | `--default:hover` | dark | **elevation `#262626`** | `#232d3c` | 4.1596 ✅ | **4.1596 ❌** |
    | P4 | `--default:active` | light | page `#ffffff` | `#cde2ff` | 7.0980 ✅ | 7.0980 ✅ |
    | P4 | `--default:active` | light | elevation `#ffffff` | `#cde2ff` | 7.0980 ✅ | 7.0980 ✅ |
    | P4 | `--default:active` | dark | page `#000000` | `#011633` | 7.4198 ✅ | 7.4198 ✅ |
    | P4 | `--default:active` | dark | elevation `#262626` | `#1f3451` | 5.1474 ✅ | 5.1474 ✅ |

    In light the two backdrops are the same colour — `--mapped-surface-page` and
    `--mapped-surface-elevation-default` both resolve `#ffffff` — so the light rows
    are identical by construction, not by coincidence. They diverge only in dark
    (`#000000` vs `#262626`), which is why **dark-on-elevation is the only cell in
    the whole set that fails.**

    **Why the border and label columns hold the same number, and why that is not a
    duplicate.** `--mapped-border-primary-default-hover` and
    `--mapped-text-primary-default-hover` are **two different tokens that resolve to
    the identical value** in both themes (`#0358cc` light, `#368bff` dark); likewise
    the `-pressed` pair (`#024299` / `#68a8ff`). So one composited pair carries **two
    thresholds at once** — 3.0 where it is read as a UI-component boundary
    (WCAG 1.4.11) and 4.5 where the same colour is read as the 14px label (1.4.3).
    The earlier one-row-per-rule form under-reported this: it showed only the border
    reading and left the label to a separate paragraph, which made one measurement
    look like two findings. It is one measurement, judged twice.

    That is also the resolution of a collision in the Gate 35 report: **4.1596
    appeared as both P3's border figure and the Tag label figure. Both were
    correct** — same fill, same colour, same backdrop, two thresholds. The border
    passes it and the label fails it.

    Thresholds applied: **4.5** for P1, because `Badge` renders its label with
    `type-body-sm` — 14px at weight 400, which is not WCAG "large text" (≥18.66px
    bold or ≥24px). **3.0** for P2, whose content is an `Icon` glyph, a graphical
    object under 1.4.11. **3.0** for P3/P4, where the measured foreground is a
    `border-color` — a non-text UI component boundary, also 1.4.11.

    **P1 is not a new defect. It is gaps #13 and #14 seen from a third angle**,
    and the figure was already in this file twice: #13 records
    `--mapped-text-primary-default` at 4.49 light / 4.68 dark, and #14's table
    records `Badge` `inverted` at **4.49 ❌ / 4.68 ✅**. Both match the measurement
    above to the digit. **Item #19's own claim that "none of the four has been
    contrast-measured" was therefore false when written** — one of them had been
    measured twice, in two adjacent items of the same list. This is gap #17's
    hazard (records drifting apart) occurring *within a single file* rather than
    between two.

    The scope is wider than `Badge` — see the amendment to gap #13 for the full
    census. In short: `--mapped-text-primary-default` is a text colour in **9
    declarations across 8 components including `Link`**, every one of them at
    **4.4876** against white in light.

    **Figure corrected (Gate 35 continuation): 4.4876, not 4.4870.** The Gate 35
    report gave `4.4876` in its table and `4.4870` in its prose for what is the
    same pairing — `#046eff` on `#ffffff`, the only pairing available, since both
    `--mapped-surface-page` and `--mapped-surface-elevation-default` resolve
    `#ffffff` in light. Re-derived to six decimal places: the relative luminance of
    `#046eff` is `0.18397673`, giving `1.05 / 0.23397673` = **4.487626**. The prose
    figure was a transcription slip from a hand computation and is wrong in the
    fourth decimal; `4.4876` is correct and is used everywhere in this record.

    **Two corrections to the six-hit table's false-positive column.**

    - `Tab.css` `:focus-visible` was dismissed on the grounds that "`outline` is a
      width token plus a static border token". That reasoning is wrong: the
      declaration is `var(--brand-scale-50) solid var(--mapped-border-primary-default)`,
      which *does* carry a colour token, and the rule *is* a genuine flip-parity
      mismatch (background flips `#ffffff`→`#000000`, outline colour is `#046eff`
      in both). **The conclusion survives the reasoning.** Measured, it is 4.4876
      light / 4.6795 dark against a 3.0 threshold for a focus indicator — passing
      with margin in both themes. There is a *better* reason to discount it, too:
      `outline-offset: var(--brand-scale-50)` places the ring 2px outside the
      border box, so the ring is not drawn over the tab's own background at all.
      It happens not to matter, because `--mapped-surface-primary-default-subtle`
      resolves to the same value as `--mapped-surface-page` in both themes.
    - `LineChart.css` `__marker` is a correct false positive, for the stated
      reason. `currentColor` is not statically resolvable and the marker's border
      inherits from its series colour.

    **One pair the rule-scoped scan structurally cannot see, reported because it
    is the only figure here that fails on a backdrop the DS actually renders.**
    `Tag`'s label colour is set in a *sibling* rule
    (`.mn-tag--default:hover .mn-tag__label`), so no check that compares
    declarations within one rule will ever pair it against the fill. Measured
    across both backdrops:

    | pair | backdrop | light | dark |
    |---|---|---|---|
    | hover fill / `--mapped-text-primary-default-hover` | page `#ffffff` / `#000000` | 5.6021 ✅ | 5.9217 ✅ |
    | hover fill / `--mapped-text-primary-default-hover` | elevation `#ffffff` / `#262626` | 5.6021 ✅ | **4.1596 ❌** |
    | active fill / `--mapped-text-primary-default-pressed` | page `#ffffff` / `#000000` | 7.0980 ✅ | 7.4198 ✅ |
    | active fill / `--mapped-text-primary-default-pressed` | elevation `#ffffff` / `#262626` | 7.0980 ✅ | 5.1474 ✅ |

    A `Tag` hovered **inside a card in dark mode** puts `#368bff` on a fill of
    `#232d3c` (10% `#046eff` composited over elevation `#262626`) at **4.1596**,
    under the 4.5 needed for its 14px label. The identical rule over the page
    surface `#000000` composites to `#000b1a` and measures 5.9217, which passes. This is a translucent-fill hazard, not a
    flip-parity one, and it is the reason the backdrop had to be stated rather
    than assumed. **Not fixed** — like P1 it needs a token or design decision.

    **Verdict on the question this measurement existed to settle: three of the
    four are harmless, and the fourth is an already-recorded token gap rather than
    a call-site defect.** Nothing here justifies rewriting the pairing rule, and
    nothing here was fixed. What it does establish is that **flip-parity is not by
    itself evidence of a defect** — P2, P3 and P4 all mismatch and all pass, two of
    them comfortably. A future gate built on formulation 2 would have flagged four
    call sites of which zero needed a code change. That is the argument against
    shipping it, and it is now measured rather than asserted.

**Added in v1.13.0**

20. ~~**The token tests cover token VALUES, not token PAIRINGS — and one shipped
    pair has 0.0565 of margin.**~~ **The MARGIN half is RESOLVED in v1.14.0; the
    MISSING-GATE half is NOT, and is re-filed below as the part that still
    stands.**

    **Resolved.** The 0.0565 cell — `CardMonthlyBudget` `__add-icon`, white on
    `--mapped-icon-subtle-default` in dark — was re-measured at Gate 36 and is
    unchanged at **3.0565**, because neither token in that pair moved. What
    v1.14.0 did resolve is the *policy*: a 0.30 margin floor was applied to every
    token this gate touched, and `FilterChip`'s selected-press wash was thinned
    24% → 20% purely to satisfy it, at no compliance cost (24% already passed at
    4.5898). All 69 primary-text cells now sit at 0.3638 of margin or better.

    **Still open, and the reason this item is not struck through entirely:** the
    DS still has **no regression gate on any contrast figure it has ever
    measured**, in either repo. Gate 36 measured 69 text cells and 33 border
    cells and committed none of them to a test. Every figure in gaps #12, #13,
    #14, #19, #22 and #23 remains a point-in-time measurement that nothing
    re-checks. Whether that can be closed without the hand-maintained pairing
    list the registration detector exists to avoid is still the open design
    question.

    *Original text follows.*

    **The original finding.** No test in this repo would go red if either half
    of a colour pair moved until the pair itself stopped meeting contrast.

    `CardMonthlyBudget.css` `__add-icon` puts `--mapped-text-primary-on-color`
    (`#ffffff`, theme-invariant) on `--mapped-icon-subtle-default` (`#6b7786`
    light, `#8695a7` dark). Its content is an `Icon` glyph, so the applicable
    threshold is **3.0** (WCAG 1.4.11, graphical object). Measured at Gate 35:
    **4.5572 in light, 3.0565 in dark.** The dark figure clears its threshold by
    **0.0565**.

    That is roughly one 8-bit step of lightness. Nudging
    `--mapped-icon-subtle-default` one rung darker in dark mode — an ordinary,
    plausible Figma change that nobody would think of as risky — drops this pair
    under 3.0.

    **The 14 tests added at v1.12.0 would all stay green through that change**, and
    this is by design rather than oversight. They assert that every `--mapped-*`
    token *resolves* in both themes, that the two theme blocks declare identical
    name sets, that `on-color` tokens hold a luminance floor, that gradients are
    emitted on `*`. Every one of those is a property of a token **in isolation**.
    Contrast is a property of **two tokens and the surface one sits on**, which no
    assertion in the suite currently expresses. The deliberate-exclusions list at
    v1.12.0 says as much — "contrast ratios belong to a component plus a pairing,
    not to a token in isolation" — and that reasoning still holds. What was not
    stated then, and is stated here, is the **consequence**: the DS has no
    regression gate on any contrast figure it has ever measured, in either repo.

    Every figure in gaps #12, #13, #14 and #19 is a point-in-time measurement that
    nothing re-checks. Whether that is worth closing, and whether it can be closed
    without the hand-maintained pairing list the registration detector exists to
    avoid, is an open design question — the same wall gap #19's two formulations
    hit. Recorded so the margin is on the record even if the gate never is.

21. **"Touch feedback" has no scope record anywhere in this repo, and its stated
    provenance is false. This item is the evidence base so a successor does not
    re-derive it.**

    Gate 35 was briefed to implement "touch feedback — press states for touch
    input, split out of v1.7.0 by an earlier ruling", and **HALTED at Phase 2**
    because no such record exists.

    **What was searched, and found empty:** `CLAUDE.md`; every one of the 19
    entries in this list; all three files under `docs/`; all 13
    `MONARCH-CHAT-HANDOFF-*.md`; `MONARCH-BUILD-ROADMAP.md`'s parked table; and
    every commit message on every branch (`git log --all`). The string `touch`
    occurs roughly 25 times across the repo's Markdown and **every single
    occurrence is the past-tense verb "touched"**. There are zero occurrences of
    touch as an input modality.

    **The v1.7.0 attribution is false.** The three commits in `v1.6.0..v1.8.0` are
    `c507d6a` (CI workflow + drift gate), `6f12a4e` (AA surface ladders, monotonic
    hover, brand gradient, `engines >=24`) and `58557b1` (Toast background moved to
    CSS, four falsified comments corrected). None splits out, defers, or mentions
    press or touch states. The roadmap's parked table holds "Motion/elevation token
    layer" and nothing adjacent.

    **The factual position, measured at Gate 35 — scope from this, do not
    re-derive it:**

    - **11 of 49 components declare `:active`**, 28 declarations in total:
      `Button` (1), `Checkbox` (3), `FilterChip` (4), `Link` (5), `MenuItem` (3),
      `SideNavigation` (1), `Radio` (3), `RangeSlider` (1), `Slider` (1), `Tab` (2),
      `Tag` (4).
    - **56 distinct `-press`/`-pressed` mapped tokens exist**, declared in `:root`
      and in `[data-theme="dark"]` at **56 each — full theme parity**. The press
      token layer is complete; nothing is missing there. One naming outlier
      survives, `--mapped-text-error-default-press` (gap #2).
    - **Nothing anywhere distinguishes touch from mouse.** Zero
      `@media (pointer: …)`, zero `@media (hover: …)`, zero
      `-webkit-tap-highlight-color` in any file under `src/`. The **only** `@media`
      block in any CSS in `src/` is the 768px responsive-font breakpoint in
      `globals.css`.
    - **The only touch-aware code in the package** is `touch-action: none` on the
      `Slider` and `RangeSlider` tracks, plus `React.PointerEvent` handlers in those
      same two components. Both exist for **drag-gesture handling, not for
      feedback**, and neither generalises to anything else.

    **The consequence, which is the one concrete defect this search did produce:**
    because no rule is guarded by `@media (hover: hover)`, the hover styling in all
    11 components above **persists after a tap on most mobile browsers**, until the
    user taps elsewhere. A tapped `Tag`, `Tab` or `MenuItem` stays visually hovered.
    This is a real, reproducible defect in shipped components.

    **It is also the one thing in this area that can be fixed without Figma**, and
    that distinction is what makes it safe: wrapping hover rules in a hover-capable
    media query **removes an unintended state** rather than inventing one, so it
    stays clear of the standing rule that an interaction state Figma does not
    define is never added. Anything beyond that — a genuine touch-specific press
    treatment — requires reading the Figma source and is Teku's call, not a
    successor session's inference.

22. ~~**The dark-mode primary `Button` put a light-ladder blue label on a white
    fill — 1.6452 when pressed.**~~ **RESOLVED in v1.14.0.** Recorded because the
    defect existed on `main` for the entire life of the component and appeared in
    no gap, changelog, handoff or roadmap entry until Gate 36's census walked
    every call site of the primary text family.

    In dark, `.mn-btn--primary` inverts to a white fill —
    `--mapped-surface-interactive-on-color` resolves `#ffffff` in **both** themes
    — while `--btn-text` took the mapped dark ladder, which runs *lighter* as it
    moves from rest to pressed:

    | state | fill | label before | before | label after | after |
    |---|---|---|---|---|---|
    | rest | `#ffffff` | `#046eff` | **4.4876** ❌ | `#0358cc` | **6.4187** ✅ |
    | hover | `#e7eaed` | `#368bff` | **2.7630** ❌ | `#024299` | **7.7569** ✅ |
    | pressed | `#cfd5dc` | `#68a8ff` | **1.6452** ❌ | `#022c66` | **9.1362** ✅ |

    **The generalisable lesson, which is why this is a numbered item and not just
    a changelog line: a token move cannot fix a binding error, and can deepen
    one.** Gate 36's ramp move would have taken the pressed cell from 1.6452 to
    **1.0291**. The reason is arithmetic, not taste — in dark,
    `--mapped-text-primary-default` must serve both `#ffffff` (this button) and
    `#000000` (the page), and the best any single colour achieves against both is
    **4.5826**, worse again against `#262626` elevation. No ramp step exists and
    none could be added.

    Fixed at `Button.css:142-144` by binding the label to the light ladder
    directly (`--brand-blue-600/700/800`), the buttons-only exception
    `--btn-bg-hover` on `.mn-btn--secondary` already takes.

    **What is still open here is the architecture, not the contrast.** The DS has
    **no theme-invariant `--mapped-text-*` token that is a dark accent colour** —
    verified by resolving all 54 in both themes; the only theme-invariant blue was
    `-default` itself, and v1.14.0 removed that property. A named inverse family
    (`--mapped-text-primary-on-light` or similar) is the correct long-term answer
    and was **not** built, because it would mirror no Figma variable, which is the
    thing `build-mapped.mjs` exists to refuse. **If a second component ever needs
    an inverse accent label, build the family rather than copying this
    exception.** That is Teku's call and needs the Figma source.

23. **`FilterChip`'s selected border fails 3.0 against its OWN pressed fill in
    dark on an elevated surface — 2.7900.** Surfaced by Gate 36 and **not fixed**.
    Pre-existing and **improved, not caused, by v1.14.0**: at the old 24% wash it
    was **2.6672**; the 20% wash lifts it to 2.7900. Still short of 3.0.

    `--mapped-border-primary-default` (`#046eff`, unchanged by v1.14.0) against a
    20% wash of itself over `--mapped-surface-elevation-default` (`#262626`).

    **Two reasons it was left alone rather than chased.** First, it is arguably
    not a WCAG 1.4.11 failure at all: the boundary that identifies the control is
    the border's **outer** edge against the surface behind it, which measures
    **3.3723** and passes: an invisible inner edge makes the chip read as solidly
    filled, not as absent. Second, the only fixes available make something else
    worse — moving `--mapped-border-primary-default` was measured at Gate 36 and
    reintroduces **4 text failures** (see the v1.14.0 entry, item 3), and thinning
    the wash further would start contradicting Figma's 10% rest value.

    **This cell was missing from Gate 36's own Phase 2 border census** and only
    appeared in the Phase 4e re-run, which is how a pre-existing failure came to
    be found *after* the change rather than before it. A border-versus-its-own-
    fill pairing is easy to omit because both halves come from one token; any
    future census should enumerate it explicitly.
