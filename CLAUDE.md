# CLAUDE.md

## Project
Personal design-system codebase — reusable foundation for future apps/sites.
NOT a product. Goal: a stable, typed component library built on Figma design tokens.

## Stack
Vite + React + TypeScript. Font: @fontsource/poppins (400/500/600).

## Token pipeline — COMPLETE

### Source of truth
Figma Variables → Token Studio → `design-tokens/` JSON exports. Before exporting:
1. Re-sync Token Studio with Figma (pull latest variable values).
2. Export using the **per-mode folder files** (`Brand/Value.json`, `Mapped/Light.json`,
   `Responsive/Desktop.json`, etc.) — not the flat single-file export.

### Layers (in dependency order)

| Layer | Source JSON | Build script | Outputs |
|---|---|---|---|
| Brand | `Brand/Value.json` | `build-brand-colors.mjs` | `brand.ts`, `:root` color + scale vars in `globals.css` |
| Alias | `Alias/Alias.json` | `build-alias-colors.mjs` | `alias.ts`, `/* === Alias === */` block in `globals.css` |
| Mapped | `Mapped/Light.json` + `Dark.json` | `build-mapped.mjs` | `mapped.ts`, light/dark blocks in `globals.css` |
| Responsive | `Responsive/Desktop.json` + `Mobile.json` | `build-responsive.mjs` | `responsive.ts`, spacing + font vars (+ `@media 768px`) in `globals.css` |
| Typography | `Brand/Value.json` (composites) | `build-typography.mjs` | `typography.ts`, `typography.css` (22 `.type-*` classes) |
| Gradients | `Brand/Value.json` (`Gradient_*`) | `build-gradients.mjs` | `gradients.ts`, `/* === Gradients === */` block in `globals.css` |
| Shadows | `Brand/Value.json` (`Dropshadow_*`) | `build-shadows.mjs` | `shadows.ts`, `/* === Shadows === */` block in `globals.css` |

### Running the scripts
One command runs all seven layers, in order:
```
npm run build:tokens
```

**The order lives in exactly one place — the `build:tokens` script in
`package.json`. Do not restate it in prose.** Every prose copy is another thing
that can drift out of step with the pipeline, and no gate would catch it. This
section used to hold such a copy; that is what this note replaces.

**Do not run the seven scripts by hand.** Two distinct failures have already
been paid for, and both are failures of invoking them individually:

1. *Stopping early.* This section once listed the seven invocations and the list
   stopped at typography. Following it verbatim regenerated a `globals.css` with
   no `--shadow-*` or `--gradient-*` declarations at all — while 10+ component
   CSS files (all four `Card` variants, both `Navigation` components, `Tab`)
   kept consuming `var(--shadow-*)`. Those silently resolved to nothing, so
   every card and nav rendered with no shadow and no build error. Regression
   introduced at `142df40`, found and repaired 2026-07-31.
2. *Ending on gradients.* **Fixed at source in v1.7.0 — kept here as the reason
   the rule existed.** `build-gradients.mjs` used to emit a barrel that omitted
   the `shadows` exports, so if it ran last, `import { shadows }` silently broke.
   It now emits all seven, so this specific failure can no longer occur — but
   failure mode 1 above is untouched and is reason enough on its own.

`npm run build:tokens` removes both failure modes at once: it cannot stop early
and it cannot end on the wrong script. That is the reason to prefer it.

**Barrel completeness (v1.7.0: no longer order-dependent).** Six of the seven
scripts rewrite `src/tokens/index.ts` from their own hardcoded export list —
`build-brand-colors.mjs` is the one exception, it never touches the barrel — so
whichever script runs last decides the final barrel. Re-derived from the six
write sites, 2026-08-25:

| Script | Barrel it writes |
|---|---|
| `build-brand-colors.mjs` | *(does not write the barrel)* |
| `build-alias-colors.mjs` | brand, alias |
| `build-mapped.mjs` | + mapped |
| `build-responsive.mjs` | + responsive |
| `build-typography.mjs` | **all seven** |
| `build-gradients.mjs` | **all seven** (was six — fixed in v1.7.0) |
| `build-shadows.mjs` | **all seven** |

**This entry previously read "gradients must not run last."** That constraint
was real: `build-gradients.mjs` emitted a six-export barrel omitting `shadows`,
and it was the only incomplete emitter scheduled *after* a complete one
(`build-typography.mjs`), so its partial barrel was the only one that could
survive to the end of a full run. v1.7.0 removed the hazard at its source by
giving `build-gradients.mjs` the same seven-export list the other two complete
emitters write, turning a documented ordering rule into an unbreakable one.

Verified when the change landed: because `build-shadows.mjs` runs afterwards and
writes the identical seven exports, regenerating produced **no diff at all** on
`src/tokens/index.ts`. The generated output is unchanged; only the failure mode
is gone.

Three scripts still emit an incomplete barrel (alias, mapped, responsive), but
all three run before `build-typography.mjs`, which restores the full set. The
order in `build:tokens` is therefore no longer load-bearing for barrel
completeness — it remains load-bearing for value resolution, since each layer
reads the CSS the previous one wrote.

### The CI drift gate, and the scope it covers

`.github/workflows/ci.yml` runs `npm run build:tokens` and then asserts twice
that the tree still matches what the pipeline produced:

1. `git diff --exit-code` — catches a hand-edit to a generated file that the
   next pipeline run would silently revert (the light/dark mapped blocks in
   `globals.css` are the usual victim).
2. `git status --porcelain -- src/tokens src/styles` — catches a *new*
   generated file that no one committed. The diff check is blind to untracked
   files, so without this the gate passes on a tree that does not match.

**The second assertion is scoped to `src/tokens` and `src/styles`, and that
scope must widen if any build script write surface ever widens.** The scope is
correct today because every write site in all seven scripts resolves under one
of those two directories — verified by grepping every `writeFileSync` target in
`scripts/`. Add a script that writes anywhere else and the assertion will not
see it. Unscoped is not the fix: unscoped, the assertion fails on any stray
untracked file anywhere in the repo, which makes it unverifiable on a working
tree that is legitimately dirty.

**Assertion 2 reads red locally on Windows and green in CI — this is expected,
not a broken gate.** With `core.autocrlf=true` set globally and no
`.gitattributes`, git smudges LF blobs to CRLF on checkout; the build scripts
then rewrite those files as LF, and `git status` flags them as modified even
though they are byte-identical to the committed blob. Measured, all three
states reproducible on demand: after a pipeline run the files are LF and
status shows `M`; after `git checkout --` they are CRLF and status is clean;
after another pipeline run they are LF and `M` again. **The pipeline itself is
content-idempotent** — every generated file compares byte-identical to its
index blob after a run, and `git diff --exit-code` returns 0 throughout. On a
Linux runner `actions/checkout` does not smudge, so neither assertion sees any
of this.

**CORRECTION (Gate 31, 2026-08-27): the "all generated files go `M`" half of
that account is wrong, and CRLF smudging does not explain which files get
flagged.** After `npm run build:tokens` on a clean tree, git emits LF-to-CRLF
warnings for many more generated files than `git status --porcelain` actually
flags, and every flagged file is byte-identical to its index blob:
`git hash-object` returns the index SHA **both with and without
`--no-filters`**, and `git show HEAD:<path>` compares equal under `cmp`. So the
`M` is stale stat data that `git status` declined to refresh — not a content
difference and not a line-ending difference — and `git diff --exit-code`
returns 0 throughout, which is why assertion 1 stays green. The operational
guidance is unchanged: assertion 2 reads red locally, green in CI.

**This note deliberately carries NO file count, and reinstating one is a
regression.** It used to assert a specific number of flagged files, and that
number has already gone stale once: Gate 31 measured two
(`src/styles/globals.css` and `src/tokens/gradients.ts`); Gate 40 re-measured
and found **only `src/styles/globals.css`** — `gradients.ts` no longer appears
at all. Nothing about the mechanism changed between those two readings, because
the index stat cache is a property of the local checkout's history, not of the
pipeline. **The count is an artefact of when the index was last refreshed and
carries no information.** Verify identity per file with `git hash-object` when
it matters; never compare counts across gates.

### Token-value coverage (Gate 34, v1.12.0)

`src/test/tokens.test.ts` + `src/test/tokenCss.ts`. **Gate 34 contributed the
14 tests numbered below**; Gate 40 added 2 more to the same file for the
touch-safe hover guard, so the file now holds **16**. The two sets are
independent — the numbered table is Gate 34's and is not renumbered. Before
this, nothing asserted a token RESOLVES to anything — the CI drift gate proves
the generated files match the generator, not that what the generator produced is
usable.

**It resolves the CSS statically, not through `getComputedStyle`.**
`vitest.config.ts` sets no `test.css` option, so CSS imports are stubbed and no
stylesheet is ever applied in jsdom; nothing in the suite can read a resolved
custom property from the DOM. Parsing `globals.css` is not a workaround for
that — it is the stronger check, because it walks the whole `var()` chain and
names *which link* is missing rather than returning the empty string a browser
hands back.

**Declarations are collected by SELECTOR, not by assuming `:root`.** The four
`--mapped-gradient-*` are emitted on `*` deliberately; a `:root`-scoped read
returns nothing for them and looks like a failure. The parser is a brace-depth
scan with a selector stack, so a `:root` nested inside `@media` is not confused
with a top-level one.

What is asserted:

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

Every one was **mutation-proven at Gate 34** — the mutation applied to
`globals.css` (or `Toggle.css` for 12), the suite re-run, exit 1 confirmed, the
file restored. A test that cannot fail is worse than no test; these were made to
fail on purpose before being trusted.

**Deliberate exclusions, and why:**

- **Exact colour values.** Pinning `--mapped-surface-page === '#ffffff'`
  re-states the token source in a second place, and the next legitimate Figma
  change fails a test that was only ever a copy. Nothing here pins a hex. What is
  pinned is STRUCTURE: does it resolve, does it flip, is it declared in both
  themes.
- **Contrast ratios.** They belong to a component plus a pairing, not to a token
  in isolation, and this repo measures them in a real browser because rendered
  and computed figures differ (see Verification discipline).
- **`--brand-*` / `--spacing-*` / `--responsive-*` as separate suites.** Covered
  transitively — every `--mapped-*` resolves *through* them, so a broken
  primitive fails at the mapped token that consumes it, naming the missing link.
- **The `@media (min-width: 768px)` block.** It redeclares 14
  `--responsive-font-*` tokens that no `--mapped-*` consumes.
- **"Zero `--alias-*` in component CSS."** Proposed and **rejected**: it fails
  today on **22 references across 5 files** (`Badge`, `Chips`, `HeaderBg`,
  `StatusBar`, `TrendIndicator`), and every one is legitimate. The pairing rule
  permits a both-halves-alias pair — theme-invariant by construction — and those
  five use exactly that. The rule is about MIXING layers, not about alias itself.
- **The pairing rule as an automated gate.** Attempted at Gate 34 and **not
  shipped**; see Known open items for the measurements and why.

Verified when this landed: **all 195 `--mapped-*` tokens resolve in both
themes, zero failures.** The name sets in the two theme blocks are identical at
191 each (the other 4 are the gradient pair plus scrims, on `*`).

### Generated outputs (never hand-edit)
- `src/tokens/brand.ts` · `alias.ts` · `mapped.ts` · `responsive.ts` · `typography.ts` · `gradients.ts` · `shadows.ts` · `index.ts`
- `src/styles/globals.css` — all CSS custom properties (brand → alias → mapped → spacing → responsive font)
- `src/styles/typography.css` — `--font-family-primary` + 22 `.type-*` classes

### Cascade contract
`--brand-*` (primitives) → `--alias-*` (semantic colors) → `--mapped-*` (surface/text/icon/border, light + dark)
`--brand-scale-*` (px steps) → `--spacing-*` → consumed by components
`--responsive-font-*` (mobile base + `@media 768px` overrides) → consumed by `.type-*` classes

**Gradients are the one layer with two tiers in the same block — and, since
v1.7.0, the one layer with two declared KINDS.** `build-gradients.mjs` emits:

- `--gradient-default` / `--gradient-subtle` — the literal Figma values, hardcoded
  `#ffffff` stops. Static and theme-blind by design; fine as a constant over a
  known-white surface, wrong as a scrim on a themed page.
- `--mapped-gradient-default` / `--mapped-gradient-subtle` — the same alpha shape
  restated against `var(--gradient-surface)` (which defaults to
  `var(--mapped-surface-page)` and is the supported override point), derived from
  the same source entries so the pairs can't drift. **Use these for anything over
  page surface.**
- `--mapped-gradient-primary-from` / `--mapped-gradient-primary-to` — the two
  ENDPOINTS of a **brand** band: `--mapped-surface-primary-default` and
  `--mapped-surface-information-default`. Each holds **one colour and nothing
  else — no angle, no stop position, no `linear-gradient()` wrapper**. Consume
  them as

  ```css
  background: linear-gradient(
    <angle>,
    var(--mapped-gradient-primary-from) <pos>,
    var(--mapped-gradient-primary-to)   <pos>);
  ```

  There is **no `--gradient-primary-default` counterpart, deliberately** (below).
  *(History: v1.8.0 replaced `--mapped-gradient-primary-default` — a complete
  gradient with a baked-in `0deg` — with `--mapped-gradient-primary-stops`, a
  stop list that still carried `0%`/`100%`. v1.9.0 replaced that in turn with
  this endpoint pair. **This section previously described the -stops token as
  current; it no longer exists.** See the composition note below.)*

**The kind is declared in the token source, never inferred.** Every entry in the
`Gradient` group of `Brand/Value.json` carries `"kind": "scrim" | "brand"`:

| kind | stops written as | each stop resolves to | tiers emitted |
|---|---|---|---|
| `scrim` | literal `#hex` | `var(--gradient-surface)` / `color-mix(…)` | `--gradient-*` **and** `--mapped-gradient-*` |
| `brand` | `{family}` references | `var(--mapped-surface-<family>-default)` | `--mapped-gradient-<base>-from` + `-to` only (one colour each; no angle, no position) |

**Neither the angle (v1.8.0) nor the stop positions (v1.9.0) live in a brand
token. Colour is the contract; angle and position are the consumer's.** Both are
properties of the thing being painted — a header band, a card wash and a progress
fill want different angles AND different stop positions out of the same two brand
colours — while the colours are the brand fact. A token holding either one left a
consumer needing another value no move except restating both colours by hand,
which means reaching past the mapped layer into brand primitives: the exact
bypass this tier exists to close. So `build-gradients.mjs` splits the angle off
on the first comma, then splits the remaining stop list and requires **exactly
two** stops, discarding each stop's position (logging every discard). Both splits
run on the SOURCE value, whose stops are `{family}` references with no nested
parentheses — exact there, and NOT exact after resolution once the values hold
`var(…)` calls. The **source JSON is left untouched**: it keeps Figma's literal
`linear-gradient(0deg, {primary} 0%, {information} 100%)`, so a Token Studio
re-export still matches and the discarding stays a property of the emitter.

`-default` is dropped from the emitted name because a gradient has no
interaction-state axis; the **source key is left as `primary-default`** so a
fresh Token Studio export still matches it, and a collision after that drop is a
hard exit. Scrims keep their wrapper — for them the angle *is* the Figma value
being preserved.

**Do not replace that declaration with a heuristic.** Branching on alpha, on
opacity, or on any other property of the stop values misfiles at least one entry,
because a fully opaque scrim stop is legitimate and `toMappedStop()` maps any
opaque stop to `var(--gradient-surface)`. That is precisely how a brand gradient
would have been mishandled before v1.7.0: it emitted a flat page-coloured band
and **passed the script's own `includes('#')` guard silently**, because that
guard only looked for leftover hex and a fully-converted band has none. The
silent pass was the defect, not merely the wrong output.

That guard is now a per-kind post-condition: any stop the declared kind's
resolver did not consume survives to it and exits 1 — hex left in a `brand`
value, a `{ref}` left in a `scrim` value, or a `{family}` naming a mapped surface
that does not exist. A missing or unrecognised `kind` hard-exits too, matching
`resolveValue()`'s contract in `build-mapped.mjs`. **v1.9.0 added two more brand
exits** — a stop count other than exactly two, and a stop that is not
`{family} [position]` — and re-ran the whole set: **ten paths exercised against a
mutated source copy, all ten exit 1.** (Missing `kind`, unknown `kind`, hex in a
`brand` value, a `{ref}` in a `scrim` value, an unknown `{family}`, three stops,
one stop, a non-`{family}` stop, a post-`-default` name collision, and a value
that is not `linear-gradient(`.)

One correction from that run, recorded because the old text implied otherwise:
**hex in a `brand` value no longer reaches `assertResolved()`.** It now trips the
earlier stop-shape exit, because `#ff0000 0%` is not `{family} [position]`. Same
exit code, different guard — do not assume the leftover-hex check is what catches
it. Two further guards (a surviving `linear-gradient(` wrapper, and a bare comma
inside a single endpoint) are **not reachable from source data at all** and were
not exercised: they are defence-in-depth against a future refactor of the split,
and saying they were tested would be false.

**`kind` is a Monarch-local key that Token Studio does not know about**, so a
fresh export will drop it. That is survivable *only* because a missing `kind` is
a hard exit rather than a default — the build breaks loudly instead of silently
refiling every brand gradient as a scrim. Re-apply it by hand after any
re-export, the same way `Mapped/Dark.json`'s repairs are maintained.

**Why a brand gradient gets no static `--gradient-*` tier.** That tier exists to
preserve Figma's literal white scrim values. A brand band has no literal identity
worth preserving, and emitting one would publish a hardcoded, theme-blind hex
pair — i.e. a *sanctioned* way to bypass the mapped layer, which is the exact
violation that composing from mapped tokens was meant to close. The omission is
enforced in `gradients.ts` as well: under `as const`,
`gradients['primary-default'].var` is a compile error, so the type system says
the same thing the CSS does.

`--gradient-surface` is declared once in `:root`; the `--mapped-gradient-*`
entries are declared on `*`, not `:root`, and that is load-bearing — a custom
property that references another is substituted where it is DECLARED, so a
`:root` declaration bakes in `:root`'s `--gradient-surface` and any override
further down does nothing. **This paragraph used to say the gradients were
"declared once in `:root`"; that was already stale before the brand kind existed
and is corrected here.**

Neither tier gets a `[data-theme="dark"]` block, which looks like the dark-mode
omission this file warns about elsewhere but isn't. For the scrims:
`--mapped-surface-page` already flips in the mapped layer, so they re-resolve per
theme automatically. Verified: white→white·0.5 in light, black→black·0.5 in dark.
For the brand band the reason is different — v1.7.0 ruled hue surfaces
theme-invariant, so both its stops are the same colour in both themes. Either way
a second block would only be a redundant place to drift.

Measured from the *regenerated* CSS, both themes, resolving the full `var()`
chain: `--mapped-gradient-primary-from` `#0358cc`, `--mapped-gradient-primary-to`
`#006789`, with `--mapped-text-primary-on-color` (`#ffffff`) at CR **6.42** on the
`from` endpoint and **6.36** on the `to` endpoint. **Worst case 6.36, at `to`** —
AA at every size. Do not re-derive this by sampling a midpoint: that flatters the
figure to 6.43 and hides the true worst point, which is an endpoint. The recorded
6.34 predates this measurement and is superseded. *(v1.9.0 restated this in terms
of the two endpoint tokens; the previous wording said "at 0%" / "at 100%", which
now names positions the tokens no longer carry. The colours and the figures are
unchanged.)*

They are emitted by `build-gradients.mjs` rather than `build-mapped.mjs` because
that script's `resolveValue()` accepts only `#hex` or `{Group.Step}` and hard-exits
on anything else — and there is no `Gradient` group in `Mapped/Light.json` /
`Dark.json` to carry them. Adding one would mean inventing mapped-JSON entries that
mirror no Figma variable.

Never flatten alias chains to hardcoded values. Always emit `var(--x)` references.

## Session start — non-negotiables

Four rules that nothing in the tooling enforces. Each was learned the
expensive way; the cost is recorded so none of them reads as ceremony.

1. **Read the newest `MONARCH-CHAT-HANDOFF-MMDDYYYY.md` before doing anything
   else.** There are 12+ at repo root and the filename gives no ordering hint
   — `MMDDYYYY` does not sort chronologically, so "last alphabetically" is the
   wrong file. Sort by date *content*, not by name.

2. **No visible scrollbars anywhere, ever — hide the bar, never the
   scrolling.** `scrollbar-width: none` + `-ms-overflow-style: none` +
   `::-webkit-scrollbar { display: none }`, with `overflow-y: auto` retained.
   Keyboard access must survive the bar being hidden and must be *verified*
   after it is (axe's `scrollable-region-focusable`). `.mvp-home__carousel` is
   the cautionary case: hiding the affordance left a region no keyboard user
   could reach.

3. **The local Figma MCP reads ONLY the active desktop tab.** A `whoami`
   round-trip proves the *connection*, **not the document**. Proven both
   directions this week: with the DS file active, `159:1856` resolved and the
   flows node returned "no node could be found"; after Teku switched tabs, the
   flows node resolved and the DS node did not. Before trusting any read,
   confirm which document is active — `get_metadata` with no `nodeId` returns
   the page list, which identifies the file.

4. **Re-verify HEAD after any git action Teku takes during a live session.**
   A Sourcetree merge or checkout moves this working directory mid-session.
   Session-start verification is not enough. This week an entire built batch
   was found sitting uncommitted on `main` — discovered only because a test
   count was arithmetically impossible (456 against a 431 baseline reconciles
   only if `Sheet` is in the tree, which it could not be on a branch cut
   before the merge). In Sourcetree it looked completely normal.

## Structure

Verified against disk 2026-08-07. **The showcase moved out of `src/` during
Phase 2** — `src/main.tsx` and `src/App.tsx` no longer exist, and looking for
them has already cost a fresh session a failed read.

```
design-tokens/          # JSON exports from Token Studio (source of truth)
scripts/                # one build script per token layer
docs/
  component-tokens.md   # the per-component token record
showcase/               # the showcase app — NOT part of the published package
  main.tsx              # entry — imports fonts + typography.css + App
  App.tsx               # Foundations + Components tabs, SIDEBAR_CATEGORIES
  AppShell.css          # shell chrome (.app-main > div supplies the width cap)
  Section.tsx           # the section wrapper all Components entries use
src/
  index.ts              # the PACKAGE BARREL — every public export
  tokens/               # generated .ts files + index.ts
  styles/
    globals.css         # all CSS vars (brand, alias, mapped, spacing, responsive)
    typography.css      # font-family var + 22 .type-* composite classes
    package.css         # source-level equivalent of dist/index.css —
                        #   HAND-MAINTAINED, one @import per component CSS file
  components/<Name>/    # 50 component folders
  test/                 # vitest setup + type shims (setup.ts, *.d.ts)
```

Two of these bite silently if forgotten when adding a component:
**`src/index.ts`** (omit it and the package has no export — `tsc -b` catches it,
the test suite does not) and **`src/styles/package.css`** (omit it and the
component ships with no CSS, with no error at all).

**A third thing bites silently, and it lives in `showcase/`, not `src/`
(Gate 31, 2026-08-27).** `showcase/App.tsx` consumed the token maps through casts
shaped `Object.entries(gradients) as [string, GradientToken][]`, where
`GradientToken` was a **hand-written local union** restating the token shape
instead of deriving it. The cast ASSERTS the shape, so a rename in
`src/tokens/*.ts` type-checked clean and blanked at runtime — this is how
`GradientCard` shipped broken on `main` for a full version.

**The showcase was already in the type-check graph. That was never the hole.**
`tsconfig.app.json` reads `"include": ["src", "showcase"]`, and
`tsc -p tsconfig.app.json --listFiles` lists all three showcase files
(`App.tsx`, `main.tsx`, `Section.tsx`). CI’s `npx tsc -b` has always covered
them. **No change to `ci.yml` or to any tsconfig was needed, and none was made.**
The cast alone suppressed the error inside a file that was being checked.

Demonstrated in both directions with one scratch rename
(`fromVar` to `startVar` in `src/tokens/gradients.ts`):

| showcase revision | `npx tsc -b --force` |
|---|---|
| with the cast (pre-fix) | **exit 0** — the rename is invisible |
| with the derived type | **exit 2** — four `TS2339`, all in `showcase/App.tsx` |

Fixed by deriving from the source of truth —
`type GradientToken = Gradients[keyof Gradients]` and
`type ShadowToken = Shadows[keyof Shadows]` — with both casts removed.
`Gradients` and `Shadows` were already exported through `src/tokens/index.ts` and
the package barrel, so no new export was required. `build:lib` still does not
compile the showcase (`entry: src/index.ts`, dts `include: ["src"]`), which is
correct and was left alone.

**Gate 31 left three more casts of the same family unfixed; Gate 40 closed two
of them and found a fourth Gate 31 had never named.** All are in
`showcase/App.tsx`. **They are identified here by symbol and enclosing function,
never by line number** — Gate 31 recorded them as `:178` / `:452` / `:457`, and
by Gate 40 the same three casts sat at `:195` / `:469` / `:474` without anyone
touching them. A line number in this file is a figure that goes stale on the
next edit anywhere above it.

| cast | where | Gate 40 |
|---|---|---|
| `Object.entries(mapped)` | `allEntries`, inside `buildMappedTree()` | **fixed** — now `Mapped[keyof Mapped]` |
| `varName as string` | the `.map()` return inside `buildMappedTree()` | **fixed** — cast removed |
| `Object.entries(alias)` | `aliasGroups`, module scope, "Data assembly" | **fixed** — now `AliasGroup = Alias[keyof Alias]` |
| `Object.entries(brand)` | the `brandScales` / `brandFoundations` loop, module scope, "Data assembly" | **still open** |

**`varName as string` is the fourth cast, and Gate 31 missed it.** It sits
directly downstream of the `mapped` cast, inside the same function, and
re-asserts exactly what deriving the type upstream starts checking. Fixing the
`Object.entries(mapped)` cast alone would have been **cosmetic** — the derived
type would have been laundered straight back to `string` one statement later.
When removing a cast of this family, look for a second one on the value it
produces.

**The `brand` cast remains the real hazard, and is still the one worth a
follow-up.** It is the only one of the four over a genuinely heterogeneous
object — `brand` mixes colour-scale groups of strings with a `Scale` group of
**numbers** — and it is followed by a *second* unchecked
`group as Record<string, string>` on each entry. The other three were widenings
over uniformly-typed maps; this one asserts a shape that is actually false for
part of the object, so deriving it is a real refactor rather than a type swap.
Out of scope at Gate 40, whose brief named the two lower-risk casts.

## Commands
- `npm run dev` — local dev server
- `npm run check:css-registration` — the registration detector (below)

### The registration detector (Gate 34, v1.12.0)

```
npm run check:css-registration
```

`scripts/check-css-registration.mjs`. Exit 0 with a `✓` line, exit 1 with
`ERROR:` lines naming every offending file — the same convention the seven
`build-*.mjs` scripts use.

**It catches**: a component `.css` file on disk that is NOT reachable from
`src/styles/package.css`, and an `@import` in that graph whose target does not
exist. That is the silent failure — a component missing from the graph compiles,
tests green, and renders correctly in the showcase (its own `.tsx` imports its
own CSS), then ships to the consumer with no styles and no error anywhere.
`Badge` sat in that state for four releases, reproducing `ElementWrapper`'s
original failure mode; parity had been re-derived **by hand** at every release
since. This replaces the hand derivation.

Two properties are deliberate and should survive any rewrite:

- **The component list comes from the filesystem, never from an array in the
  script.** A detector you have to remember to update is the same failure class
  it guards against.
- **Reachability is computed by resolving the `@import` graph transitively**,
  not by pattern-matching `package.css`'s text. Proven at Gate 34: routing
  `CardBalance.css` through an intermediate index file leaves zero textual
  matches in `package.css`, and the detector still exits 0.

**It does NOT catch**, and these are the gaps to keep in mind:

- A component with **no `.css` file at all** — styled through inline `style={{}}`
  objects, invisible to every CSS audit here. Reported as a `NOTE`, never a
  failure, because `Icon` legitimately has none (it delegates all styling to
  `ElementWrapper`). **Read the notes.**
- A component whose own `.tsx` does not import its CSS. That breaks the showcase,
  not the package.
- Missing registration in `src/index.ts` — `tsc -b` already fails on that.
- Rules that are reachable but dead, duplicated, or overridden.
- Anything about `dist/`. It reads source, so it proves the graph Vite is asked
  to follow, not the bytes it emitted. `npm run build:lib` remains the gate on
  the artefact.

**There is no `check-tokens.mjs` and no `lint:tokens` script in this repo**, and
Gate 34 did not add one. Those live in the **MVP** repo; `CHANGELOG.md`'s known
gap #4 records the absence here and the ~36 raw-px findings such a gate would
surface. Do not go looking for them.

## Gate 40 — dependency hygiene and the touch-safe hover guard (v1.16.0)

Nothing a consumer can see changes in this release. No token value moved, no
component API changed, no CSS declaration was rewritten.

### 1 · `npm audit fix` is a NO-OP in this repo. This is a standing warning.

**Do not report an advisory as unfixable because `npm audit fix` did not fix
it, and do not report one as fixed because `npm audit` went quiet.** Both
failure modes were hit at Gate 40 in the same sitting.

`npm audit fix` — with `--dry-run` and in earnest — prints `up to date`, changes
nothing, and then re-lists every advisory it just declined to act on. The
working sequence is:

```
npm update <pkg>...      # rewrites package-lock.json ONLY
rm -rf node_modules
npm ci                   # the step that actually moves what is on disk
```

**`npm update` alone leaves `node_modules` on the vulnerable versions while
`npm audit` reports `found 0 vulnerabilities`.** Audit reads the lockfile, not
the installed tree, so the green reading after step 1 is real about the lockfile
and false about disk. Only after the cold `npm ci` did `require()` on each
package report the fixed version. **Verify the fix by reading
`node_modules/<pkg>/package.json`, never by trusting a clean `npm audit`.**

### 2 · The three advisories

All three high-severity, all **transitive**, all **build-time only**, and none
reaches shipped output — `dist/index.js` contains zero references to any of
them.

| pkg | before → after | path | under |
|---|---|---|---|
| js-yaml | 4.3.0 → **4.3.2** | `vite-plugin-svgr` → `@svgr/core` → `cosmiconfig` → js-yaml | a `dependencies` entry |
| nanoid | 3.3.13 → **3.3.18** | `vite` → `postcss` → nanoid | a `devDependency` |
| postcss | 8.5.15 → **8.5.26** | `vite` → postcss | a `devDependency` |

**No `package.json` dependency entry changed — not one.** Every fixed release
already satisfied the range its existing consumer declares (`cosmiconfig` wants
`^4.1.0`, `postcss` wants `^3.3.12`, `vite` wants `^8.5.3`), so the whole repair
is a lockfile refresh. No direct dependency crossed a major version, which was
the constraint the gate was given. The lockfile diff also picked up an
`engines: { node: ">=24" }` block that had never been synced from
`package.json`; that is metadata, not a dependency change.

### 3 · The touch-safe hover guard

**It lives in `src/test/tokens.test.ts` as `describe('touch-safe hover')`, two
tests, and it runs under `npm test` — CI step 8.** It is **not** part of the
registration detector, which is `scripts/check-css-registration.mjs`, a plain
Node script at **CI step 6** that has no `describe`/`it` and therefore no test
count at all. Those two are easy to conflate and a gate brief has already done
it; they answer different questions and live in different files.

**Why the test file and not the detector.** Both pieces the guard needs already
existed there and were already exercised in CI: `componentCssFiles()` enumerates
`src/components/*/*.css` from the filesystem, and `parseBlocks()` in
`./tokenCss` is a brace-depth scan that already records each rule's enclosing
at-rules as `context`. "Is this rule inside a hover media query" is a direct
read of that field. The detector's job is the **reachability of whole files**,
and it explicitly declares rule-level properties out of scope. Putting this
there would have meant a second CSS parser and a second npm script for a
question the test harness could already answer. `componentCssFiles()` was lifted
to module scope so both checks share one filesystem-derived list.

**Two exemption classes, both load-bearing.**

- **Scrollbar pseudo-elements** (`::-webkit-scrollbar*:hover`). A scrollbar
  thumb is not a touch target and has no hover state to latch after a tap, so
  gating one fixes nothing and reads as noise. None exists under
  `src/components` today; the exemption is there so that adding one is not
  mistaken for a defect. (`showcase/AppShell.css` has one, and is out of scope
  for a different reason — see below.)
- **Prop-driven forced-state rules** (`.mn-<block>--hover`,
  `[data-preview="hover"]`). These are **public API** — `previewState` forces a
  visual state with no pointer involved. Wrapping them in a hover-capable media
  query would make a documented prop silently inert on touch: an API change
  wearing a bug fix's clothes. This is the hazard Gate 37 had to split 23 rules
  to avoid, so the second test asserts the *opposite* direction — that no
  forced-state rule has been gated.

**Scope is `src/components` only.** `showcase/AppShell.css` carries one genuine
ungated element hover (`.app-sidebar__item:hover`) plus the scrollbar-thumb one,
and is deliberately excluded: `showcase/` is not in the published package
(`vite.config.lib.ts` builds `src/index.ts`, dts `include: ["src"]`), so no
consumer can reach it.

**Measured from disk at Gate 40, across all 58 component CSS files: 39 `:hover`
rules, all 39 gated, 0 ungated, in 17 files.** Gate 37's figures reproduce
exactly. The guard therefore starts green over a real population rather than
vacuously, and asserts a floor on that population so it cannot pass by finding
nothing.

**⚠️ Two of Gate 37's "verified live" figures are inflated 2×, and the cause is
already documented in this file.** Re-measured from source at Gate 40:

| | Gate 37 recorded ("verified live") | measured from source, Gate 40 |
|---|---|---|
| forced-state rules | 52, 0 gated | **26 rules** (34 selectors), 0 gated, in 12 files |
| `:focus-visible` rules | 60, 0 gated | **30 rules**, 0 gated |

Both are exactly double. Known open items records that **every component CSS
rule is present TWICE in the dev CSSOM** — the component's own `import` and
`package.css`'s `@import` chain both load it — and Gate 37 measured those two in
the live showcase. The conclusions Gate 37 drew are unaffected (0 gated is 0
gated either way); only the counts are. **A rule census taken from the dev CSSOM
must be halved, or taken from source instead.**

### 4 · Both negative controls, observed failing

A guard never seen failing is not known to work. Each mutation was applied to a
real component file, the suite re-run, exit 1 confirmed, the file restored, and
`git status` checked clean before continuing.

| control | mutation | result |
|---|---|---|
| ungated `:hover` | appended `.mn-btn--gate40-probe:hover` to `Button.css` | **exit 1** — named `Button/Button.css: .mn-btn--gate40-probe:hover` |
| wrongly-gated forced state | wrapped `Field.css`'s `.mn-field--standard.mn-field--hover:not(…)` rule in `@media (hover: hover)` | **exit 1** — named `Field/Field.css: .mn-field--standard.mn-field--hover:not(…)` |

**Do NOT try to verify this guard by emulating a touch device and pointing at a
component.** Gate 37 measured that and it proves nothing: the reading is
identical with the guard removed, because the harness's pointer action never
produces a `:hover` match under Chrome touch emulation. A deliberately ungated
rule is the control that works.

### 5 · `CardFeaturesAndEducation.sizing` is covered

The component that **established** the `sizing` prop (v1.5.0) carried zero tests
for it, while `CardBalance`'s later copy of the same prop was covered at Gate 32.
**12 tests added, 9 → 21**, mirroring the `CardBalance` suite deliberately —
the prop's whole rationale is that both components share one shape, so the tests
should be comparable too. One case has no `CardBalance` counterpart: a
variant × sizing matrix, because this component composes a variant modifier into
the same class string and `fill` therefore has a neighbour it must not displace
or reorder.

**Mutation-proven:** renaming the emitted modifier fails **8 of the 12**. The 4
survivors are the omitted-prop and explicit-`'fixed'` no-change proofs, which
that mutation correctly does not touch — a fill-modifier rename must not change
what the default composes.

### 6 · Gate 31's cast follow-up, closed for three of four

See Structure above for the table and for why the `brand` cast is still open.
Two casts were named by Gate 31's brief; a **fourth** (`varName as string`) was
found downstream of the first, inside the same function, and would have made
fixing the first purely cosmetic.

Proven load-bearing in **both directions** with one scratch mutation of the
token sources (`mapped['text-on-color-heading']` set to `42`,
`alias.Primary[50]` set to `99`):

| showcase revision | mutated token sources | `npx tsc -b --force` |
|---|---|---|
| with the casts | as above | **exit 0** — the mutation is invisible |
| with the derived types | as above | **exit 2** — `TS2345` + `TS2322`, both in `showcase/App.tsx` |

This is the same demonstration Gate 31 ran for `GradientToken`/`ShadowToken`,
and it is the only thing that distinguishes a real fix here from a cosmetic
one. Token sources were restored afterwards and `src/tokens` verified clean.

## Gate 62 — InlineMessage, photo_camera, G31; warning/subtle text measured (v2.4.0)

Four gaps the MVP had routed around for four gates, plus its register entry
G31. Branch `gate62` off `main` at `586c859`. Release notes in `CHANGELOG.md`
v2.4.0; component detail in `docs/component-tokens.md`.

### 0 · RULING: colours are used EXACTLY as designed in Figma. Standing.

**Teku, Gate 62: "Use colors exactly as i designed in figma, they already have
tokens."** A token's value is Figma's. **Never hand-edit a value in
`design-tokens/**` to fix contrast** — measure it, report it, and leave the
change to Figma. This supersedes, for new work, the hand-edit practice Gate 36
used on `text.primary` (that edit stays where it is; this ruling does not undo
it).

An earlier draft of this gate re-bound `--mapped-text-warning-default` in both
mapped JSONs (light 500 → 800, dark 600 → 300, plus hover/pressed) and added a
contrast test asserting the new values. **Both were reverted on this ruling**:
`design-tokens/**`, `globals.css`, every `src/tokens/*.ts` and
`src/test/tokens.test.ts` are byte-identical to v2.3.0. **v2.4.0 changes no
token value.**

### 1 · `--mapped-text-warning-default` is a TEXT token. Its Figma value fails AA.

Of the three diagnoses the brief offered — wrong value, a fill/accent token
misused as text, or a mapping picking the wrong source — the evidence says it is
a text token, and the mapping is faithful:

- **Declared as text.** `text.Warning.default` in both
  `design-tokens/Mapped/Light.json` and `Dark.json`, inside the `text` group,
  beside its own `on-color` sibling (the member meant for fills). Figma scopes
  carry no signal: all 191 mapped tokens are `ALL_SCOPES`.
- **Mapping faithful.** Source `{Warning.500}` light / `{Warning.600}` dark
  emits `var(--alias-warning-500)` / `-600` exactly.
- **It shares its step with icon and border.** `text-`, `icon-` and
  `border-warning-default` bind the same step in both themes — the pattern Gate
  36 found on `text-primary`. Whether that is intended is a design question, and
  under §0 it is answered in Figma.

**Measured at the Figma value, every surface, both themes.** ⁽ⁿ⁾ marks a ground
on which body text (`--mapped-text-default-default`) also fails — in dark, no
text token in the system clears 4.5 on every surface.

| surface | light ground | ratio | dark ground | ratio | class |
|---|---|---|---|---|---|
| `primary-default` | #0358cc | ❌ 2.74 | #0358cc | ❌ 1.79 | hue fill |
| `primary-default-hover` | #024299 | ❌ 4.00 | #024299 | ❌ 2.61 | hue fill |
| `primary-default-subtle` | #ffffff | ❌ 2.34 | #000000 | 5.86 | neutral ground |
| `primary-default-subtle-hover` | #f9f9f9 | ❌ 2.22 | #262626 | ❌ 4.22 | neutral ground |
| `primary-default-pressed` | #022c66 | 5.77 | #022c66 | ❌ 3.77 | hue fill |
| `primary-default-subtle-pressed` | #e5e5e5 | ❌ 1.86 | #4c4c4c | ❌ 2.40 | neutral ground |
| `primary-default-subtle-selected` | #f2f2f2 | ❌ 2.09 | #262626 | ❌ 4.22 | neutral ground |
| `page` | #ffffff | ❌ 2.34 | #000000 | 5.86 | neutral ground |
| `page-secondary` | #f9f9f9 | ❌ 2.22 | #262626 | ❌ 4.22 | neutral ground |
| `subtle-default` | #f2f2f2 | ❌ 2.09 | #262626 | ❌ 4.22 | neutral ground |
| `subtle-hover` | #e5e5e5 | ❌ 1.86 | #4c4c4c | ❌ 2.40 | neutral ground |
| `subtle-pressed` | #d7d7d7 | ❌ 1.63 | #717171 | ❌ 1.36 ⁽ⁿ⁾ | neutral ground |
| `error-default` | #bc3f42 | ❌ 2.29 | #bc3f42 | ❌ 1.49 | hue fill |
| `error-default-hover` | #8d2f31 | ❌ 3.48 | #8d2f31 | ❌ 2.27 | hue fill |
| `error-default-pressed` | #5e2021 | 5.27 | #5e2021 | ❌ 3.44 | hue fill |
| `information-default` | #006789 | ❌ 2.72 | #006789 | ❌ 1.77 | hue fill |
| `information-default-hover` | #00455c | ❌ 4.48 | #00455c | ❌ 2.92 | hue fill |
| `information-default-pressed` | #00222e | 7.08 | #00222e | 4.62 | hue fill |
| `warning-default` | #99532b | ❌ 2.48 | #99532b | ❌ 1.61 | hue fill |
| `warning-default-hover` | #66371c | ❌ 4.22 | #66371c | ❌ 2.75 | hue fill |
| `warning-default-pressed` | #331c0e | 6.84 | #331c0e | ❌ 4.46 | hue fill |
| `success-default` | #226e3a | ❌ 2.67 | #226e3a | ❌ 1.74 | hue fill |
| `success-default-hover` | #164a26 | ❌ 4.40 | #164a26 | ❌ 2.87 | hue fill |
| `success-default-pressed` | #0b2513 | 6.97 | #0b2513 | 4.55 | hue fill |
| `disabled-default` | #f9f9f9 | ❌ 2.22 | #262626 | ❌ 4.22 | neutral ground |
| `interactive-default` | #5e4db2 | ❌ 2.82 | #5e4db2 | ❌ 1.84 | hue fill |
| `interactive-default-hover` | #4b3e8e | ❌ 3.77 | #4b3e8e | ❌ 2.46 | hue fill |
| `interactive-default-pressed` | #382e6b | 5.07 | #382e6b | ❌ 3.31 | hue fill |
| `interactive-on-color` | #ffffff | ❌ 2.34 | #ffffff | ❌ 3.59 ⁽ⁿ⁾ | neutral ground |
| `interactive-on-color-hover` | #f2f2f2 | ❌ 2.09 | #e7eaed | ❌ 2.97 ⁽ⁿ⁾ | neutral ground |
| `interactive-on-color-pressed` | #e5e5e5 | ❌ 1.86 | #cfd5dc | ❌ 2.43 ⁽ⁿ⁾ | neutral ground |
| `default-default` | #e5e5e5 | ❌ 1.86 | #4c4c4c | ❌ 2.40 | neutral ground |
| `default-hover` | #cacaca | ❌ 1.43 | #717171 | ❌ 1.36 ⁽ⁿ⁾ | neutral ground |
| `default-pressed` | #bdbdbd | ❌ 1.24 | #979797 | ❌ 1.23 ⁽ⁿ⁾ | neutral ground |
| `subtlest-default` | #f9f9f9 | ❌ 2.22 | #131313 | 5.18 | neutral ground |
| `subtlest-hover` | #ececec | ❌ 1.98 | #262626 | ❌ 4.22 | neutral ground |
| `subtlest-pressed` | #e5e5e5 | ❌ 1.86 | #4c4c4c | ❌ 2.40 | neutral ground |
| `elevation-default` | #ffffff | ❌ 2.34 | #262626 | ❌ 4.22 | neutral ground |
| `elevation-hover` | #e5e5e5 | ❌ 1.86 | #4c4c4c | ❌ 2.40 | neutral ground |
| `elevation-pressed` | #d7d7d7 | ❌ 1.63 | #717171 | ❌ 1.36 ⁽ⁿ⁾ | neutral ground |
| `overlay-*` (3), `alpha-*` (3) | translucent | — | translucent | — | backdrop-dependent |

**Summary.** Light: fails all 22 neutral grounds (best **2.34** on white,
**2.22** on subtlest). Dark: fails 12 of the 15 neutral grounds body text
passes on — **4.22** on the `#262626` card surfaces — and passes only on black
(5.86) and subtlest `#131313` (5.18). **No component in this repo or the MVP
consumed the token before this gate** (grep: zero declarations; the MVP has one
comment), so its first rendered consumer is `InlineMessage`'s warning title (§3).

> **Correction (Gate 62b, 2026-09-22):** that consumer was removed. The warning
> title now takes `--mapped-text-default-default`, so once again no component
> consumes `--mapped-text-warning-default` (grep over `src/components`: zero
> declarations). The diagnosis above is unchanged and still stands.

### 2 · Subtle text on subtlest — reproduced, left at the Figma value

`--mapped-text-subtle-default` (slate-600 `#6b7786`) on
`--mapped-surface-subtlest-default` (`#f9f9f9`) is **4.3285** in light — the
reported 4.33 reproduces. The scope is wider than reported: **subtle text fails
18 of the 22 light neutral grounds** and passes only on pure white (4.5572).
Reach if Figma moves it: **42 declarations in 27 component CSS files**
(`CardDataDisplay`'s info line is this exact failing pair, inside the DS), plus
the MVP. For reference, the next ramp step (slate-700) would pass 20 of 22 but
shrink default:subtle separation from 2.446 to 1.568. Not changed, per §0.

### 3 · `InlineMessage` — built from the MVP's advisory, not copied

No Figma node exists; `ReceiptAdvisory.tsx` was read as the requirements
document, and nothing finance-specific crossed (copy, retake-label logic, the
photo/PDF noun switch, a hardcoded `Button`). Tones `neutral` | `warning` — the
two the MVP has needed. The title takes its tone's own text token at the Figma
value; the body is default text, because subtle text fails on the component's
own surface (§2). `role="group"` named by the title; **no live region**; never
takes focus, hides nothing, inerts nothing — three tests, one per failure mode,
each mutation-proven. Registered in `src/index.ts` and `package.css` (detector
60/60). The checkpoint's Figma-read step had no source to read — the Figma MCP
servers also failed to connect this session — and that is recorded in the docs
entry rather than skipped silently.

> **Correction (Gate 62b, 2026-09-22):** "The title takes its tone's own text
> token" is no longer true. Tone never changes text colour. Title and body take
> `--mapped-text-default-default` in every tone, and the warning tone is carried
> by `--mapped-border-warning-default` on the frame plus a leading `warning`
> glyph in `--mapped-icon-warning-default`. See Gate 62b below.

**Rendered in the showcase with `getComputedStyle`, rendered = computed:**
neutral title and body 10.5857 light / 12.5674 dark. **Warning title at the
Figma value: `#ff8a47` on `#f9f9f9` = 2.2216 light — under AA for its 16px
semibold title — and `#cc6e39` on `#131313` = 5.1820 dark.** Reported, not
worked around, per §0.

> **Correction (Gate 62b, 2026-09-22):** the orange warning title was removed.
> Measured the same way, the warning title now equals neutral's: 10.5857 light
> and 12.5674 dark. The two figures above now describe the warning **border and
> glyph** (the same token step, the same grounds), judged against 3.0:1, not
> 4.5:1.

### 4 · `photo_camera` and G31

**`photo_camera`** — Material Round, measured against its neighbours: same
`0 0 24 24` viewBox, no own fill, same `ElementWrapper` path (20×20 at `m` in a
`Button`, like every `m` glyph). **Registry 106 → 107**, by parser. The docs
note calling 106 "re-derived at Gate 45" is misattributed: the same parser reads
**103** at Gate 45's commit `67220d4` and 106 at Gate 50's `586c859`.

**G31 — IN SCOPE AND CLOSED, for BOTH overlays.** The registration lives in the
**MVP** (`MONARCH-MVP-DS-GAP-REGISTER.md`, "G31 is OPENED"), not in this repo —
grep here finds nothing — and it names `Sheet` **and `Modal`**. The fix was the
smallest item in the gate: deps `[isOpen, onClose]` → `[isOpen]`, Escape reads a
ref synced in a layout effect. No API change. Six tests. **The obvious test was
worthless** and would have passed against the bug: the old teardown focused the
opener and the re-run immediately refocused the dialog, so `activeElement` ended
correct. The tests assert the opener's **focus events** instead. The MVP's
`useCallback` mitigations become redundant but harmless — removing them is
Gate 63's, not this gate's.

### 5 · Observed, not fixed

- `--mapped-text-success-default` / `-information-default`: **2.56 / 2.61** on
  white in light. `--mapped-text-error-default`: 4.16 on dark elevation.
- `--mapped-icon-warning-default` / `border-warning-default`: **2.34** on white,
  under the 3.0 non-text threshold.
- **`CHANGELOG.md` has no v2.3.0 entry** (nor v2.1.0). Noted in v2.4.0, not
  back-filled.
- The roster paragraph's "61 test files / 542 tests" was already stale at HEAD
  (**61 / 558** measured at Phase 0). After Gate 62: **62 / 579**.

### 6 · Counts

| | predicted before the first edit | final, after the §0 revert |
|---|---|---|
| test files | 61 → 62 | **62** |
| tests | 558 + 23 = 581 (tokens 2, Icon 2, InlineMessage 13, Sheet 3, Modal 3) | **579** — the 2 token tests left with the revert; 581 was measured before it |
| visual baselines | none exist in this repo → 0 | **0** |
| generated files | `globals.css` 6 lines, all else identical | **all byte-identical to v2.3.0** |
| component CSS files | 59 → 60, all registered | **60/60** |

**Mutation proofs run exactly ONE test by title** (`-t`, file named): exit 1
mutated, file restored and re-hashed identical, exit 0 restored. InlineMessage
focus, dialog semantics and sibling operability; Sheet and Modal deps and stale
Escape; `photo_camera` registration.

**⚠️ The first proof run was invalid, and its own output said so.** Under
`spawnSync(..., { shell: true })` on Windows the `-t` title was not quoted, so
it split on spaces: vitest matched on the first word and treated the rest as
file filters, and the "one test" runs reported e.g. `1 failed | 8 passed`. The
exit codes were right and the proofs were still worthless. **Read the count
line of a mutation run, not just its exit code.**

**Tooling hazard on this machine:** from Git Bash, `node -e '...'` with `\n` in
a string literal, and `sed` with backslash patterns, silently fail to match —
the edit reports success and changes nothing. Several working copies here are
CRLF (autocrlf smudge) while others are LF, so a pattern with a bare `\n` also
misses on the CRLF ones. Use the Edit tool or a `.mjs` file with `\r?\n`, and
confirm every scripted edit with `git diff`.

## Gate 62b — InlineMessage tone carried by the container, not the text

This amends Gate 62's `InlineMessage` on branch `gate62`, built from `dc73367`
(parent `586c859`, `v2.3.0`). The CHANGELOG entry is under **Unreleased**, and
§1 explains why. The Gate 62 section above is left as written; where it is now
wrong, a dated correction sits beneath the affected line.

> **Correction (Gate 62b finish, 2026-09-22):** the CHANGELOG entry is no longer
> under **Unreleased**. It is now headed `## v2.4.1`. See §7.

### 0 · Standing rulings — both govern all future work

- **Ruling A (Teku, 2026-09-21):** "Use colors exactly as I designed in Figma,
  they already have tokens." Token values come only from Teku's Figma. Never edit
  `design-tokens/**` and never hand-adjust a generated token file. When a token
  fails a measurement, measure it and report it; do not change it. (This restates
  Gate 62 §0 as a standing rule.)
- **Ruling B (Teku, 2026-09-21):** where Teku did not design something in
  Figma, the review thread's judgement applies instead of guessing at his intent.
  `InlineMessage` has no Figma node, so its tone treatment is the review thread's
  ruling: **tone never changes text colour.** It is carried by the container and
  the icon, following the category standard (GitHub Primer's flash, Atlassian's
  section message).

### 1 · The brief's premise that v2.4.0 was untagged was false

At session start `v2.4.0` was already an **annotated tag on `dc73367`**
(2026-09-21 23:55:45), and it is **on `origin`**. `main` had been fast-forwarded
to `dc73367` and pushed, and the checked-out branch was `main`, not `gate62`.
`gate62`, `origin/gate62`, `main` and `origin/main` all pointed at the same
commit, so switching to `gate62` changed no files. The consequence: this change
cannot sit inside a released v2.4.0 without re-cutting a pushed tag. The version
field was left at `2.4.0`, untouched. The release notes are in an unversioned
CHANGELOG entry and the released v2.4.0 notes were not edited. **2.4.1 or a
re-cut v2.4.0 is Teku's call.** Until that call is made, the tree's version field
matches the tag but its `InlineMessage` does not. This is the same gap between
the tag and the tree that Release hygiene warns about, so run the STANDING CHECK
before any tag is cut.

> **Correction (Gate 62b finish, 2026-09-22):** the call has been made. This
> change ships as **v2.4.1**, the version field reads `2.4.1`, and the CHANGELOG
> entry is versioned. v2.4.0 was not re-cut. See §7.

### 2 · What each tone rendered, before and after

| | Gate 62 | Gate 62b |
|---|---|---|
| neutral, framed | subtlest fill, subtlest border, no glyph | **unchanged** |
| neutral, unframed | text only | **unchanged** |
| warning, framed | **identical frame to neutral**; orange title | default-text title; `--mapped-border-warning-default` border; `warning` glyph |
| warning, unframed | text only, orange title | default-text title; `warning` glyph (its only non-text signal) |

At Gate 62 the only difference between the tones was the title's colour. Once
that was removed, the unframed warning would have looked the same as an unframed
neutral message. That is what made a glyph mandatory rather than optional.

### 3 · Tokens bound, and the glyph

- `--mapped-border-warning-default`: `border.warning.default`, `{Warning.500}`
  light / `{Warning.600}` dark.
- `--mapped-icon-warning-default`: `icon.Warning.default`, the same steps.
- Both exist in `Mapped/Light.json` **and** `Dark.json`, read from the JSON and
  not from `globals.css`.
- **No warning fill.** The mapped set has no subtle warning surface.
  `surface.warning.default` is `{Warning.700}` in both themes, a hue fill that
  body text cannot sit on. A `color-mix()` tint would be a token-source gap that
  needs approval, and none was requested.
- Registry glyphs that could serve: `warning`, `error` and `info` (all Material
  Round), plus the custom `icon_spending_alert`. **`warning` was chosen** because
  `TOAST_DEFAULT_ICON.warning` already uses it, so both components draw the same
  glyph for the same tone. Size `m`: 20×20, measured.
- Layout: the warning root is a two-column grid with no wrapper element. The
  glyph cell is `--responsive-font-headings-h6-line-height` (24px) tall, so the
  glyph centres on the title's **first** line. Measured on a two-line unframed
  title: glyph top +2px, title 48px tall.

### 4 · Measurements, showcase, `getComputedStyle`, transitions finished, both themes

| | light | dark |
|---|---|---|
| warning title, framed and unframed | `#363c43` on `#f9f9f9` **10.5857** | `#cfd5dc` on `#131313` **12.5674** |
| warning body, framed and unframed | **10.5857** | **12.5674** |
| border vs own surface / vs page | `#ff8a47` **2.2216** ❌ / **2.3390** ❌ | `#cc6e39` **5.1820** / **5.8569** |
| glyph (framed) vs own / vs page | **2.2216** ❌ / **2.3390** ❌ | **5.1820** / **5.8569** |
| glyph (unframed, `#f9f9f9` / `#131313` container) | **2.2216** ❌ | **5.1820** |

All text clears 4.5 in both themes. The light non-text failures (border and
glyph under 3.0) are **recorded, not fixed** under Ruling A. The title's words
carry the meaning at body contrast, so the glyph and border are supplementary
and are not the sole carrier of meaning. Gate 62's 2.34 on white reproduces as
2.3390. The border rendered 0.8px because this pane's `devicePixelRatio` is
1.25; that is not a component property.

### 5 · Tests and proofs

**579 → 584, 62 files**, exactly as predicted before the first edit. All five
new tests are in `InlineMessage.test.tsx`:

- **The text-colour guard (1 test).** Title and body colour for warning equal
  neutral's, in both `isFramed` states. The CSS is read statically because jsdom
  applies no stylesheet: the winning declaration is found by class-count
  specificity, then source order.
- **The frame (1 test).** The framed warning border binds
  `--mapped-border-warning-default`, and neutral keeps subtlest.
- **The glyph (2 tests, `it.each` over `isFramed`).** The glyph renders first in
  the root, and its markup equals `<Icon name="warning" size="m" />`.
- **Neutral (1 test).** Neutral renders no glyph.

**One existing test was modified.** "carries no dialog semantics and hides
nothing around it" queried every `[aria-hidden="true"]`, and the glyph's `<svg>`
(which `Icon` marks `aria-hidden`) would trip it. It now excludes
`.mn-inline-message__icon` and nothing else.

**12 mutation proofs.** Each one: mutate → one test by title → exit 1 → restore
→ sha256 identical → exit 0. All read `1 failed | 17 skipped` and all are
assertion failures. The runner is `node vitest.mjs` spawned with an argument
array: no shell and no `npx`.

- Eight cover the new rules: warning title recoloured, warning body recoloured,
  border reverted, glyph removed ×2, wrong glyph, wrong size, and neutral gaining
  a glyph.
- Gate 62's three `InlineMessage` proofs were re-run because
  `InlineMessage.tsx` changed. The dialog test ran twice, once with an
  `aria-hidden` placed *outside* the glyph, to prove the narrowed query is not
  vacuous.
- Gate 62's other five proofs (Sheet ×2, Modal ×2, `photo_camera`) mutate files
  this gate did not touch. Their validity is derived, not re-run.

### 6 · Tooling hazard, widened

Gate 62 recorded that `node -e` and `sed` silently lose backslashes from Git
Bash. **A QUOTED heredoc (`<<'EOF'`) sent through the agent's Bash tool loses
them too:** each `\\` arrived as `\`, although a quoted heredoc should pass bytes
through verbatim. Measured this gate, in a `.mjs` whose JS template literals
then consumed one more level, a regex meant to reach the test file as
`/\/\*[\s\S]*?\*\//g` arrived as `//*[sS]*?*//g`, and `\s+` arrived as `s+`.
The first surfaced as a parse error. The second parsed and would have been a
silently wrong regex. **Write any file that contains a backslash with the Write
tool**, then grep it for `\`.

### 7 · Versioned as v2.4.1 (Gate 62b finish, 2026-09-22)

**The ruling (review thread): Gate 62b ships as `v2.4.1`.** Two reasons, both
standing:

- **Published tags never move.** `v2.4.0` is annotated (tag object `16beddac`),
  points at `dc73367`, and is on `origin`. Re-cutting it would change what a
  pushed name means for anyone who already fetched it. A correction after a
  release gets a new tag.
- **A visual correction to how an existing component applies existing tokens,
  with no API change, is a patch.** No prop, type, value or default moved, and no
  token value changed. `InlineMessage` only rebinds which existing tokens its
  parts consume and adds a decorative glyph.

What the finishing session changed: `npm version 2.4.1 --no-git-tag-version`
(`package.json` one line; `package-lock.json` both root entries, two lines;
nothing else in either file), the CHANGELOG heading renamed from `Unreleased —
Gate 62b` to `## v2.4.1` (matching `## v2.4.0`, which carries no date), and this
section. No component, test, token or generated file was touched. Nothing in the
repo reads the version field or `CHANGELOG.md`; every grep hit is a comment.

**Process note: Gate 62b ran from a superseded prompt.** The prompt it was given
said v2.4.0 was unreleased; v2.4.0 had already been tagged and pushed. The
session caught that from disk and did not move the tag, but it could only leave
the version open. **Gate prompts now carry a version suffix, and the
latest-dated file is the one to run.** If two prompts for the same gate are on
hand, run the one with the latest date, and still check its premises against
disk, as §1 did.

## Gate 66 — Flow 10 primitives (G35–G38) and the Button error tone (G29), v2.5.0

Built on `main` at `820736e` (`v2.4.1`), left uncommitted. Release notes in
`CHANGELOG.md` v2.5.0; per-component derivation in `docs/component-tokens.md`
(Button "Error tone", ChartLegendItem "`expanded`", CardMonthlyBudget
"`title`, `sizing`, Details name"). This section keeps what a successor needs
and would otherwise re-derive.

### 0 · Figma was read through the REMOTE connector, not the local MCP

The local desktop MCP at `127.0.0.1:3845` refused the connection
(`ECONNREFUSED`, curl exit 7). The claude.ai Figma connector authenticated
(`whoami` → Teku Cheong, `tekucheong@gmail.com`, pro plan) and reads files **by
key**, so it is not subject to non-negotiable 3's active-tab trap: both files
were read in one session with no tab switching. Source A = DS file
`xhA5ARVgSeD3gA41lYDqST`; Source B = `casestudy_02` `v9MI8jxTaXiJA234Hkanlf`.
Source B's `get_metadata` on its `Page 1` (`0:1`) fails with an SSE JSON parse
error (response too large) — Flow 10 and Flow 9 live on page **`Flow for MVP`
(`1266:14164`)**, not `0:1`; Flow 9 is the section `Receipt add and link | 28
Jan 2026` (`1266:14277`).

### 1 · What each primitive IS in Figma — do not re-derive

- **Card title**: plain text in `237:690`, not a property. Both sources:
  `body/caption-semibold`, `text/default/default`. No truncation anywhere.
- **Chart legend expanded**: Source A has **no** expanded variant —
  `list/chart legend` `242:363` is one component, not a set. Source B's
  Groceries row overrides the title+subtitle wrapper **and** the amount to
  `text/Interactive/default` (bound), swaps the glyph to
  `icon_chevron_expand_less`, and leaves the chevron's fill **unbound raw black**.
  The divider around the open row belongs to the screen, not the row.
- **Error button**: the `button` set has no error value or property on any of
  its seven axes. "Delete receipt" (`I1266:14285;1045:11001`) is
  `Type=Tertiary, Size=L, Icon left=True`, label → `text/error/default`, `delete`
  glyph → `icon/error/default`, default state only.

### 2 · Source disagreements, recorded

- **Source B's variable VALUES are stale against this repo.** Its
  `text/error/default` resolves `#eb4f52` (Error.500) where `Mapped/Light.json`
  says `{Error.600}` `#bc3f42`; its `text/primary/default` resolves `#046eff`,
  the pre-Gate-36 value. The binding NAMES agree, so the build binds names and
  takes values from this repo — but a colour read off Source B is not a colour
  this DS renders.
- Source B's legend rows show `font/copy/body/line-height` falling back to 20px
  where Source A shows 24px — the same variable, so nothing was changed.
- The MCP code dump for the "Entertainment" card still prints "Monthly Budget";
  its screenshot shows "Entertainment". Trust the render.

### 3 · Decisions taken inside the brief, each flagged for Teku

1. **`tone`, not a fourth variant.** Figma models the error look as an instance
   override only, which the brief routes to `tone?: 'default' | 'error'`.
2. **Error hover/pressed keep `text/error/default`.** Figma draws no error
   hover/pressed; an override survives a State swap in Figma, so this is the
   reading that invents nothing. `-hover`/`-pressed` error tokens exist and were
   left unused — switching is a one-block change if wanted.
3. **The expanded chevron keeps `--mapped-icon-subtle-default`.** Figma's value
   is unbound raw black; adopting it would be a hex no token carries.
4. **Expanded recolours subtitle and amount too**, not just the title, because
   Figma's override does (Ruling A). The brief named only the title.
5. **`aria-label` for G38** — no visually-hidden utility exists in the DS.
6. **Version bumped with `npm version 2.5.0 --no-git-tag-version`**, not by hand
   as the brief said: Release hygiene above forbids hand-editing it, and the
   result (3 lines across both files) is what a hand edit would have produced.

### 4 · Proofs

Default paths are asserted **byte-identical to v2.4.1 by sha256** of the
rendered markup, hashes captured from the untouched tree before the first edit:
3 `CardMonthlyBudget` renders (with G38's `aria-label` stripped — the one
permitted difference), 3 `ChartLegendItem` renders, 2 `Button` renders.

**Eight mutation proofs, one test each by title**, exit 1 mutated →
restore → sha256 identical → exit 0; every one read `1 failed | N skipped`.
**The first run of one was invalid and its count line said so**: `18 skipped`,
exit 0 — `-t` is a REGEX, and a title containing `(bar the Details
aria-label)` matched nothing. Re-run with a paren-free title, it read
`1 failed | 17 skipped`. **Titles with regex metacharacters cannot be passed to
`-t` verbatim.**

**Test count prediction missed by one, and the miss was the baseline.**
Predicted 51 for the three files; measured 52. `ChartLegendItem.test.tsx` held
**7** tests at v2.4.1, not 6 (the `it.each` over two variants). The additions
were exactly as predicted: 12 + 11 + 11 = 34. Suite: 584 → **618**, 62 files.

### 5 · G3 (report only)

`CardBalance.iconColor` first appears at tag **`v1.3.0`** (absent at `v1.2.0`),
added in commit `364f8ca` ("Gate 2"). Whether that closes G3 as the MVP's
register words it is for the register, which lives in the MVP.

## Gate 68 — amount text that fits its slot (v2.5.1)

Built on `main` at `72f3f2d` (`v2.5.0`), left uncommitted, then amended by a
correction pass the same day (Teku's rulings A and C, §2 and §5). Release notes
in `CHANGELOG.md` v2.5.1. The MVP's formatter always prints two decimals with
grouping (`RM 4,140.33`, `-RM 1,234.56`); the ring and the summary were sized
for Figma's `RM 700`. Patch release: no prop, type, export or token changed.

### 1 · The font the thresholds are derived from — a change invalidates them

`node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2`,
`@fontsource/poppins` **5.2.7**, SHA-256
`f4e80d9dfd374d02989b87a27b5ed4cb78fbb177c27f1478e9a8b0afb7513149`. Read by
parsing the WOFF2 `hmtx`/`cmap` directly (brotli via Node's zlib); the `.woff`
of the same weight agrees glyph for glyph. Advances per 1000 em: `0` 646, `1`
362, `2` 574, `3` 599, **`4` 661**, `5` 644, `6` 640, `7` 548, `8` 643, `9` 626,
`R` 641, `M` 899, space **and** NBSP 238, `,` 254, `.` 260, `-` 583.
`Intl.NumberFormat('en-MY', { style: 'currency' })` emits a **NBSP** after
`RM`, not a space; the MVP builds `RM ` by hand with a space. Same advance, so
both are covered.

**Advance sums are accurate, not strictly conservative.** Measured in the
showcase with the web font loaded, rendered widths exceed the advance sums by
0 to **+0.012px** (layout rounding); no kerning applies between these glyphs
(the font has `GPOS`, but not for these pairs). The tightest margin anywhere
below is 0.08px, so no threshold moves. After a font bump, re-derive, and
re-measure in a browser.

### 2 · The ring ladders and thresholds (`src/components/ProgressRing/amountFit.ts`)

**RULING A (Teku, Gate 68 correction): Figma is the authority for the ring's
resting size.** `235:5710` (medium) draws the amount in **h6**, `235:5712`
(large) in **h5** — the state Teku's trial left the component in. The first
pass of this gate kept v2.5.0's h5 / h4 as the resting step; that was reversed.
Every ring now rests one step smaller than v2.5.0.

| ring | ladder |
|---|---|
| m | `type-header-h6` (rest) → `type-body-m-semibold` (last step) |
| l | `type-header-h5` (rest) → `type-header-h6` (last step) |

The step comes from string LENGTH, never a DOM measurement. Each `maxLength`
is the longest length whose WIDEST en-MY RM string fits the limit — all `4`s,
`Intl`'s commas, `.dd`, with or without `-`, whichever is wider:

| len | widest | units | | len | widest | units |
|---|---|---|---|---|---|---|
| 9 | `RM 444.44` | 5343 | | 12 | `RM 44,444.44` | 6919 |
| 10 | `-RM 444.44` | 5926 | | 13 | `RM 444,444.44` | 7580 |
| 11 | `RM 4,444.44` | 6258 | | 14 | `-RM 444,444.44` | 8163 |

Limit = inner stroke diameter (`0.9 × w − 8`) − 2 × `--brand-scale-100`:
**m 129.8px** (137.8 − 8), **l 182.0px** (190 − 8).

| ring | step | size | fits up to | at that length | one longer |
|---|---|---|---|---|---|
| m | h6 (rest) | 20 | **11** | 125.16 | 138.38 |
| m | body-m-semibold | 16 | 13; takes 12–14 | 121.28 | 130.61 |
| l | h5 (rest) | 24 | **13** | 181.92 | 195.91 |
| l | h6 | 20 | takes 14 | 163.26 | — |

**No step on either ladder has a desktop override**, so every threshold holds
at every viewport. (The first pass had to derive `l`'s h4 at 32px because
`--responsive-font-headings-h4-*` is 28/32 below 768px and 32/40 from 768px
up; with h4 off the ladder that problem is gone. It still governs the `l`
slot height, §3.) `type-body-lg-semibold` is NOT a step: 20px, 600, h6 line
height — identical to `type-header-h6` at every width.

Clearance to the inner edge, re-measured in the showcase on the final tree at
**375 and 1024** (`clientWidth` 375 / 1009, this pane). Both widths agree to
0.01px:

| ring | string | step | each side | floor |
|---|---|---|---|---|
| m | `RM 4,444.44` (widest 11) | h6 | **6.32** | — |
| m | `RM 999,999.99` | body-m-semibold | **10.50** | ≥ 4 ✓ |
| m | `-RM 999,999.99` | body-m-semibold | **5.83** | ≥ 4 ✓ |
| m | `-RM 444,444.44` (widest 14) | body-m-semibold | **3.59** | ≥ 2 ✓ |
| l | `RM 444,444.44` (widest 13) | h5 | **4.04** | — |
| l | `RM 999,999.99` | h5 | **7.40** | ≥ 4 ✓ |
| l | `-RM 999,999.99` | h6 | **16.17** | ≥ 4 ✓ |
| l | `-RM 444,444.44` (widest 14) | h6 | **13.37** | ≥ 2 ✓ |

Before this gate `RM 4,140.33` on `m` rendered 139.69px at h5 — **0.94px into
the stroke on each side, at every viewport**, because the ring is a fixed
162px. The 430px screen was never clean. It now renders 116.40px at h6,
clearing by 10.70.

### 3 · The slot-height rule

`.mn-progress-ring__amount` is a flex box, text centred, with a fixed `height`:
`m` `--responsive-font-headings-h5-line-height` (**28**, Figma's 28px frame);
`l` `--responsive-font-headings-h4-line-height` (**32** below 768px, **40**
from 768px). **Figma's large frame is a raw, unbound 40px; that is h4's line
height at Figma's scale, so the token binding stands** (ruled in the
correction pass). The slot did NOT change when the resting step moved: the
resting step no longer fills it (h6's 24 in 28; h5's 28 in 32 / 40) and is
centred in it, exactly as Figma draws it. Every step's line height fits
inside the slot at both breakpoints (asserted statically).

Measured on the final tree at 375 and 1024: slot 28 (m) / 32 → 40 (l); the
caption's and pill's tops **identical across every step**, both sizes
(m −38 / +14 from the ring centre; l −48 / +16 at 375, −52 / +20 at 1024).
Their LEFT edges vary by 0.008px — and vary identically between two strings at
the SAME step, so it is the content column's width under `translate(-50%)`,
not the step.

**Why the test for this is structural.** jsdom applies no CSS and returns
zero rects, so a `getBoundingClientRect` test would pass against anything.
The suite asserts the two halves it can: the slot's declared height and each
step's line height (static), and that stepping changes nothing in the markup
but the amount's class. The geometry is the browser measurement above.

### 4 · The summary: compact by container query, not by a prop

`CardMonthlyBudget.css` makes the card a named inline-size container and, in
`@container mn-card-monthly-budget (width < 327px)`, sets the body gap to
`--brand-scale-400` and the summary amounts'
`font-size`/`line-height` to `--responsive-font-copy-body-sm-*`.

- **Threshold.** Text room = card − 32 padding − 162 ring − 24 gap − 32 badge
  − 8 gap. `RM 4,444.44` needs 100.128px at 16px, so the card needs
  **≥ 358.128px**. The query takes 359, the next whole pixel, so a 358px card
  (a 390px phone) is compact — at 358 the text would wrap by 0.13px.
- **Content box.** A container query measures the container's CONTENT box.
  The card has 16px side padding, so 359px of card is **327px** in the query.
  Writing `359px` there would be a 32px error.
- **Compact holds 11 characters** (87.61px at 14px) down to a **338px** card;
  measured, 337 wraps. 12+ characters may wrap. The card stayed 208px at
  every width measured (the ring sets the height).
- **Why not a prop.** Option 1 was possible: no raw value is duplicated (both
  values are tokens, and body-sm-semibold differs from body-m-semibold only in
  size and line height), and the Cascade contract governs token tiers, not a
  parent's selectors. The cost is that the card reaches into
  `.mn-summary-item__amount` from `CardMonthlyBudget.css` — the first
  parent-to-child override and the first `@container` in the repo.
  `container-type: inline-size` also zeroes the card's min-content
  contribution: in a shrink-to-fit parent a `fill` card can shrink below its
  content where it used to overflow. The MVP's `.mvp-budget` is a stretch flex
  column, so it is unaffected.
- **Test limits.** jsdom does not evaluate container queries; the tests read
  the condition and the rules statically. The switch at 358/359 and the shared
  size were measured in the showcase.

**DEFERRED — DS round, v2.6.0 (Teku, Gate 68 correction).** In compact the DOM
carries `type-body-m-semibold` while computing body-sm-semibold's size and
line height, so the class on the element and the style it renders disagree.
The fix is a `SummaryItem` size prop (optional, defaulted — a minor release),
which would let the card pass the size down instead of overriding the child's
class. **Not now.**

### 5 · The pill — ruling C: the −0.33px case is ACCEPTED (Teku)

`m` pill: `type-body-caption-semibold`, 8px side padding, 4px gap, 8px radius,
spanning y = +14…+38 below the ring centre; inner radius 68.9px.

| total | pill width | chord at +38 | square-corner overhang | rounded-corner clearance |
|---|---|---|---|---|
| `RM 999,999.99` | 119.41 | 114.95 | 2.23 / side | **+1.12** (clear) |
| `RM 444,444.44` | 122.77 | 114.95 | 3.91 / side | **−0.33** (clips) |

The pill does NOT clip at the literal ceiling; its rounded corner clears.
It clips by 0.33px at the widest 13-character total. **Teku accepted that
case: no mechanism, nothing to fix.** `-` totals are not modelled — a budget
total is positive. The pill does not depend on the amount's step, so the
correction pass left these figures unchanged.

### 6 · Figma, both sources (2026-09-25)

Local MCP: `get_metadata` returned the selection `235:5711` (the
`235:5710`/`235:5712` set), identifying the DS file; `get_design_context` on
it dropped its transport twice. Remote connector by key
`xhA5ARVgSeD3gA41lYDqST` read both rings and `237:690`. Structure agrees.

- **Resting size: reconciled by ruling A** (§2). Figma's h6 / h5 is the code's
  resting step.
- **Large slot:** Figma raw 40px; code the h4 line-height token (32 / 40) —
  ruled to stand (§3).
- Figma's content frame is 118px (medium) / 180px (large) wide, narrower than
  the 129.8/182 limit; text overflows it with `whitespace-nowrap` in Figma.
- Card summary: Figma `flex: 1 0 0`, text `nowrap`; code `flex: 1 1 auto`,
  wraps. Pre-existing, unchanged.

### 7 · Counts

**Tests 618 → 655, files 62 → 63.** The first pass reached 657
(`amountFit.test.ts` 12 new, `ProgressRing.test.tsx` 5 → 25,
`CardMonthlyBudget.test.tsx` 18 → 25). The correction removed two
`amountFit` boundary cases, because the m h5→h6 and l h4→h5 boundaries no
longer exist: `amountFit.test.ts` **10**, the other two files unchanged.

**Tests changed by the correction, none deleted beyond those two cases:**

- **Assertions that follow ruling A:** the resting-step test (h6 / h5); four
  class cases (`RM 0.00` and `RM 876.24` on each size); the clearance and
  threshold `it.each` size arrays.
- **The slot test** now compares the slot with the Figma frame's token, not
  the resting step's line height. Those are no longer the same.
- **Every markup pin that renders a ring,** including Gate 66's two
  ring-bearing cards. These keep their original hashes and map exactly one
  class back before hashing: the new resting class to the old one (m h6 → h5,
  l h5 → h4). They still prove that nothing else in the markup moved.
- **The boundary test's rows were reordered.** The ladder was second in each
  row, so `%i` interpolated the ladder and the title rendered as
  `length NaN takes 11`. Title-scoped mutation proofs therefore matched
  nothing (`10 skipped`, exit 0). That exposed it.

**29 mutation proofs across both passes.** The correction re-proved every
changed test: 19 cases. Two of the 19 were first invalid, for the reason
above, and were valid once re-run. Every valid proof read `1 failed | N skipped`
when mutated, restored sha256-identical, and went green. The hash pins were
mutated to a class OTHER than the old one. Reverting to v2.5.0's exact class
would hash-match by construction, and the class tests pin that direction.

Inline `style={` in `src/components` (non-test `.tsx`): **13 in 8 files,
unchanged**. `:hover` in component CSS: 49 occurrences, 41
`@media (hover: hover)` blocks, unchanged; the Gate 40 guard passes.

## Gate 70 — the donut keeps its hole, wedges at /500, `icon_spend` (v2.6.0)

Built on `main` at `21259e4` (`v2.5.1`) and left uncommitted. Release notes are
in `CHANGELOG.md` v2.6.0, and component detail is in `docs/component-tokens.md`
(DonutChart, and the Icon entry `icon_spend`). All three items came from the
MVP's Gate 69, which put `DonutChart` on screen for the first time on the
budget drilldown (`1266:14337`). Teku ruled on all three.

### 1 · G42 — why a one-segment donut was a solid disc, and the mechanism

A 360° wedge can't be drawn as an arc, so one segment renders as a `<circle>`
with `fill="none"` and `stroke="currentColor"`. The base rule
`.mn-donut__segment { fill: currentColor }` also matched that circle, and **any
CSS rule outranks an SVG presentation attribute.** So the circle was filled as
well as stroked, and the hole disappeared.

**The fix is a modifier, `.mn-donut__segment--ring { fill: none }`, carried only
by the circle.** It is declared after the base rule with equal specificity
(0,1,0), so source order makes it win. That is the same convention as the
`sizing` prop's `--fill`. Chosen over the alternatives for three reasons:

- **The circle stays a `mn-donut__segment`.** The per-hue class still sets its
  `color`, so one declaration per hue still drives both paint modes, as the
  file's comment requires.
- **Deleting the base `fill` rule was not an option.** The wedges need it.
- **Giving the ring its own element class would have split the hue plumbing in
  two** for no gain.

The circle's `fill="none"` attribute stays as the fallback for a consumer that
hasn't loaded the stylesheet. Wedges never carry `--ring`, which a test asserts.

**Measured in the showcase** with a probe mounted inside the themed `div` at
200px. **Mount it inside `div[data-theme]`:** a probe appended to `body` sits
outside the theme and reads light in both passes, which the first attempt did.
Transitions were finished first. Readings, both themes:

| | light | dark |
|---|---|---|
| ring computed `fill` | `none` | `none` |
| ring computed `stroke` | `rgb(4, 110, 255)` = blue-500 | same |
| hole radius / farthest corner of centre text | 64.8 / 46.39px | same |
| element under the centre point | `<svg>` (not the circle) | same |
| page behind the centre | `rgb(255, 255, 255)` | `rgb(0, 0, 0)` |
| centre label colour | `rgb(54, 60, 67)` | `rgb(207, 213, 220)` |

**Controlled revert:** with both CSSOM copies of the `--ring` rule deleted, the
computed fill went back to `rgb(4, 110, 255)` and the element under the centre
point became the `circle`, which is G42 exactly. Reinserting the rules restored
`none` / `svg`. So the fix is not inert. The seven showcase wedges measured
filled at their `/500` hex values, with `fill` equal to `color`.

### 2 · Wedges `/500`, badges `/400` — deliberately different

Figma paints the donut wedges at `<Hue>/500` and the legend's `IconObject`
badges at `<Hue>/400`. **Teku's ruling (25 Sept 2026): wedges follow Figma, and
badges stay.** All twelve `.mn-donut__segment--<hue>` rules now bind
`--brand-<hue>-500`. All twelve primitives exist in `globals.css` (lines 9–158,
one per ramp), and no token value changed. `IconObject` and `ChartLegendItem`
were not touched. A test derives the twelve hues from `IconObject.css`'s
`/400` badge rules. It then asserts that the donut has exactly that hue set,
each at `/500` and resolving to the same hex in both themes. **Do not "fix" the
two steps back into agreement.**

### 3 · `icon_spend` — source and export

- **Source: the DS file, not `casestudy_02`.** Local MCP `get_metadata` with no
  node returned the SELECTION: `235:679 icon_Spend`, a `symbol` (a component)
  with one vector, `237:688`. `235:5710` (ProgressRing medium) resolved and
  `1266:14337` returned "no node could be found", which confirms that the active
  tab was the DS file.
- **The remote connector was unavailable this session** because it needed OAuth,
  so only the local server was read.
- **Export:** the served SVG
  (`/assets/63caa1d9cd6667e0e048ecdec89afbb5959dead5.svg`) has two paths with
  `fill="black"` inside two wrapper `<g>`s. It was rewritten by script to the
  house form: no `<g>`, root `fill="none"`, paths `fill="currentColor"`,
  `viewBox="0 0 24 24"`, LF. **Both `d` strings are byte-identical to Figma's**,
  compared by the script after writing. None of the other 36 custom assets
  contains a `<g>`.
- **Registry:** key `icon_spend`, beside `icon_spending_alert` under "Budgeting &
  Insights". The import is alphabetical. The count went 107 → 108 by the parser
  in `docs/component-tokens.md`.

**⚠️ Tooling: the local Figma MCP's `get_design_context` takes ~212s on this
file, and the harness aborts tool calls after 300s of silence.** It failed three
times as a tool call (idle timeout, dropped transport, expired session). A direct
JSON-RPC POST to `http://127.0.0.1:3845/mcp` with a 15-minute client timeout
(`initialize` → `notifications/initialized` → `tools/call`) returned in 212s.
The asset URL it names is then fetchable with `curl`. This is the likely cause of
Gate 68's "dropped its transport twice" as well.

### 4 · Tests and proofs

**Predicted before the first run: 655 + 7 = 662 in 63 files.** That is
`DonutChart.test.tsx` 12 → 17 and `Icon.test.tsx` 19 → 21. There is no new
test file and **no existing assertion was changed or deleted**. The existing
ring test queries `circle.mn-donut__segment--green`, which still matches.

- **jsdom applies no CSS.** The new donut tests therefore resolve the paint
  from `DonutChart.css`: a rule matches if its selector is one compound of
  classes the element carries, the highest class count wins, and ties go to
  source order. The SVG attribute counts only when no rule sets the property.
  That ordering is G42 itself.
- **The hole test is geometric.** The stroke's inner edge equals
  `innerRadius × 50`, and the centre is an absolutely centred sibling of the
  SVG. The browser table in §1 supplies the pixels.

**Seven mutation proofs, one per new test**, each selected by an exact title that
was regex-escaped (`/500` contains a slash) and anchored with `$`. Each read
`1 failed | N skipped` mutated (16 for DonutChart, 20 for Icon), was restored
sha256-identical, then read `1 passed | N skipped`. The runner spawns
`node node_modules/vitest/vitest.mjs` with an argument array: no shell.

**Gate 68's hash-pin normalisation was NOT retired.** Its trigger is "the next
DS gate that touches `ProgressRing.test.tsx` / `CardMonthlyBudget.test.tsx`",
and this gate touched neither. The trigger stands for the next gate that does.

## Gate 73 — Flow 11 primitives (v2.7.0)

Built on `main` at `6487399` (`v2.6.0`), left uncommitted — Claude Code made
no git writes (see Git workflow). Release notes in `CHANGELOG.md` v2.7.0. Six
gaps the MVP's Flow 11 (Finance → Plans) scope session found; the MVP's
register owns the IDs. Phase 0 reproduced every baseline figure the brief
gave: 662 tests / 63 files, 13 `style={` in 8 files, 49 `:hover` / 41
`@media (hover: hover)`, 60/60 registration, zero token drift, 27 tags.

### 0 · Figma, and how it was read

**Local desktop MCP only.** The remote connector needed OAuth this session.
The active tab was a THIRD file at session start (frame `109:12355`, "32
Financial Clarity & Control") — neither source resolved (`1266:14338` and
`235:5710` both "no node could be found"). Teku switched tabs twice on
request; each switch was confirmed by the same pair of probes in reverse.

**`get_design_context` through the tool times out at 300s** (Gate 70 recorded
this). The direct JSON-RPC route has a SECOND trap: Node's global `fetch`
(undici) aborts the response body at 300s with `UND_ERR_BODY_TIMEOUT`, so
Gate 70's recipe fails on a slow call unless it uses `node:http` with
`req.setTimeout(0)`. In `casestudy_02` design-context calls returned in 1–2s;
in the DS file one call ran past 17 minutes without returning.
**`get_variable_defs` on a single node returned instantly in both files and is
the fast way to read a binding** — used for every G47 and G48 reading below.
`get_design_context` rejects instance IDs (`I…;…`); pass the underlying node
ID (e.g. `870:6776`), which resolves in the file that owns it.

### 1 · G45 — `InlineMessage` `tone="ai"`

- **Figma:** `❖ System message`, component set `1201:16583` in `casestudy_02`,
  variant `appearance=ai` = **`1201:16589`** (it resolves; the brief could not
  resolve it). Used at `I1266:14339;870:6776`. Sibling variants: information,
  Success, Warning, Error, Discovery — so Figma models ONE appearance axis,
  which is why `ai` is a `tone` value and not a second prop.
- **Fill:** `to right`, **Blue/400 2.404% → Blue/500 28.942% → Violet/500
  100%**, every stop a bound variable (`get_variable_defs`: `Blue/400`
  `#368bff`, `Blue/500` `#046eff`, `Violet/500` `#df5af6` — identical to
  `--brand-*` on disk). Padding `scale/200` 8, radius `border-radius/md` 8, no
  border. Glyph `icon_aiinsights` 20px, `icon/primary/on-color`. Title
  `body/m-semibold`, body `body/sm`, both `text/primary/on-color`. 4px glyph →
  text and title → body.
- **Why no `--mapped-gradient-*` token, against the brief's instruction.** The
  only input to that pipeline is `Brand/Value.json`'s `Gradient` group, which
  holds Token Studio's export of Figma gradient STYLES — and Figma has no style
  or variable for this fill (the design context lists text styles only). A
  token would therefore be one Figma does not have, added by hand-editing
  `design-tokens/**`, which Ruling A forbids. The `brand` kind also accepts
  exactly two `{family}` stops resolving to mapped surfaces, not three brand
  primitives with positions. Composed in `InlineMessage.css` from the three
  `--brand-*` vars instead — `IconObject`'s `ai` colour already does exactly
  this. Nothing hard-coded, no token invented, `build:tokens` diff empty.
- **The action is a real `button` instance** — `Type=Tertiary,
  Appearance=Inverse, Size=M` in the variant; the Plans-tab instance overrides
  it to label-only, 12/4 padding, 28 tall. **In this DS, Inverse IS dark mode**
  (`Button.css`), so the actions region carries `data-theme="dark"` in the ai
  tone only (the `ToastMobile` precedent) and the consumer's own `<Button>`
  renders Inverse. **No new `Button` appearance was added.** The 28px override
  is a screen-level choice: the DS `m` renders 38 tall, `s` is 4px all round.
- **`isFramed` is ignored by `ai`**: white text with no gradient would be
  unreadable. Documented in both the `tone` and `isFramed` doc comments.
  Neutral and warning render byte-identically (the `data-theme` attribute is
  `undefined`, so React omits it — asserted).
- **⚠️ OPEN ACCESSIBILITY ITEM — shipped as drawn (Teku's ruling, Gate 73
  follow-up).** White text on each stop, identical in both themes (every value
  is theme-invariant): Blue/400 **3.34**, Blue/500 **4.49**, Violet/500
  **3.03**. Violet/500 is the lightest stop, and the View action sits over it.
  Under 4.5 for the 14px body and the 16px title everywhere. To be fixed in a
  later patch once Teku chooses darker stops in Figma. Also recorded in
  `CHANGELOG.md` v2.7.0 under Still deferred.
- **Accepted by the review thread:** composing the gradient in CSS from the
  three `--brand-*` primitives, rather than adding a pipeline token.
- **Computed, both themes:** background `linear-gradient(90deg, rgb(54,139,255)
  2.404%, rgb(4,110,255) 28.942%, rgb(223,90,246) 100%)`, padding 8, radius 8,
  border 0; title, body, glyph and the tertiary action's label all
  `rgb(255,255,255)`; glyph 20px.

### 2 · G46 — `golf_course`

The DS file has the whole Material set as components: `golf_course` is
**`5:3769`** with Filled / Outlined / Round / Sharp / Two Tone.
**`casestudy_02`'s `868:12490` is a copy** (same frame, same coordinates). The
Golf Lesson row (`I868:6276`) draws **`Style=Filled`**.

**RULING (Teku, Gate 73 follow-up): Round, not Filled, for registry
consistency** — every other Material key in the registry is Round. Registered
from DS **`5:3774` (`Style=Round`)**: it serves asset `c3f4a699…`, the same
content-addressed asset as the app copy's Round symbol `868:12493`. Both `d`
strings written to `Assets/icons-custom/golf_course.svg` and compared back by
script (identical). House form as `icon_spend`. **Registry 108 → 109** (71
Material Round + 38 custom), by the parser.

**Still a custom asset, not the package import:** Figma's Round vector is NOT
byte-identical to `@material-design-icons/svg/round/golf_course.svg` — it is
drawn as two cubic-bezier paths where the package uses a `<circle>` plus
relative arcs, and it sits ~0.3px higher. The brief required Figma's own
paths. *(The first pass registered Filled, `5:3770`; that asset was replaced.)*

### 3 · G47 — `IconObject` square radius at `xs`, `s` and `m`

**Figma's square radius, read per size from the DS set `221:20`
(`get_variable_defs`):**

| size | px | Figma | code before | code after |
|---|---|---|---|---|
| xs | 16 | *(no DS variant)* app instance: `border-radius/sm` 4 | 8 | **4** |
| Small | 20 | `border-radius/sm` 4 (`289:1169`) | 8 | **4** |
| Medium | 24 | `border-radius/sm` 4 (`289:1145`) | 8 | **4** |
| Large | 32 | `border-radius/md` 8 (`289:1121`) | 8 | 8 |
| Xl | 40 | `border-radius/md` 8 (`289:1097`) | 8 | 8 |
| XXL | 56 | `border-radius/md` 8 (`389:384`) | 8 | 8 |

**The DS set has no XS variant** (xs was extended down in code at v1.3.0), so
the only Figma source for 16px is the app instance `I1266:14342;901:8394`:
`border-radius/sm`. The first pass changed `xs` only, per the brief; **the
review thread then widened G47 to `s` and `m`** from the bindings above. One
rule, `.square.xs, .square.s, .square.m` at (0,2,0), binds `--brand-scale-100`
(4px); `l` and up keep the (0,1,0) `--brand-scale-200` rule. The test is an
`it.each` over all six sizes, so a size drifting either way fails by name.

### 4 · G5 — `CardDataDisplay` `orientation` + `sizing`

- **Figma:** the wide row is a DETACHED `card/data display` at
  **`886:7320`**, used on **`1266:14341` and `1266:14342`** (311×56) — **not
  on `1266:14343`**, which carries four ordinary 163.5×80 instances. A wrapping
  flex row, justify-between, centred, `gap-y` 8, padding 16, radius md,
  subtlest fill; label `text/subtle/default` at **body 16/24 semibold** (not
  the caption the vertical card uses), grows (`flex: 1 0 0`) and may wrap;
  value `text/default/default`, nowrap.
- **`orientation?: 'vertical' | 'horizontal'`** (default vertical);
  horizontal moves the label to `type-body-m-semibold`.
- **`sizing?: 'fixed' | 'fill'` — NOT Fixed/Hug/Fill as the brief said.** The
  DS vocabulary is `'fixed' | 'fill'` in five components (`CardBalance`,
  `CardFeaturesAndEducation`, `CardMonthlyBudget`, `Field`, `Select`) and the
  sizing-prop rule above says copy that shape; no Flow 11 frame hugs. Fill:
  `width: auto; max-width: none; flex: 1 1 0`, 128px floor kept. **Accepted by
  the review thread.**
- **Token-source gap, NOT applied:** Figma gives the label a raw
  `min-width: 100px` (off-ramp, 96/128). The gap protocol needs approval before
  a flagged literal is used, so it is omitted; the label's floor is its longest
  word. **Dropping it was accepted by the review thread.**
- **`content2` is supported in horizontal, although Figma does not draw it**
  (Figma's row has one value). It renders as a third item in the same wrapping
  row, following the value and wrapping under it when the row is too narrow.
  Documented in the prop's doc comment and `docs/component-tokens.md`.
- **Arithmetic and measurement:** two fill tiles + 16 gap in 343 →
  (343 − 16) / 2 = **163.5** each, measured 163.5 / 163.5, `max-width: none`;
  horizontal row **343 × 56**, label x 16, value 16 from the right edge, one
  line. Both themes (label `#6b7786` / `#8695a7`, value `#363c43` / `#cfd5dc`).
  Omitting both props renders the v2.6.0 markup byte-for-byte (asserted).
  Subtle-on-subtlest is 4.33 in light (Gate 62 §2) — same pair as before.

### 5 · G19 — `SelectTransfer.sizing`, `SelectWalletAccount.sizing`

`'fixed' | 'fill'`, the `Select.sizing` (G15) shape exactly: `--fill` is
`width: 100%; flex: 1 1 0`, after the base rule. Default 320. Measured 400 in
a 400 column, 320 fixed, both themes.

### 6 · G43 — the `Select` menu, fixed in place (NOT portalled)

**RULING (Teku, Gate 73) — supersedes the review thread's portal ruling.**
The portal would have broken the one real consumer: the MVP's
`BudgetFormModal` closes the category picker on `pointerdown` via
`categoryRef.contains(target)`, and a portalled menu is outside that ref, so
every tap on a category would close the menu before it landed. Tab order into
the menu and the `Modal` focus trap (`getFocusable(card)`) would also lose it.

**Mechanism:** `.mn-select__menu` is `position: fixed`, placed by
`Select.tsx` through four custom properties (`--mn-select-menu-top/-left/
-width/-max-height`, the custom-property pattern — **one new `style={}`
site**). Width = the trigger's. Opens `--brand-scale-100` below; flips above
only when the content does not fit below AND there is more room above; height
capped to the chosen side's space (gap applied at the trigger and the viewport
edge); `overflow-y: auto` + hidden scrollbar ONLY when capped
(`data-capped`), because `overflow: auto` clips the slot's shadow even with
nothing to scroll. Re-measured before paint on every render while open, and
on window `scroll` (capture) / `resize`. **Closes** (via `onOpenChange(false)`)
when the trigger is fully outside the viewport or any overflow-clipping
ancestor.

**KNOWN LIMIT (recorded per Teku's ruling):** a `position: fixed` element is
positioned against the viewport only while no ancestor has a `transform`,
`filter` or `contain` property — any of those becomes its containing block and
would clip it again. **`Modal` and `Sheet` have none today.**

**Unchanged, as ruled:** Select has no Escape or outside-click handling of its
own, before or after — `Modal` owns Escape and the consumer owns outside
click. All 13 pre-existing `Select` tests pass unmodified.

**Measured in the showcase `Modal` (`#g43-picker`), 1009 wide:** trigger
452 bottom, card 452 bottom, menu **456 → 700** at width 343, `elementFromPoint`
at the menu's bottom edge hits `.mn-menu` (painted, not clipped). A real
pointer click on an item selected it and closed the menu under a
`contains()` outside-click listener. Menu focusable counted inside the Modal
trap (1 of 4; `offsetParent` of a fixed element's CHILD is not null); menu
follows the input in document order. At 375×520: **flipped above**, menu
233 → 457, trigger top 461. At 375×200: capped at 173px, `overflow-y: auto`,
`scrollbar-width: none`, `clientWidth` = `offsetWidth` = 343 (no gutter),
scrolls. Escape still closed the `Modal`.

### 7 · G48 — no change, no ID

The DS main component `list/chart legend` **`261:413`** binds the title
`text/subtle/default` (`261:401`), the subtitle subtle (`261:402`) and the
amount `text/default/default` (`261:404`) — exactly what `ChartLegendItem`'s
`contribution` variant renders. `1266:14344`'s Recent Contributions rows show
the title at `text/default/default` through an INSTANCE OVERRIDE.

**RULING (review thread, Gate 73 follow-up): the app's `text/default/default`
override is a Figma inconsistency, and the DS keeps its main component's
`text/subtle/default` binding.** No code change; no G48.

### 8 · Tests and proofs

**Predicted in writing before the full run:** 662 + SelectTransfer 6 +
SelectWalletAccount 5 + Select 6 + InlineMessage 6 + CardDataDisplay 7 +
IconObject 1 + Icon 2 = **695 in 63 files. Measured 695 / 63.** No existing
test's body or assertion was modified. Two pre-existing lines outside test
bodies did change: `Select.test.tsx`'s vitest import (adds `vi`,
`beforeEach`, `afterEach`) and `InlineMessage.test.tsx`'s `rootClasses`
helper type (adds `'ai'`).

**33 mutation proofs, one per new test** (runner: `node vitest.mjs` by argv,
exact title regex-escaped and `$`-anchored, mutate → `1 failed | N skipped` →
restore → sha256 identical → `1 passed | N skipped`). **32 valid first time;
one was not:** the ai-tone axe test's first mutation (a dangling
`aria-labelledby` on the `role="group"`) read `1 passed` — axe does not flag
that — so it proved nothing. Re-run with `role="list"` on the ai actions
region (`aria-required-children`): `1 failed | 23 skipped`, valid.

### 9 · Figures

| | predicted | measured |
|---|---|---|
| tests / files | 695 / 63 | **695 / 63** |
| `style={` in non-test component `.tsx` | 14 in 9 | **14 in 9** |
| `:hover` / `@media (hover: hover)` | 49 / 41 | **49 / 41** |
| component CSS registered | 60/60 | **60/60** |
| `build:tokens` diff | empty | **empty** |
| icon registry | 109 | **109** (71 + 38) |
| public `.d.ts` | additions only | **additions only** |

**Personal-data audit — the brief's negative control is wrong about one
string.** `BEVERAGE` is absent from the tree (0 files). `12.22` is **not**: 4
tracked files, all present at HEAD and none personal — three SVG path
coordinates (`icon_grocery_1`, `icon_monarchacademy`, `icon_spend`) and
`package-lock.json`'s `>=v12.22.7`. In the files this gate changed, the only
occurrences are this paragraph (which names both strings) and that
pre-existing lockfile line (the gate changed only the lockfile's two version
lines). No component, test, asset, showcase or CHANGELOG change carries either.

**Session hazard, recorded:** a `taskkill //IM node.exe` issued to clear two
hung Figma fetches is not scoped to one process and may have ended unrelated
`node.exe` processes on the machine. Use `TaskStop` on the background task ID
instead.

### 10 · Follow-up pass (review thread rulings, same gate)

Rulings applied: G46 → Round (§2); G47 widened to `s` and `m` (§3); the AI
banner ships as drawn, recorded as an open accessibility item (§1, and
`CHANGELOG.md` Still deferred); G48 recorded as a Figma inconsistency (§7);
the CSS-composed gradient, the `fixed | fill` vocabulary and the dropped 100px
floor accepted (§1, §4). `docs/component-tokens.md` DID list values for all
three components, and was updated: `CardDataDisplay` (the two props, the
horizontal and fill rows, `content2`), `Inline Message` (the `ai` tone row, a
"Tone: ai" table with the open contrast item, and the `isFramed` note) and
`Icon Object` (the shape table split by size). The Icon registry's prose list
in that file was not asked for and was not changed.

**Written before re-verifying:**

| | predicted | measured |
|---|---|---|
| `npx tsc -b --force` | exit 0 | **exit 0** |
| tests / files | 695 − 1 (the single G47 test, replaced) + 6 (one per size) = **700 / 63** | **700 / 63** |
| mutation proofs | **7**: the 6 new G47 cases + the golf-path test (its assertion changed) | **8, all valid** — the golf tint test was re-proved too, because its asset file changed. Each `1 failed \| N skipped` mutated (30 for IconObject, 22 for Icon), sha-identical restore, `1 passed` |
| public `.d.ts` | additions only; same symbols as the first pass, plus doc-comment lines | **additions only**, the same 5 files; 6 `-` lines, all superseded (3 signatures, 1 union, 2 comment lines) |
| `style={}` / hover | 14 in 9 / 49, 41 (unchanged) | **14 in 9 / 49, 41** |
| `build:tokens` diff | empty | **empty** |
| CSS registration | 60/60 | **60/60** |
| personal-data audit, newly changed files | no hits outside §9's own paragraph | **none outside §9's paragraph** |

**The first G47 proof attempt threw before writing anything:** `IconObject.css`
is CRLF in this working copy, and a `\n` pattern did not match (the hazard
Gate 62 §6 records). The runner's `finally` restored the original, the file's
sha256 was unchanged, and the patterns were rewritten as `\r?\n` regexes.

## Gate 73-B — `OverlayHeader`, `OptionList`, neutral header icons, `Select` self-close withdrawn (v2.8.0)

Built on `main` at `9fecbd1` (`v2.7.0`), left uncommitted — Claude Code made no
git writes. Release notes in `CHANGELOG.md` v2.8.0. Teku ruled R1–R8 on
29 Sept 2026; two further rulings were taken mid-gate and are recorded in §7.

**Phase 0 reproduced every baseline the brief gave, exactly:** HEAD
`9fecbd10bc80fb412103c5f41f2b70eacbc62ba8` = `v2.7.0^{}`, clean tree, 0
untracked, **28 tags**, `package.json` 2.7.0, `tsc -b --force` exit 0,
`build:tokens` diff empty, **700 tests / 63 files**.

### 0 · Figma, and how it was read

**Local desktop MCP only** — the remote connector needs OAuth, which a
non-interactive session cannot run. Non-negotiable 3 was followed in both
directions, and it mattered: the DS file was active at session start
(`get_metadata` with no node returned the SELECTION, `249:177`, which both
identified the file and handed over the exact node to read), and
`1484:19402` returned "no node could be found". After Teku switched tabs the
probes reversed — `1484:19402` resolved and `249:177` did not.

`get_metadata` is the fast, reliable read here and supplied **every** geometric
figure below; `get_design_context` was never called, so Gate 70's 212s /
300s-timeout hazard was not hit at all. `get_variable_defs` on a single node
again returned instantly and supplied every token binding.

### 1 · What Figma actually says — and where the brief's numbers came from

**`<header>` component set `249:177`, all six variants measured.** Every one is
**375 × 64**, icons **24 × 24 at x=16 and x=335** (right edge 359 = 375 − 16),
y=24 → padding **24 top / 16 bottom / 16 sides**.

| variant | name | icons | title frame | spacer |
|---|---|---|---|---|
| `207:3849` | Header=True, right only | right `335` | x=149.5 w=76 | `Frame 446` x=**16** |
| `815:8261` | Header=Header4, both | `16`, `335` | x=149.5 w=76 | — |
| `815:8290` | Header=Header6, left only | left `16` | x=149.5 w=76 | `Frame 446` x=**335** |
| `249:178` | Header=False, right only | right `335` | hidden | `Frame 446` x=16 |
| `815:8267` | Header=Header3, both | `16`, `335` | hidden | — |
| `815:8296` | Header=Header5, left only | left `16` | hidden | `Frame 446` x=335 |

**R2's empty slot is Figma's own mechanism, not an invention.** Each
single-icon variant carries a real empty 24 × 24 frame named `Frame 446` at the
missing icon's exact position. The title frame sits at x=149.5 and is 76 wide
in EVERY variant, so its centre is **187.5 = 375 / 2** exactly, in all of them.

**The `Header` axis is really "title on/off", duplicated three times.** Its six
values pair up per icon combination — True/False, Header4/Header3,
Header6/Header5 — and the second of each pair simply hides the title frame.
**There is no variant with BOTH icons absent**, so R2's fourth combination is
an extension beyond the source; it is covered by the same mechanism and is
measured below.

**Bindings (`get_variable_defs` on `815:8261`):** `icon/default/default`
**`#363c43`**, `text/default/default` **`#363c43`** — identical, which is R4 at
source. Title `body/m-semibold`. `Scale/600` 24, `Scale/400` 16, `Scale/100` 4.
No token gap; R8 satisfied for the header.

**The picker view, `casestudy_02`.** `Frame 537` (`1484:19292`) draws the
defect and the spec side by side at the same scale, which is what makes the
comparison exact:

| | `Now` (defect) `1484:19112` | `Intention` (spec) `1484:19402` |
|---|---|---|
| sheet | 343 × 624 | 343 × 564 |
| header instance | `1488:19154` 343 × 64 | `1488:19175` 343 × 64 |
| content | `<Menu>` `1484:19296` **inset x=16, 311 wide**, with `Slot {Options}` inside it | seven `<item>` at **x=0, 343 wide** |
| footer | two buttons, 311 wide at x=16, 16px apart | identical |

Rows `1484:19479`–`19485`: **343 × 48** at y = 0, 50, 100, … — pitch 50 on a 48
row, so the gap is **2px**. Each holds a `Checkbox` instance at **x=16**, y=12,
315 wide (the 12px right inset is `MenuItem`'s own padding, which is why it is
315 and not 327). The selected row's tint is `Blue/50` **`#e6f1ff`**, a RAW
BRAND PRIMITIVE — confirmed by reading `1484:19481`'s own variable definitions,
where the plausibly-named `surface/primary/default-subtle-selected` is an
unrelated grey `#f2f2f2`. That is the finding `MenuItem.css` already records
and already resolves; see §3.

**`1488:19175` (the picker's header instance) is 343 wide with its right icon
at x=303 and its title frame at x=98 w=147 — centre 171.5 = 343 / 2.** So
centring holds at both widths, which is what a fixed-equal-side-track grid
produces and a flexible one does not (§2).

**Where the brief's figures came from, and why they looked wrong.** The brief
gave "Header 343 × 64 … icons at x=16 and x=303" while naming `249:177`. Those
numbers are the **343-wide instance** `1488:19175`, not the component set,
which is 375 with its right icon at 335. Both are internally consistent; the
brief attached the instance's numbers to the component set's node id. The row,
gap and footer figures it gave are all confirmed exactly.

**Known authoring oddity, confirmed and not a build input.** The brief flags
that `815:8290` is labelled icon-left-only but its left slot holds a close
glyph. The screenshot shows it is broader than that: **every icon slot in all
six variants holds a close (×) glyph**, left slots included. The icon is an
instance swap, so none of it affects what is built.

### 2 · R2 as built — fixed tracks, and why `1fr auto 1fr` is not enough

`.mn-overlay-header` is
`grid-template-columns: var(--brand-scale-800) minmax(0, 1fr) var(--brand-scale-800)`.
The two side tracks are FIXED and IDENTICAL, so the middle track is centred by
arithmetic rather than by a layout that happens to balance. The slot is 32px
because R2 pins it to the CONTROL's footprint (24 glyph + 2 × 4 padding), not
the 24px glyph.

**The rejected alternative is what `Modal` actually shipped**, and the
difference is measured, not argued. `1fr` is `minmax(auto, 1fr)`: the tracks
are equal only while there is free space to flex them. Measured live in the
showcase on the long-title case with a "Reset" node in the trailing slot —
i.e. exactly `Sheet`'s `headerAction`:

| grid | title-centre offset | height |
|---|---|---|
| `32px minmax(0,1fr) 32px` (shipped) | **0** | 64 |
| `1fr auto 1fr` (what Modal shipped) | **21.875px** | 64 |

**Measured live, both the four icon combinations and a truncating title** —
header width 375, height 64, both slots 32 in every case:

| case | header | title-centre offset | truncated |
|---|---|---|---|
| neither icon | 375 × 64 | **0.000** | no |
| left only | 375 × 64 | **0.000** | no |
| right only | 375 × 64 | **0.000** | no |
| both icons | 375 × 64 | **0.000** | no |
| long title | 375 × **64** | **0.000** | **yes** |

**Controlled revert, so the mechanism is not inert.** Removing the START slot
from the DOM moves the title centre by **155.5px**; re-inserting it returns it
to 0. Removing the END slot moves it by **0** — auto-placement still lands the
title-group in column 2, so on that side the fixed TRACK is what centres it and
the element is R2's stated contract rather than the load-bearing part. Say this
accurately: the empty slot is load-bearing on the leading side only.

**Height is 64 because the row is pinned to the GLYPH's 24px, not the control's
32px hit area.** 24 + 24 + 16 = 64. The control is centred in that 24px box and
overflows it by 4px above and below into the padding, which is not a clipping
context — so the 32px target survives at Figma's height. **The glyph therefore
sits 4px inboard of Figma's x** (20 / 331 against 16 / 335), which is the
pre-existing consequence of a 32px hit area inside 16px padding and is
unchanged from what `Modal` already shipped.

### 3 · R5 as built — `OptionList` composes `MenuItem`, which closes R8

`OptionList` is a `role="listbox"` column with `gap: var(--brand-scale-50)`
(2px) and **no** background, radius, padding or shadow — the four absences ARE
the component, and each is one of the things `Menu` has and the defect view
nests at x=16.

**It composes the real `MenuItem` rather than re-implementing a row, and that
is what keeps R8 satisfied.** Figma's selected tint is a raw `Blue/50`
(§1); `MenuItem.css` already carries that exact finding and its approved
token-source-gap resolution,
`color-mix(in srgb, var(--mapped-border-primary-default) 10%, transparent)`.
Re-implementing the row would have re-opened a token gap that was already
closed. `MenuItem--checkbox` also already measures what Figma draws: padding
12/12/12/**16** over a 24px control — the 16px control inset, and the 12px
right padding that explains Figma's 315-wide checkbox in a 343 row.

**Measured live:** list 343, row **343**, inset **0** on both sides, gap **2**,
computed padding `0px`, background `rgba(0,0,0,0)`, radius `0px`, shadow
`none`, control inset **16**. The selected row's tint computes
`color(srgb 0.0156863 0.431373 1 / 0.1)` and spans the full **343 in both
themes** — it reaches both edges, which is the whole point of the ruling.

**`selectionMode='single'` renders `MenuItem type="radio"`, and that is a
decision taken inside the brief — FLAGGED FOR TEKU.** Figma draws no
single-select picker, so this is a reading, not a source. `radio` was chosen
over `default` because `default` is a 44px row with a 12px inset, which would
make single mode a different SHAPE from the one Figma actually draws, whereas
`radio` shares `checkbox`'s geometry exactly.

### 4 · R7 as built — `Select` never closes itself

The `closeRef` path is deleted. No code path driven by geometry, scroll, resize
or render calls `setOpen` or `onOpenChange`. Out of view sets
`.mn-select__menu--out-of-view` (`visibility: hidden; pointer-events: none`) —
a modifier class, so no new token and no new `style={` site.

`visibility`, not `display: none`, deliberately: it keeps the element
measurable so the geometry code can place it correctly the instant the trigger
returns, and it removes the subtree from the a11y tree and the Tab order
without changing layout.

**A single out-of-view reading is never acted on.** One
`requestAnimationFrame` re-measure must agree; an in-view reading clears the
state at once AND cancels the pending frame; the frame is cancelled on close
and on unmount. Only one frame is ever in flight, and none is scheduled once
already hidden — otherwise every render while out of view would leave one
pending forever.

**Two of these tests were written wrong first, and would have proved nothing.**
"An in-view reading cancels the frame" and "unmount with a re-check pending"
both originally asserted only that nothing hid / nothing threw. Neither would
fail if the cancel were dropped: the stale callback simply re-measures, reads
in-view, and does nothing, and React nulls the ref on unmount so the callback
returns early rather than throwing. Both now assert the **pending-frame count**
(`frames.size`), which is what makes the cancel load-bearing — and the "drop
the cancel" mutations only became valid proofs after that change.

### 5 · The `MenuItem` row-height defect — found here, ruled on, fixed

`OptionList`'s Figma source draws 48px rows; the DS rendered **55** (checkbox)
and **51** (radio). Cause and rule are recorded as a DS convention under
Component rules (THE WRAPPER RULE) rather than as a note on this fix.

**Teku's precondition was met before the fix was applied**: the Menu dropdown's
own option rows are drawn at **48** too (`1484:19300`'s items, 295 × 48, pitch
56 = an 8px gap), so this is a defect correction against the source in both
places, not a design change.

**Every height that changed, measured in the showcase across 46 rendered rows,
before and after, with the CSSOM rule confirmed loaded after a full reload:**

| | row before | row after | control wrapper before → after |
|---|---|---|---|
| `checkbox` | 55 | **48** | 31 → **24** |
| `radio` | 51 | **48** | 27 → **24** |
| `account` | 58 | 58 (unchanged) | 27 → 24 |
| `default` | 44 | 44 (unchanged) | *(no wrapper)* |
| `crypto` | 68 | 68 (unchanged) | *(no wrapper)* |

`account`'s ROW does not move because its height is driven by its Avatar, not
by the control wrapper.

**Menu, Select and DatePicker re-verified, as instructed.** All three are
**unchanged**: `Menu`'s panels stay 254 / 200 / 254 and its section 1055.58,
`Select`'s section 934.58, `DatePicker`'s 945.58. The reason is that the
showcase's `Menu` rows are all `type="default"`, and neither `Select` nor
`DatePicker` renders a `MenuItem` at rest — the only checkbox/radio rows in the
showcase live in the `MenuItem` and `OptionList` sections. **The toggle was
proven effective in the same pass** (checkbox row 48 ↔ 55 ↔ 48), so "unchanged"
is a real reading and not an inert probe.

A second, separate `MenuItem` defect surfaced with it: **`checkbox` and `radio`
rows had no accessible name**, because both render their only text inside an
`aria-hidden` + `inert` wrapper. `MenuItem`'s own axe test covers `type="default"`
only, which is exactly how it shipped. Fixed with `aria-label={label}` for
those two types, and the axe hole closed with an `it.each` over both.

### 6 · Tests

**700 → 735, 63 → 65 files**, and the arithmetic was written before the run:
700 + 16 (`OverlayHeader`, new file) + 12 (`OptionList`, new file) + 4
(`Select`: −1 removed, +5 added) + 3 (`MenuItem`) = **735**. Measured 735 / 65.

**Rewrites, each named with its old and new assertion, in `CHANGELOG.md` and in
comments at each site.** Ten were forced by R1 (class-name queries against
markup that no longer exists) and one by R7. Two are REVERSALS rather than
relocations, and they are the ones that matter:

- `Sheet` › `renders the close button by default and suppresses it on request`.
  Old: `expect(...('.mn-sheet__header-trail')).toBeNull()` — "nothing left for
  the trail to hold, so it is not rendered at all". New: the trailing slot MUST
  still render, `aria-hidden`, with no button. **What the old test asserted is
  now exactly the defect R2 forbids.**
- `Select` › `closes when the trigger scrolls fully out of a clipping ancestor`
  → replaced by five tests asserting `onOpenChange` is **never** called.

One rewrite was green against the new markup and was repointed anyway:
`Sheet` › `renders no header region when no header slot is supplied` asserts
ABSENCE, so probing a class that no longer exists would have kept passing while
testing nothing.

**47 mutation proofs, one per new or rewritten test, all valid.** Runner spawns
`node node_modules/vitest/vitest.mjs` with an argument array (no shell, no
`npx`), selects one test by an exact regex-escaped `$`-anchored title, and every
proof reads `1 failed | N skipped` mutated, restores sha256-identical, and reads
`1 passed | N skipped` restored.

**Two were INVALID on the first run and their own count line said so** — both
read `Tests  no tests` with exit code 1. The mutations had broken module
COLLECTION rather than tripping an assertion: one added a nested `@media` that
the test's own flat CSS scan cannot parse, so its module-scope helper threw at
import; the other renamed `<h2>` without its closing tag, a JSX parse error.
Re-run with collection-safe mutations (an EMPTY at-rule; both tags renamed
together), both read `1 failed | 15 skipped` with a real `AssertionError`.
**This is Gate 62's lesson recurring in a new shape: read the count line, not
the exit code — and an exit code of 1 from a file that never loaded is not a
proof.**

**Two tautological assertions were caught and rewritten before shipping.** The
centring arithmetic was first written
`pad + slot + (W - 2*pad - 2*slot) / 2 - W / 2`, which cancels to 0 for every
input and asserts nothing. It now computes the two edges from their OWN tracks
(`padding-left + track 1` against `padding-right + track 3`), so it is 0 only
while the sides genuinely reserve the same space.

**Geometry is computed from the CSS, not read from the DOM, and that is
deliberate.** `vitest.config.ts` sets no `test.css`, so no stylesheet is applied
in jsdom and every rect is zero — a `getBoundingClientRect` centring test would
compare 0 with 0 and pass against an implementation with no side slots at all.
Centring is therefore proved in two halves that must BOTH hold: the DOM half
(both slots render, in all four combinations) and the CSS half (the two tracks
are equal, resolved through `globals.css`). The browser measurements in §2 are
the other half of the record.

`parseBlocks` from `src/test/tokenCss.ts` is deliberately NOT used for this: it
keeps only custom properties, because it exists to read generated token CSS.
Both new test files do their own flat scan, and `OverlayHeader.test.tsx`
asserts its CSS has no at-rules so that the assumption the scan rests on cannot
rot silently.

**One jsdom artefact, recorded.** `OptionList`'s tests activate the ROW, not the
label text: jsdom does not implement `inert`, so a click on the nested
Checkbox/Radio label synthesizes a second click on the associated input which
bubbles to the row and fires the handler TWICE. In a browser the `inert` wrapper
makes that subtree non-interactive and the click lands once.

### 6a · Tooling hazard — `String.replace` ate the file, silently

Gate 62 §6 records that `node -e`, `sed` and even a quoted heredoc lose
backslashes here. **Add a second one, from the opposite direction: the
REPLACEMENT string, not the pattern.**

Inserting this section with
`s.replace(anchor, () => section)` is safe; `s.replace(anchor, section)` is
not. In a replacement STRING, `$&`, `` $` ``, `$'` and `$1` are special. This
section's own prose contains `` `$` `` (writing about a `$`-anchored regex),
which JavaScript read as `` $` `` — *the entire portion of the string before
the match* — and spliced a second copy of most of `CLAUDE.md` into the middle
of the file. It threw nothing, the grep for the new heading still found it
once, and the file still looked plausible.

**What caught it was `git diff --numstat`: 2190 insertions where the inserted
text was 385 lines.** Nothing else in the checklist would have. So: pass a
FUNCTION as the replacement whenever the replacement text is prose you did not
hand-audit for `$`, and check the numstat against the line count of what you
meant to insert.

### 7 · Decisions taken inside the brief, each flagged for Teku

1. **`MenuItem type="radio"` for single mode** (§3) — Figma draws no
   single-select picker.
2. **`headerAction` stays in the trailing slot and may extend leftward past its
   32px track** when it is wider than one control, which is what a text `Link`
   like `Reset` is. The fixed track means this never moves the title; the cost
   is that a long TRUNCATED title and a wide trailing node can overlap. Holding
   R2 was ruled the priority, since it is the "VERY IMPORTANT" requirement and
   the alternative sacrifices centring exactly when a long title makes the drift
   most visible (§2's 21.875px).
3. **`contentPadding: 'default' | 'none'`**, a string union rather than a
   boolean, matching the `sizing` prop shape the DS already uses. Implemented
   with `padding-left` / `padding-right` LONGHANDS, never the shorthand, so the
   sheet's bottom affordance padding and headerless top inset survive.
4. **`OverlayHeader` renders its own controls rather than composing
   `IconButton`.** `ButtonVariant` is `'primary' | 'secondary' | 'tertiary'`
   and none of the three is neutral, so R4 could not be met through
   `IconButton` without adding a variant Figma does not model.
5. **No hover or pressed rule on the header controls.** `249:177` models no
   interaction state on any of its three axes, and the standing rule is that a
   state Figma does not define is never added silently. `:focus-visible` IS
   added — that is the accessibility baseline, not an inferred state — and its
   ring stays primary, because R4 governs the resting icon colour, not the
   focus affordance.

### 8 · Figures

| | predicted | measured |
|---|---|---|
| tests / files | 735 / 65 | **735 / 65** |
| mutation proofs | one per new or rewritten test | **47, all valid** (2 after re-run) |
| `npx tsc -b --force` | exit 0 | **exit 0** |
| `build:tokens` diff | empty | **empty** |
| CSS registration | 62/62 | **62/62** |
| `style={` in non-test component `.tsx` | 14 in 9, unchanged | **14 in 9** |
| `:hover` / `@media (hover: hover)` | unchanged | **49 / 41** |
| component folders / CSS files | 51 → 53 / 60 → 62 | **53 / 62** |

## Gate 86 — a tap hook on the `HeaderBg` avatar (v2.9.0)

Built on `main` at `b5b7b29` (`v2.8.0`) and left uncommitted. Claude Code made
no git writes. Release notes are in `CHANGELOG.md` v2.9.0, and the props and
token rows are in `docs/component-tokens.md` under Header. The MVP needs a
settings screen that opens from Margaret's profile picture. Teku ruled
(Decision 3A, 9 Oct 2026) that the hook lands in the DS properly rather than
as an overlay button in the MVP. This gate covers that one subject.

### 0 · Premises, re-derived from disk

- **HEAD and tags.** HEAD = `v2.8.0^{}` = `main` = `origin/main`, with a clean
  tree. There are **29 tags**, all `vX.Y.Z`. `v2.9.0` is absent locally and
  on `origin`. The version field read `2.8.0` in both files.
- **CI has EIGHT steps, not seven**: Checkout, Set up Node, Install, token
  pipeline, drift check, CSS registration, Typecheck, Test. The two setup
  steps have no local equivalent, and the other six were run in order with
  each exit code captured. Baseline: **735 tests / 65 files**, all 0, and
  `git status` stayed empty after `build:tokens`.
- **There is no visual (pixel) suite.** No Playwright, no image snapshots.
  `check-tokens.mjs` and `check-ds-linkage.mjs` do not exist here; they live
  in the MVP (see Commands).
- **`dist/` is not tracked.** `.gitignore` lists `dist/`, and
  `git ls-files dist` is empty. A git-tag install builds it through
  `"prepare": "npm run build:lib"` (`package.json:27`), so a release has no
  built output to regenerate.

### 1 · Figma — every avatar state is undesigned

Read through the claude.ai connector (`whoami` → Teku Cheong). The local
`figma-desktop` server refused with ECONNREFUSED this session too.

- **DS file `xhA5ARVgSeD3gA41lYDqST`.** `Header/bg` `219:2813` has three
  variants on a `Type` axis only: `128:4886`, `390:639` and `219:2814`.
  There is no state axis. The avatar is a 32 × 32 instance (`390:644` →
  `I390:644;128:3532`; compact `220:2851`). The Avatar sets `103:3084` and
  `103:3094` carry a `Size` axis only. Bindings read from variant `103:3085`
  (Size=M 32): `Border Radius/round`, `border/subtlest/default`,
  `surface/Default/default` and `icon/subtle/default`. None is a state.
- **Case-study file `v9MI8jxTaXiJA234Hkanlf` has SEVEN pages.**
  `get_metadata` with no node lists only `0:1`. That list is incomplete:
  `use_figma` lists `0:1`, `298:13`, `1266:14164`, `1266:14272`,
  `1266:14163`, `1186:12718` and `447:3691`. `0:1` overflows `get_metadata`
  and `use_figma` alike; reduced to counts, it holds 44 top-level frames of
  research slides and no settings or profile frame. Every page was searched
  by name and text. **No avatar pressed, hover or focus frame exists.** No
  settings, profile or account screen exists either. The nearest matches
  are named here so nobody re-searches:
  - Onboarding_09: `1266:14353`, with copies at `381:6283` and `891:9580`
    ("Choose the settings that make the app most comfortable"). This is
    onboarding preferences, not a screen the avatar opens.
  - A desktop sidebar "Settings" nav item: `I466:6869;465:33167`, page
    `447:3691`.
  - `1360:18985` "Settings ---": a strip of Figma-panel screenshots, not an
    app screen.
- **The home (`1266:14402`) and overview (`1266:14331`) headers** draw the
  avatar at rest only.

### 2 · API as shipped

```ts
type HeaderBgAvatarTapProps =
  | { onAvatarClick?: undefined; avatarAriaLabel?: undefined }
  | { onAvatarClick: () => void; avatarAriaLabel: string }
export type HeaderBgProps = HeaderBgBaseProps & HeaderBgAvatarTapProps
```

The names follow the repo's existing pattern. Event props are
`on<Thing>Click`, as in `HeaderBg`'s own `onNotificationsClick`; `Button` and
`IconButton` use `onClick`. Name props are `<thing>AriaLabel`, as in
`iconAriaLabel`, `searchAriaLabel` and `moreAriaLabel`; `IconButton` uses
`ariaLabel`. **`HeaderBgProps` changed from an `interface` to a type alias.**
`interface X extends HeaderBgProps` no longer compiles. A read-only grep of the
MVP's `src` found no reference to `HeaderBgProps`. `HeaderBgBaseProps` and the
union are not exported, because `Header/index.ts` was outside the edit list.

### 3 · No handler, no change — and the proof of it

Before the first edit, `renderToStaticMarkup` was captured for **22 prop
combinations**:

- every render in `HeaderBg.test.tsx` and the showcase;
- variant × four avatar sources;
- each variant with every other optional prop.

That gives 18 distinct strings. The full strings are kept outside the repo,
in the gate hand-over. `HeaderBg.avatar.test.tsx` pins each case's sha256.
Without a handler, the component returns the same `<Avatar size="m"
src={avatarSrc} name={avatarName} />` expression it always did. It passes no
`alt`, so `alt ?? name ?? ''` resolves exactly as before.

**Hazard, for anyone writing a markup pin around an `<img>`:** React 19's
`renderToStaticMarkup` hoists `<link rel="preload" as="image" href="…"/>` to
the front of any root that renders an `<img src>`. A standalone `Avatar`
render therefore does NOT appear verbatim inside a `HeaderBg` render. The
first draft of the "changes nothing else" test failed on exactly that. It now
strips that exact prefix, after asserting it is present.

### 4 · States (all undesigned), hit area, layout

| | treatment | source in the DS |
|---|---|---|
| focus | `--brand-scale-50` solid `--mapped-border-primary-default`, offset `--brand-scale-50`; `border-radius: 50%` | the notify button's own `:focus-visible` in this file, declaration for declaration; the radius follows Avatar.css's circle |
| hover | `--mapped-surface-overlay-hover` on a `::before`, inside `@media (hover: hover)` | Tag's `overlay` appearance |
| pressed | `--mapped-surface-overlay-label-pressed` on `:active` | Tag's `overlay` appearance |

Tag's `overlay` is the DS's one control drawn over imagery, and its three
tokens are **theme-invariant** (light block and dark block identical). That is
the property `HeaderBg`'s photo chrome already depends on. This is a choice
taken inside the brief, flagged for Teku; the alternatives are in the release
hand-over.

- **Hit area: 48px.** It comes from `::after` at
  `inset: calc(-1 * var(--brand-scale-200))`, i.e. 32 + 2 × 8, out of flow.
  There is no 6px ramp step, so 44 was not reachable with a token. The DS had
  no 44px precedent to copy: `OverlayHeader`'s controls are 32px, and the
  sibling notify button is a bare 24px.
- **Layout.** The button is a flex box (THE WRAPPER RULE) with zero padding.

Measured live in the showcase (1265 `clientWidth`, DPR 1.25, transitions
finished):

- **Layout.** With the button unwrapped in place, the header, row, group,
  avatar, greeting and notify rects were **identical** to the wrapped ones.
- **Hit area.** `elementFromPoint` hits the button 7px outside the avatar on
  every side and misses at 9px.
- **Keyboard.** Real Enter and Space presses moved the tap counter 0 → 2.
- **Focus.** `:focus-visible` matched after the keypresses. The outline
  computed `rgb(4, 110, 255)`, the same as the notify button's token.
- **Hover.** A real pointer hover computed the wash at
  `rgba(13, 15, 17, 0.7)`.
- **Tokens by theme.** The hover, pressed and focus tokens read identical
  under `data-theme="dark"`. The toggle was proven effective by
  `--mapped-surface-page` flipping from white to black.

`:active` was **not** observed live, because the harness cannot hold a pointer
down. The CSSOM confirmed the rule loaded, and the test pins its token.

The demo's initials avatar renders 33.6px, not 32: that is `.mn-avatar--initials`'
1px content-box border at DPR 1.25. It is pre-existing, the same with or
without the button, and not this gate's concern.

### 5 · Tests and proofs

**735 → 779, 65 → 66 files.** All 44 are in the one new file. Existing test
files are unedited.

- **24, no-handler pins.** One test checks the hash set; 22 pin each case;
  one asserts "no avatar button".
- **14, with a handler.**
  - "native button" ×3
  - "adds only the wrapper and `alt=""`" ×3
  - click, native-and-focusable, and decorative image
  - "name from the label alone" ×4, one per avatar source
  - axe
- **1, the type test.** Two `@ts-expect-error` lines, compiled by `tsc -b`.
- **5, CSS.** focus, pressed, hover, rest, and hit area.

jsdom does not turn Enter or Space into a click, so the keyboard test asserts
the preconditions: a native, enabled, focusable `<button>`. The keypress itself
is the browser measurement above.

**Mutation proofs: a negative control and 45 mutations, M1–M45.** The
negative control reported NO PROOF, as required. All 45 mutations proved.
Every vitest proof read `1 failed | 43 skipped`, and each failed AT its
target assertion's line. Every mutation is type-valid. The driver, the full
table and the log are in the gate hand-over, not in the repo. The negative control ran first, and the
run selects one test by an exact, regex-escaped, `$`-anchored title. It typechecks every mutation and refuses one that does
not compile. The two type-test proofs are proofs BY typecheck: each makes one
`@ts-expect-error` unused, and `tsc -b` must fail with TS2578 at that line.
Each restore was sha256-identical and re-read `1 passed`. **One false STOP on
the first run:** M1 deletes a line above its own assertion, so the assertion
moves from line 157 to 156. The driver compared against 157. The target line
was corrected; the assertion is unchanged.

### 6 · Tooling hazard, new

- **`grep -c $'\r$'` from Git Bash is not a line-ending scan.** It reported
  106 CRLF lines in `HeaderBg.tsx`, a file that holds 106 bare LFs and no CR
  at all (byte scan, agreeing with `git ls-files --eol`).
- **This gate's working-copy line endings.** `HeaderBg.tsx` and the new test
  are LF. `HeaderBg.css`, `package.json`, the lock file, `CHANGELOG.md`, this
  file, `docs/component-tokens.md` and `showcase/App.tsx` are CRLF. Every edit
  kept its file's endings, verified by byte scan.

## Known open items
- **Heading font-size in source**: Figma composites wire `{fontSize.N}` (static), not a
  responsive token. Resolved at build time by mapping heading keys → responsive vars.
  If Figma fixes the composites, update `build-typography.mjs` accordingly.
- **paragraphSpacing / paragraphIndent**: intentionally ignored — document-level
  properties, not relevant for inline CSS classes.
- **OPEN DECISION — the teal gradient family (Gate 31, 2026-08-27).** Two MVP
  sites want a teal gradient pair. **Nothing was shipped** — this is derivation
  only, recorded so a successor does not re-derive it.

  Only **three** mapped surface tokens are bound to the teal ramp, and all three
  are **theme-invariant by binding**: `globals.css:446-448` (light) and
  `:641-643` (dark) carry identical bindings, verified resolved in both themes.
  Emission for a pair like this happens once on `*`, never `:root` — verified on
  the shipped pair, not assumed.

  | # | from - to | tokens | computed worst | rendered worst | worst point | AA |
  |---|---|---|---|---|---|---|
  | T1 | teal-700 - teal-900 | `--mapped-surface-information-default` / `-pressed` | 6.3611 | 6.3611 | **from** (teal-700) | pass |
  | T2 | teal-700 - teal-800 | `--mapped-surface-information-default` / `-hover` | 6.3611 | 6.3611 | **from** (teal-700) | pass |
  | T3 | teal-800 - teal-900 | `-hover` / `-pressed` | 10.4697 | 10.4697 | **from** (teal-800) | pass |
  | T4 | teal-600 - teal-800 | *no mapped token exists for teal-600* | 3.9480 | n/a | **from** (teal-600) | **FAIL** |

  **The finding is the ceiling, not the shortlist.** Every teal step at 600 and
  lighter is under AA against white (teal-600 = 3.95) *and* has no mapped surface
  token, so a light, vivid teal band carrying white text **cannot be built from
  this ramp** — it needs both a new mapped token and a text colour other than
  white. T1 is the widest compliant range.

  Calibration, and why arithmetic is not a lower bound on the render: the
  **shipped** brand band (`#0358cc` to `#006789`) computes 6.3611 at its worst
  endpoint but **renders 6.3025**, at 94% along, pixel `rgb(1,103,142)` —
  dithering, -0.0586. That band crosses hues, so interpolation leaves the ramp.
  The three teal candidates stay on one ramp and their rendered worst equals their
  computed endpoint exactly. Swatch file lives in the session scratchpad, outside
  the repo: `teal-gradient-candidates.html`.

- **OPEN — every component CSS rule is present TWICE in the dev CSSOM.** Measured
  in the showcase at Gate 31: each `.mn-checkbox` / `.mn-radio` rule appears at
  two distinct rule indices (~148 and ~1031), because the component’s own
  `import` of its CSS and `src/styles/package.css`’s `@import` chain both load
  it. Harmless to the cascade (the copies are identical, so later-wins picks the
  same declaration). **The built bundle does NOT duplicate** — checked at the same
  gate: `.mn-checkbox__box--marked` occurs 8 times in `src/.../Checkbox.css` and
  exactly 8 times in `dist/index.css`, i.e. one copy, so this is a dev-server
  artifact only and never reaches a consumer. Noted so nobody re-derives it.
- **Per-layer scripts**: consider consolidating into a single `npm run build:tokens`
  that runs all five in order. Style Dictionary is a longer-term option if the
  pipeline grows complex.
- **RESOLVED — `on-color`/`Interactive.on-color` dark-mode bindings, plus a
  broader dark-mode token audit/repair.** In `Mapped/Dark.json`, the entire
  `on-color` family (`text.on-color.heading/body`, `text.*.on-color`,
  `icon.*.on-color`, `border.on-color`, `Blanket.on-color`,
  `surface/border.Interactive.on-color`) was bound to `Foundations.black`
  (verified in the JSON). These tokens describe content on a *fixed* colored
  surface that doesn't flip with the app theme, so black bindings were a real
  semantic error.
  - **FIXED (2026-07-22, manual JSON edit — user maintains Figma but exports
    manually), in two passes:**
    1. `surface/border.Interactive.on-color{,-hover,-pressed}` → white /
       neutral-100 / neutral-200 (surface) and white / surface-100 /
       surface-200 (border), matching Figma's Inverse-variant dark values —
       the family `Button`/`IconButton` depend on. Those two components were
       also refactored to collapse the old `inverse` appearance into
       `[data-theme="dark"]` (no more `appearance` prop) — see
       `docs/component-tokens.md`'s Button entry.
    2. A dark-mode audit (read-only phase, then applied by explicit
       cluster-by-cluster approval) found the same black-binding pattern
       across **most of** the `on-color` family plus two more clusters: the
       neutral surface ramp (`subtlest`/`subtle`/`default`) resolving to
       *light* grays on a black page instead of dark ones, and
       `primary.default-subtle` hover/pressed/selected collapsing to
       page-black (invisible feedback). All three clusters fixed by
       re-pointing existing tokens in `Mapped/Dark.json` only — no new
       tokens, no `:root`/light-mode changes (verified byte-identical after
       each cluster). Fixed real breakage in `Badge` `default` (text
       contrast was 1.03, now 10.24), `Toast`/`ToastMobile` icons, `Chips`,
       `Tab`/`MenuItem`/`Select`-family hover-selected states, and
       Avatar/ProgressBar/Slider/RangeSlider track fills.
  - Zero component-code changes were required for this repair — it was
    entirely a `Mapped/Dark.json` → regenerate fix, per the pipeline's
    light/dark block separation (see `build-mapped.mjs`).
  - **⚠️ CORRECTION (2026-08-07): that audit was PARTIAL, not complete.**
    This entry previously claimed the pattern was fixed across "the
    **entire** `on-color` family". It was not. **Three members still
    flip**, found while building `LineChart`'s `onColor` chrome:

    | Token | light | dark |
    |---|---|---|
    | `--mapped-text-on-color-caption` | `neutral-100` `#e7eaed` | `neutral-950` `#0d0f11` |
    | `--mapped-text-on-color-label` | `neutral-100` `#e7eaed` | `neutral-950` `#0d0f11` |
    | `--mapped-text-on-color-placeholder` | `neutral-100` `#e7eaed` | `neutral-950` `#0d0f11` |

    `--mapped-text-on-color-heading`, `--mapped-text-on-color-body` and
    `--mapped-border-on-color` are correct (white in both).

    These describe content on a *fixed* coloured surface that does not
    flip with the theme, so a near-black dark binding is the same
    semantic error the audit set out to fix. **Not fixed here** — logged
    as **E-3** for the token-layer pass. The point of this correction is
    that the file previously asserted they were fine, which is why nobody
    looked again.

  - **✅ CORRECTION (Gate 34, 2026-08-29): E-3 is CLOSED, and the three-token
    table above is stale.** Measured from the generated `globals.css` by
    resolving the full `var()` chain in both themes — all three now resolve
    `#e7eaed` in light **and** `#e7eaed` in dark. The `neutral-950` bindings are
    gone. `CHANGELOG.md`'s v1.6.0 entry records the repair ("Item 4 · E-3
    closed"); this file was never updated to match, so it has been carrying a
    fixed defect as open for two releases. The table is left in place because
    the *shape* of the defect is the thing worth remembering — it is now the
    thing test 6 and test 7 of the token-coverage suite exist to catch — but do
    not act on it as a live finding.

  - **⚠️ NEW, Gate 34: FOUR `on-color` tokens do still differ between themes.**
    Found by writing the theme-invariance assertion and watching it fail. This
    is a different set from E-3's — none of these is a near-black binding.

    | Token | light | dark | Δ luminance |
    |---|---|---|---|
    | `--mapped-text-disabled-on-color` | `#b6bfca` 0.5147 | `#8695a7` 0.2935 | −0.2212 |
    | `--mapped-icon-disabled-on-color` | `#b6bfca` 0.5147 | `#8695a7` 0.2935 | −0.2212 |
    | `--mapped-surface-interactive-on-color-hover` | `#f2f2f2` 0.8879 | `#e7eaed` 0.8195 | −0.0684 |
    | `--mapped-surface-interactive-on-color-pressed` | `#e5e5e5` 0.7835 | `#cfd5dc` 0.6602 | −0.1233 |

    **The bottom two are DELIBERATE** — the v1.6.0 pass set
    `surface.Interactive.on-color{-hover,-pressed}` to neutral-100 / neutral-200
    in dark on purpose, "matching Figma's Inverse-variant dark values". They are
    listed here so a successor does not re-file them as defects.

    **The `disabled` pair is unexplained** and is the open question. It is the
    same semantic class as E-3 (content on a fixed coloured surface should not
    follow the app theme) at a much smaller magnitude. Fixing it means editing
    `Mapped/Dark.json`, which is a Figma-source decision — **Teku's, not
    Claude's.** Not fixed at Gate 34.

    This is why test 6 asserts a **luminance floor** rather than
    theme-invariance. The floor is derived, not fitted: the lowest luminance
    across all 53 `on-color` tokens in both themes is **0.2935**; E-3's defect
    value `#0d0f11` is **0.0047**. The threshold sits at **0.15** — ~2× headroom
    above every legitimate value, ~30× below the defect it exists to catch. The
    stricter assertion would have needed a four-name exception list, i.e. the
    hand-maintained array this gate was built to avoid.

- **OPEN — the pairing rule has no automated gate, and Gate 34 deliberately did
  not ship one.** Two formulations were built and measured; neither is
  shippable as-is.

  1. **Layer-mixing** (the letter of the rule: alias on one side, mapped on the
     other, same rule). Returns **3 hits** — `Badge.css .mn-badge--dark`,
     `Chips.css .mn-chips--default.mn-chips--bold`,
     `.mn-chips--success.mn-chips--bold`. **All three are false positives**: the
     mapped half is an `on-color` token, which is theme-invariant, so the pair
     cannot drift. The layer is the wrong thing to test.
  2. **Flip-parity** (the *purpose* of the rule: exactly one half changes
     between themes). Returns **6 hits**, all mapped-on-mapped and therefore
     outside what the written rule prohibits:

     | file | rule | mismatch |
     |---|---|---|
     | `Badge.css` | `.mn-badge--inverted` | bg `--mapped-surface-page` flips, `color` static |
     | `CardMonthlyBudget.css` | `__add-icon` | bg `--mapped-icon-subtle-default` flips, `color` static |
     | `LineChart.css` | `__marker` | **false positive** — `border` colour is `currentColor` |
     | `Tab.css` | `:focus-visible` | **false positive** — `outline` is width + a static border token |
     | `Tag.css` | `--default:hover` | bg `color-mix(…)` static, `border-color` flips |
     | `Tag.css` | `--default:active` | bg `color-mix(…)` static, `border-color` flips |

     Four survive scrutiny (`Badge`, `CardMonthlyBudget`, two in `Tag`). They
     are **not rule violations** — both halves are mapped, which the rule
     explicitly permits — but the rule's stated reasoning ("they flip together")
     is not true of them. Either the rule's wording or these four call sites is
     wrong, and which one is **Teku's call.**

  Shipping either check would have meant a whitelist to get it green, which is
  the failure class §3's detector was built to avoid. Reported, not asserted.

  **✅ MEASURED (Gate 35, 2026-08-29). Three of the four are harmless; the fourth
  is an already-recorded token gap, not a call-site defect. Nothing was fixed and
  the rule was not rewritten.** Full figures live in `CHANGELOG.md` known gap #19
  — recorded in both files deliberately, per gap #17's hazard. The four survivors
  and both false positives re-derived exactly; the falsifier is clear (every token
  resolves to a flat hex in both themes, no gradient, no scrim).

  **Every translucent figure names the backdrop it was composited over. A bare
  number for a `color-mix(…, transparent)` fill is not comparable to anything.**
  `Badge` and `CardMonthlyBudget` are opaque on both halves, so no backdrop
  applies to them; both `Tag` rules are translucent and are given twice.

  | pair | threshold | worst measured cell | verdict |
  |---|---|---|---|
  | `Badge` `--inverted` | 4.5 body | light, `#046eff` on page `#ffffff` — **4.4876** | **fails** — but see below |
  | `CardMonthlyBudget` `__add-icon` | 3.0 graphical | dark, `#ffffff` on `#8695a7` — 3.0565 | passes, **0.0565** headroom |
  | `Tag` `--default:hover` | 3.0 border / 4.5 label | dark on **elevation `#262626`** → fill `#232d3c` — 4.1596 | border ✅ / **label ❌** |
  | `Tag` `--default:active` | 3.0 border / 4.5 label | dark on **elevation `#262626`** → fill `#1f3451` — 5.1474 | passes both |

  Over the **page** backdrop instead, the same two `Tag` rules measure 5.6021
  light / 5.9217 dark (hover, fill `#e6f1ff` / `#000b1a`) and 7.0980 light /
  7.4198 dark (active, fill `#cde2ff` / `#011633`) — all passing. In light the two
  backdrops are the same colour (`--mapped-surface-page` and
  `--mapped-surface-elevation-default` both resolve `#ffffff`), so they diverge
  only in dark. **Dark-on-elevation is the only failing cell in the entire set.**

  **One measurement, two thresholds — not two findings.**
  `--mapped-border-primary-default-hover` and `--mapped-text-primary-default-hover`
  are **different tokens that resolve to the identical value** in both themes
  (`#0358cc` / `#368bff`); same for the `-pressed` pair (`#024299` / `#68a8ff`).
  So `Tag`'s border and its label are the same colour on the same fill, judged
  against 3.0 as a UI boundary and 4.5 as 14px text. The border passes 4.1596 and
  the label fails it. Any future table here must carry both readings or it will
  under-report the way the first Gate 35 pass did.

  **`Badge --inverted` is not a new finding.** It is gaps #13 and #14 seen again:
  gap #14's table already recorded `Badge inverted 4.49 ❌ / 4.68 ✅`, so gap #19's
  claim that "none of the four has been contrast-measured" was false when written.
  The figure is **4.4876** (`#046eff` luminance `0.18397673`; `1.05 / 0.23397673`).
  *An earlier Gate 35 draft wrote `4.4870` in prose for this same pairing — that
  was a transcription slip from a hand computation, wrong in the fourth decimal.*

  **The token is a system-wide finding, and it fails in BOTH themes.** It is a
  text colour in **9 declarations across 8 components including `Link`**, every one
  at **4.4876** against white in light. Two of them — `CardBalance.css:84` and
  `CardMonthlyBudget.css:48` — sit on `--mapped-surface-elevation-default`, which
  is `#262626` in dark, where the same token measures **3.3723**. Gap #13's
  recorded `4.68 ✅` dark figure is the *page* reading only. ~~Moving the token is
  gap #13's Figma-source decision, **Teku's call.**~~

  **✅ RESOLVED at Gate 36 (v1.14.0). Every figure in the paragraph above is now
  historical, and the census in it is an UNDERCOUNT — see below.** The token
  moved: light `#046eff` → `#0358cc`, dark `#046eff` → `#68a8ff`, with `-hover`
  and `-pressed` following. `Badge --inverted` now measures **6.4187** light /
  **8.6337** dark. Do not carry 4.4876 or 3.3723 forward as live figures.

  **Two things the flip-parity table got wrong about its own false positives.**
  `Tab.css :focus-visible` was dismissed because "`outline` is a width token plus
  a static border token" — but the declaration does carry a colour token and the
  rule *is* a real mismatch. It passes anyway (4.4876 / 4.6795 against 3.0), and
  the better reason to discount it is that `outline-offset` puts the ring outside
  the tab's own background entirely. `LineChart __marker` is a correct dismissal.

  **The lesson for any future gate: flip-parity is not by itself evidence of a
  defect.** Three of the four mismatch and pass. A gate built on formulation 2
  would have flagged four call sites needing zero code changes.

  **Separately — a hazard no rule-scoped check can see.** `Tag`'s label colour is
  set in a *sibling* rule, so nothing that compares declarations within one rule
  will pair it against the fill. Measured, a `Tag` hovered **inside a card in dark
  mode** puts `#368bff` on `#232d3c` at **4.1596**, under the 4.5 its 14px label
  needs. Over the page surface `#000000` the identical rule composites to
  `#000b1a` and measures 5.9217, which passes — the fill is a
  `color-mix(…, transparent)`, so its rendered value depends on the backdrop.
  **Any measurement of a translucent fill is incomplete unless it says which
  backdrop it assumed.** Not fixed; needs a token or design decision.

- **✅ RESOLVED (Gate 37, v1.15.0) — sticky hover is guarded. The "touch
  feedback" label is retired, not deferred again.** Full derivation in
  `CHANGELOG.md` v1.15.0 and known gap #21; recorded in both files per gap #17's
  hazard. Scope from these facts, do not re-derive them.

  **Do not reopen anything under the name "touch feedback."** That label rode
  from Gate 27 to Gate 35 with no scope record anywhere in this repo and a false
  v1.7.0 attribution — Gate 35 searched this file, every CHANGELOG gap, all
  `docs/`, all 13 `MONARCH-CHAT-HANDOFF-*.md`, the roadmap's parked table and
  every commit message on every branch, and found the string `touch` used only as
  the past-tense verb "touched". The label named no work. **It is closed.** The
  one real defect hiding behind it is fixed below; anything genuinely new about
  touch input starts from a Figma read and is Teku's call, under its own name.

  **What shipped:** every plain `:hover` rule in the DS is wrapped in
  `@media (hover: hover)`, so hover styling can no longer persist after a tap.
  **39 rules across 17 component CSS files, 69 selector→declaration pairs.** No
  token value moved, no API changed, no interaction state invented — a
  hover-capable media query *removes* an unintended state, which is why this
  stayed clear of the standing rule that a state Figma does not define is never
  added silently.

  **Gate 35's figures were re-derived at Gate 37 and two of the three were
  wrong. Use these.**

  | fact | Gate 35 said | measured at Gate 37 |
  |---|---|---|
  | components declaring `:active` | 11 of 49, 28 declarations | **11 files — confirmed.** 28 is a raw `:active` *occurrence* count and reproduces exactly, but 2 of `ToggleChip`'s 4 are `:not(:active)` negations inside hover rules. Genuine: **26 occurrences, 24 rules** |
  | `-press`/`-pressed` mapped tokens | 56 distinct, 56/56 light/dark | **57 distinct, 57/57.** Off by one, and it predates Gate 36 — v1.13.0 also holds 57, with identical name sets |
  | touch-vs-mouse distinction | none anywhere | **confirmed at the time.** Now 39 `@media (hover: hover)` blocks; still zero `@media (pointer: …)` and zero `-webkit-tap-highlight-color` |

  The 57th token is `--mapped-text-information-on-color-pressed-2`. Gate 35's 56
  = 55 names ending `-pressed` plus the known outlier
  `--mapped-text-error-default-press`; a name containing "pressed" but not
  *ending* in it was missed. **A `press` census here must not anchor on a suffix.**

  **Two things a successor should not re-derive.**

  1. **The `:focus` hazard the brief predicted does not exist.** No `:hover` rule
     shares a block with `:focus`/`:focus-visible`. Seven mention `:focus-within`
     and all seven are `:not(:focus-within)` negations *inside* hover rules.
     Verified live: **60 `:focus-visible` rules, 0 gated.**
  2. **The real hazard is `previewState`.** 23 of the 39 rules paired `:hover`
     with a prop-driven forced-state selector in the same block —
     `.mn-<block>--hover` (18) or `[data-preview="hover"]` (5, all `Link`).
     Gating those would make a public prop silently inert on touch, i.e. an API
     change. All 23 were split; the forced half is ungated. Verified live: **52
     forced-state rules, 0 wrongly gated.**

  **⚠️ The obvious way to verify this is worthless, and Gate 37 nearly reported
  it as evidence.** Emulating a touch device and pointing at a component shows
  the resting colour — but it shows *exactly the same thing with the guard
  removed*, because the harness's pointer action never produces a `:hover` match
  under Chrome touch emulation. The guard was removed from three real rules
  (`MenuItem`, `Button`, `Tab`), the page fully reloaded, the CSSOM confirmed
  them ungated, and the reading did not move. **Verify the media condition with
  an A/B probe instead** — one identical declaration inside
  `@media (hover: hover)` and one outside — which measures `rgb(255,255,255)` vs
  `rgb(11,22,33)` under `hover: none` and both applying under `hover: hover`.

- **✅ RESOLVED (Gate 36, v1.14.0) — the primary accent ramp moved, and three
  things the record had wrong.** Full derivation in `CHANGELOG.md` v1.14.0 and
  gaps #13, #22, #23; recorded in both files per gap #17's hazard. Scope from
  these facts, do not re-derive them.

  `--mapped-text-primary-default` / `-hover` / `-pressed` now resolve:

  | theme | rest | hover | pressed |
  |---|---|---|---|
  | light | `#0358cc` (600) | `#024299` (700) | `#022c66` (800) |
  | dark | `#68a8ff` (300) | `#9bc5ff` (200) | `#b4d4ff` (150) |

  **20 of 69 measured text cells failed AA before; 0 fail now**, worst 4.8638,
  every cell clearing a 0.30 margin floor. `--mapped-border-primary-*` and
  `--mapped-icon-primary-*` were deliberately NOT moved.

  **1 · The census this repo carried was an undercount.** Gap #13 said 9
  declarations across 8 components. Disk holds **12 across 9**, and **22 across
  11** including `-hover`/`-pressed`. The three missed are `Button.css:107`,
  `:124`, `:142` — invisible to a `color:`-scoped grep because Button assigns
  through a `--btn-text` indirection and consumes it one rule later. **Any future
  token census in this repo must follow indirections, not just `color:`.**

  **2 · Text and border MUST diverge, and that was measured.** All 33 border
  cells already passed 3.0, so the border family needed no move — and moving it
  anyway is *strictly worse*. The selected-tint fills in `ToggleChip`,
  `MenuItem` and `Tag` are `color-mix()` washes derived FROM
  `--mapped-border-primary-default`, so darkening the border darkens the backdrop
  the text sits on and the text chases its own fill: measured, moving both
  families **reintroduces 4 text failures** (worst 4.0050). The visible
  consequence is deliberate — a primary border and a primary label are now one
  ramp step apart where they co-occur, and a selected nav item pairs a blue-500
  icon with a blue-600 label.

  **3 · A token move cannot fix a binding error, and can deepen one.** The
  dark-mode primary `Button` inverts to a WHITE fill
  (`--mapped-surface-interactive-on-color` is `#ffffff` in **both** themes) while
  its label took the dark ladder, which runs *lighter*: **4.4876 / 2.7630 /
  1.6452** rest/hover/pressed. The ramp move would have taken the pressed cell to
  **1.0291**. It is arithmetic, not taste: in dark
  `--mapped-text-primary-default` must serve both `#ffffff` and `#000000`, and
  the ceiling for any single colour against both is **4.5826**. Fixed at
  `Button.css:142-144` by binding to the light ladder directly
  (`--brand-blue-600/700/800`), the buttons-only exception `--btn-bg-hover`
  already takes. Now **6.4187 / 7.7569 / 9.1362**.

  **⚠️ The DS has NO theme-invariant `--mapped-text-*` token that is a dark
  accent colour** — verified across all 54 in both themes. The only one was
  `-default` itself, and this release removed that property. **If a second
  component ever needs an inverse accent label, build a named family
  (`--mapped-text-primary-on-light`) rather than copying Button's exception.**
  That needs the Figma source and is Teku's call.

  **A re-export will undo this.** `Mapped/Light.json` and `Dark.json` were
  hand-edited (6 values, `text.primary.default{,-hover,-pressed}`), the same way
  `Dark.json`'s other repairs are maintained. Teku's Figma variables panel still
  describes the OLD binding, and it disagreed with disk in three places even
  before this gate — see the next item.

- **⚠️ OPEN — the Figma variables panel and this repo disagree about the primary
  text family, in both directions (Gate 36).** Reported to Gate 36 as the Figma
  state and checked against disk; all three points differ:

  | panel [reported] | disk before Gate 36 [verified] |
  |---|---|
  | default = Primary/500 light, **Primary/600 dark** | 500 light, **500 dark** |
  | default-hover = 600 light, **Primary/500 dark** | 600 light, **400 dark** |
  | on-color pair = white light, **black dark** | white light, **white dark** |

  The first is load-bearing: **`-default` was the only member of the family that
  did not flip between themes**, and that asymmetry was the defect Gate 36 fixed.
  The third matters too — had the panel been right, the `on-color` family would
  carry E-3's black-binding defect that v1.6.0 already repaired.

  **Nothing in Figma was changed.** Correcting the panel is Teku's, and until it
  is corrected a Token Studio re-export will silently revert v1.14.0's six values.

- **OPEN — `ToggleChip`'s selected border fails 3.0 against its OWN pressed fill
  in dark on elevation, 2.7900 (Gate 36, gap #23).** Pre-existing and *improved*
  by v1.14.0 (2.6672 → 2.7900), not caused by it. Left alone deliberately: the
  boundary that identifies the control is the border's OUTER edge against the
  surface behind it, which passes at **3.3723**, and every available fix makes
  something else worse. Noted because the cell was **missing from Gate 36's own
  Phase 2 border census** and surfaced only in the Phase 4 re-run — a
  border-against-its-own-fill pairing is easy to omit when both halves come from
  one token.

## Component roster — current state

**50 component folders are built** (`ls src/components/`), exporting **60
distinct components** — four folders each hold a tightly-coupled family
(`Card` 7, `Item` 3, `Header` 2, `Navigation` 2 — see Component rules), which
is exactly the difference of 10; this line has always counted FOLDERS. Those 50
folders also export **4 non-component values** (`Logo`'s `LOGOS`, `LOGO_MAP`
and `LOGOS_BY_CATEGORY`, plus `Toast`'s `TOAST_DEFAULT_ICON`), so a raw count
of named value exports is **64** — do not read that as a component count.
With **61 test files / 542 tests** and **48 showcase sections** (`<Section`
tags carrying an `id=`, counted with a parser — a line-scoped
`grep -c "<Section id="` returns **47**, which is the previous value and is
wrong for the reason recorded below). **59 component `.css` files**, all 59
registered in `src/styles/package.css` — no longer a hand derivation, see the
registration detector.

Every figure in this paragraph was re-derived from disk at Gate 42, 2026-09-02.

> **Gate 66 (v2.5.0), 2026-09-24:** the test figures above are stale. Measured
> by `npm test`: **62 test files / 618 tests** (Gate 62 → 579, Gate 62b → 584,
> Gate 66 → 618). Folder, component and CSS-file counts are unchanged by Gate 66
> — it added props to `CardMonthlyBudget`, `ChartLegendItem` and `Button`, no
> component, no `.css` file and no showcase `<Section>`.

**✅ RESOLVED (Gate 40) — the showcase-section figures agree, and always did.**
This entry used to warn that `47` and `55` "do not agree and the gap is 8, so do
not quote `47` as verified". Both are correct and the gap IS the Foundations
tab. Re-derived from disk at Gate 40, `showcase/App.tsx` carries **55**
`<Section` opening tags and 55 closing ones, splitting as:

| | count | where |
|---|---|---|
| `<Section>` **with** an `id=` | **47** | all in the Components tab |
| `<Section>` **without** an `id=` | **8** | all in the Foundations tab |

So "47 showcase sections" counts the Components tab, which is what the roster
line above is about, and 55 counts every `<Section>` element in the file. Both
may be quoted as verified.

**Count the `id=` with a parser, not a line-scoped grep.** A `<Section id=`
grep returns **46**, not 47, and the missing one is not id-less — it is
`select-wallet-account`, whose opening tag is written across several lines with
`id=` on the line *after* `<Section`. A first Gate 40 pass took that 46 at face
value and invented a nonexistent "id-less Components section" to reconcile it
against 55. The arithmetic came out right and the derivation was wrong, which is
the failure mode worth remembering here.

**Gate 42 re-derived the same three figures on 2026-09-02: 56 / 48 / 8** — and
the `<Section id=` grep now returns **47**, which is Gate 40's *correct* value
above, so the broken form now reads as confirmation of the stale figure rather
than as the off-by-one it still is.

The component and test-file counts WERE re-derived at Gate 42, 2026-09-02, and
are correct: **50 folders, 61 test files**. (Gate 32 measured 49 folders / 59
test files, correct when taken.)

> **Test count history.** This line read *472 tests* and was stale by one: it was
> recorded on 2026-08-11 *before* commit `6bacfe8` landed later the same day,
> which added `it('defaults to size l')` to `ElementWrapper.test.tsx` (it also
> renamed two tests, netting zero). The v1.3.0 baseline is therefore **473**.
> The v1.4.0 gap batch added **14** tests — `Label.tone` (4), `Link.weight` (6:
> a 2×2 `it.each` matrix plus a default-preservation and an `m`-invariance case),
> `Icon` `logo_monarch` + size `xl` (2), and `ListItem` chart-slot gating (2) —
> for a current total of **487**, with the file count unchanged at 59 (all
> additive: no new test files, no existing test modified). **Gate 32 (v1.11.0)
> added 7** — all `CardBalance.sizing`: the omitted-prop class string, the same
> with `className`, explicit `'fixed'` equalling omission, the `fill` modifier,
> modifier ordering before `className`, the `<button>` render, and axe — for a
> current total of **494**, again with no new test file and no existing test
> modified.
>
> **Gate 34 (v1.12.0) added 14, in the first NEW test file since the count was
> started**: `src/test/tokens.test.ts`, so the file count moves 59 → **60** and
> the test count 494 → **508**. Derivation, by `describe` block: token
> resolution 3, theme parity 2, theme-flip semantics 3, gradient emission 3,
> component consumption 1, resolver self-check 2. No existing test was modified
> and no component test was added — this file asserts on the generated token
> CSS, not on any component. Its helper `src/test/tokenCss.ts` is **not** a test
> file (no `.test.` in the name, so vitest does not collect it) and does not
> move the file count.
>
> **Gate 40 (v1.16.0) added 14, and the file count does NOT move — it stays at
> 60.** Both additions land in files that already existed: 12 to
> `src/components/Card/CardFeaturesAndEducation.test.tsx` (9 → 21, the `sizing`
> prop, 5 of the 12 from an `it.each` variant matrix) and 2 to
> `src/test/tokens.test.ts` (14 → 16, the touch-safe hover guard). Total
> 508 → **522**. No existing test was modified; one helper,
> `componentCssFiles()`, was lifted from a `describe` scope to module scope in
> `tokens.test.ts` so both checks share one filesystem-derived list.
>
> **Gate 42 (v2.0.1) added no tests. The jump to today's figures happened at
> v2.0.0, which left no entry here.** Re-derived from a full `npm test` run at
> Gate 42: **61 files / 542 tests** — so v2.0.0 moved the file count 60 → **61**
> and the test count 522 → **542**, a delta of 20. **That delta is NOT
> attributed.** Gate 42 measured the totals, not which files supplied them, so
> do not quote a per-file breakdown for v2.0.0 until someone derives one. Gate
> 42's own delta is zero: its only tree changes were three manifest lines and a
> `CHANGELOG.md` entry, neither of which vitest collects, and the suite ran
> 542/542 both before and after. The library
> is well past
"build the first component", which is what this section used to say.

Direction for what comes next lives in `MONARCH-BUILD-ROADMAP.md`, not here —
this file holds rules, that one holds the plan.

When a new component is added, the same three things are true every time:
- One component per folder, `src/components/<Name>/<Name>.tsx` + `index.ts`
  (families may share a folder — see Component rules).
- Consume only CSS vars (`--mapped-*`, `--spacing-*`, `--brand-scale-*`,
  `.type-*` classes). No hardcoded colors, spacing, or font sizes.
- Register it in **both** `src/index.ts` and `src/styles/package.css`. Missing
  the barrel fails `npm run build`; missing `package.css` fails nothing at all
  and ships the component with no CSS.

## Component rules
- Components consume our existing token CSS variables ONLY — never hardcode
  colors, spacing, radius, shadows, or type. Use var(--mapped-*), var(--spacing-*),
  var(--brand-scale-*) for radius/borders, var(--shadow-*), and the .type-* classes.
- Map interaction states to tokens: default/hover/pressed/subtle → the matching
  --mapped-surface-* / --mapped-text-* tokens (that's why they exist).
  **`--alias-*` never dark-flips** (the `[data-theme="dark"]` block only redefines
  `--mapped-*`).

  **THE RULE (rewritten v1.6.0): an alias token may not supply one half of a
  colour pair whose other half is a mapped token.** A "colour pair" is any
  background/foreground combination that must stay legible together —
  `background` + `color` on one rule, or a border against the surface it sits on.
  Mix the layers and the mapped half flips while the alias half does not, so the
  pair drifts apart in exactly one theme. Both halves alias is fine (theme-
  invariant by construction). Both halves mapped is fine (they flip together).

  After building or editing any component, grep its CSS for `--alias-`. **Every
  hit must be checked against its partner declaration**, not just the ones in
  interactive states. This grep is a required verification step, not optional.

  *Why it was rewritten.* The rule previously read: "an alias token in a
  hover/pressed/selected/focus rule is a bug … any hit in an interactive state
  must be replaced". That scoping was wrong, and the narrowness was the whole
  problem. Eight alias hits in `Chips.css` sat in **static variant** rules
  (`.mn-chips--removed.mn-chips--subtle`), passed the letter of the old rule at
  every audit, and were still broken: a static `--alias-error-100` background
  paired with a flipping `--mapped-text-error-default-hover` measured CR 4.17 in
  light and **2.84 in dark**. `Badge` carried the identical defect (`added` 1.77,
  `removed` 2.23 in dark) plus a raw `--brand-slate-600` — and was invisible to
  the grep entirely, because it had no `.css` file at all. Fixed in v1.6.0.
  The pairing test catches all of these; the interactive-state test caught none.
- **THE COMPANION RULE (added v1.10.0): an interaction state may not outrank a
  validity state.** A `:hover` / `:active` rule written as
  `.mn-x:hover:not(.mn-x--disabled) .mn-x__part` carries **more** specificity than
  the `--invalid` rule it competes with, so hovering an invalid control silently
  repaints it as a valid one. Guard every interaction rule with
  `:not(.mn-x--invalid)` exactly the way it already guards
  `:not(.mn-x--disabled)`. Disabled was guarded from the start and invalid was
  not — that asymmetry is the whole defect.

  *Measured, Gate 31 (2026-08-27), before the fix.* `Checkbox` and `Radio` carried
  the identical inversion, twice each. Their selector SETS are byte-for-byte
  parallel — a normalised `diff -u` of the two files differs only in
  DECLARATIONS — so this was never an inversion *between* the two components, as
  the review thread had it. It is one inversion present identically in both.

  | competing pair | specificity | wins |
  |---|---|---|
  | `.mn-checkbox__box--invalid.mn-checkbox__box--marked` | (0,2,0) | no |
  | `.mn-checkbox:hover:not(.mn-checkbox--disabled) .mn-checkbox__box--marked` | (0,4,0) | **yes** |
  | `.mn-checkbox--invalid .mn-checkbox__box:not(...--marked)` | (0,3,0) | no |
  | `.mn-checkbox:hover:not(.mn-checkbox--disabled) .mn-checkbox__box:not(...--marked)` | (0,5,0) | **yes** |

  Browser-measured consequence, **both themes**: an **invalid + checked** control
  sits at error red `rgb(188,63,66)` at rest and became primary blue
  `rgb(2,66,153)` on hover — the error affordance destroyed by a mouse-over. An
  **invalid + unchecked** control lost its error border to a grey. The showcase
  renders no `isInvalid isChecked` combination at all, which is why this was never
  seen. Fixed by adding `:not(--invalid)` to all four interaction rules in each
  file: by structure, no `!important`, no doubled class. Controlled revert
  confirmed the fix is not inert — guard removed, stylesheet reloaded, rendered
  value moved back to `rgb(2,66,153)`.

  **A unit test cannot catch this, and none was added.** `vitest.config.ts` sets
  no `test.css` option, so CSS imports are stubbed and no stylesheet is applied in
  jsdom; zero test files call `getComputedStyle`. Cascade defects in this repo are
  reachable only through a real browser. That is why the measurement above is the
  record rather than a test name.
- **RESOLVED (v1.10.0, Decision 2B) — the hover state that bound a DISABLED
  token.** Filed as an OPEN item by the Gate 31 audit; that note is gone from
  Known open items rather than left standing beside this one.

  `Checkbox.css`’s hover-unchecked rule set
  `border-color: var(--mapped-border-disabled-default)` while the *same rule* set
  `background: var(--mapped-surface-primary-default-subtle-hover)`.

  **In dark the collision is at the ALIAS level, not a coincidence of hex.** Both
  properties resolved through `var(--alias-surface-900)`, so the box outline was
  the same colour as its own fill — contrast **1.0000**, outline gone. It hit
  **every** unchecked checkbox on hover in dark, not only invalid ones.

  **Light was affected too, despite not being an exact collision.** Light bound
  `alias-surface-50` (fill) against `alias-surface-100` (border): different tokens,
  different hex, contrast **1.0633** — visually the same missing outline. The
  original OPEN note described this as a dark-only defect; that was wrong.

  **What the fix is NOT, so it is not re-attempted.** The first ruling was to
  rebind the *fill*, on the belief that Radio used a different one. It does not:
  measured by CSSOM declaration text, `Checkbox` and `Radio` bind the **identical**
  fill token and differ only in `border-color`. Rebinding the fill was therefore a
  no-op, and every non-colliding fill alternative moved light-mode appearance — so
  that route could not satisfy its own constraints.

  **The fix**: one line, `Checkbox.css:76`, `--mapped-border-disabled-default` to
  `--mapped-border-subtlest-default`, the token Radio already carried on the
  equivalent line. `globals.css` is untouched, so no disabled-state definition
  moves and no disabled control anywhere in the product changes. Afterwards the two
  components’ hover rules are byte-identical in declaration text.

  | theme | fill | border before / after | contrast before / after |
  |---|---|---|---|
  | dark | `#262626` *(unchanged)* | `#262626` / `#bdbdbd` | **1.0000 / 8.0551** |
  | light | `#f9f9f9` *(unchanged)* | `#f2f2f2` / `#cacaca` | **1.0633 / 1.5568** |

  Both after-figures equal Radio’s own measured values exactly, and the fill is
  unchanged in both themes. Controlled revert re-measured **1.0000** in dark with
  the rule reverted and the stylesheet CSSOM-confirmed reloaded, so the fix is not
  inert. `--mapped-border-disabled-default` retains exactly two usages across both
  files — `Checkbox.css:110` and `Radio.css:122` — both in genuine `--disabled`
  rules, which is where it belongs.
- **THE `sizing` PROP (v1.5.0 `CardFeaturesAndEducation`, v1.11.0 `CardBalance`)
  — a component that carries a fixed Figma width releases it through
  `sizing?: 'fixed' | 'fill'`, never through consumer CSS.** A consumer cannot
  widen a component past its own `max-width` without overriding DS rules from the
  app, which rule 3 forbids; both instances of this prop exist because an MVP
  screen hit exactly that wall and stopped. When a third component needs it, copy
  the shape rather than inventing one:

  | | |
  |---|---|
  | values | `'fixed'` (default, today's behaviour) and `'fill'` |
  | modifier | `.mn-<block>--fill`, declared **after** the base rule — equal specificity, so source order is what makes it win |
  | releases | `width: auto`, `max-width: none` |
  | retains | `min-width` — the Figma floor holds in BOTH modes, never reset |
  | also sets | `flex: 1 1 0` |

  **`flex: 1 1 0` is not decoration, and dropping the cap alone is not enough.**
  Without it the default `flex: 0 1 auto` sizes the card to its CONTENT, floored
  at `min-width` — measured at Gate 32 in a 600px flex row, `fill` renders
  **128px against `fixed`'s 161px**, i.e. NARROWER than the default while still
  passing a naive "differs from default" check. Grid items ignore flex properties
  entirely, so the one declaration serves a grid track and a flex line alike.

  **Verify this prop by DECLARATION, not by pixels.** `CardFeaturesAndEducation`'s
  `fill` was invisible at 375px because three tiles at their cap plus two gaps
  summed to exactly the content width by coincidence
  (`3 × 109 + 2 × 8 = 343 = 375 − 32`). Any container at or under the component's
  `max-width` renders the two modes identically and proves nothing. What proves
  the prop took effect is the modifier applying and computed `max-width` moving
  from a value to `none`. Both showcase demos are sized above the cap
  deliberately — 480px for the tiles, 440px for the balance cards.

  **The value names are deliberately identical across both components, and they
  are `'fixed'`, not `'hug'`.** The default is a literal fixed width (161px /
  109px), not a hug-contents box, so Figma's `hug` would name behaviour neither
  component has. A second vocabulary for one prop is the wart worth avoiding.
- **THE WRAPPER RULE (added v2.8.0): a wrapper around a fixed-size icon or
  control is a flex box with `align-items: center`, never an inline formatting
  context.** A block-level wrapper whose child is inline-block puts that child
  on a text baseline, so the line box reserves descender space *below* it and
  the wrapper renders taller than the thing it wraps. Nothing about this is
  visible in the markup, nothing fails, and no token is involved — the row is
  simply the wrong height, and the design source is the only place the
  discrepancy shows.

  *Measured, Gate 73-B.* `.mn-menu-item__control` was `flex: 1 0 0` with no
  `display`, so it was a block box holding an inline-block `Checkbox`. The
  nested `Checkbox` measured a correct **24**; the wrapper measured **31**; the
  row therefore rendered `12 + 31 + 12 = `**`55`** against Figma's **48**. The
  fix is `display: flex; align-items: center` on the wrapper — a flex context
  has no baseline and no descender to reserve, so it collapses to the control's
  real 24 and the row lands on 48. Same cause, smaller magnitude, on the radio
  row: 27 → 24, and 51 → 48.

  The rule is about the WRAPPER, not the control: `MenuItem`'s `default` and
  `crypto` rows were always correct because they wrap nothing. Fix it on the
  component so it renders ONE height — never scoped to a parent, which is the
  parent-to-child override Gate 68 deferred as a thing to stop doing.

  A sweep of `src/components` at Gate 73-B (63 non-test `.tsx`, 62 `.css`,
  looking for wrappers holding `Icon` / `Checkbox` / `Radio` / `Avatar` /
  `ElementWrapper` / `Logo` / `IconObject` without a flex or grid context)
  found **no further instances**. Three candidates surfaced and all three are
  false positives, each measured at a **0px** gap: `.mn-menu__search`
  (`Menu.css:22`) and `.mn-header-bg__search` (`HeaderBg.css:118`) wrap a
  block-level `div.mn-field`, which forms no line box, and
  `.mn-status-bar__time` (`StatusBar.css:21`) has no element child at all.
  **A modifier class is not a finding** — the first pass of that sweep reported
  9 hits, six of which were modifiers (`--checkbox`, `--radio`, `--account`,
  `--title`, `--greeting`, `--placeholder`) on elements whose BASE class
  already established the context. Check every class an element carries, not
  each class alone.

- **Token-source gap protocol** — when Figma specifies a value with no
  corresponding token (missing opacity/tint, or a px value off the
  `--brand-scale` ramp), do not invent a fallback silently. Get explicit
  approval before using either approved pattern:
  (a) `color-mix(in srgb, var(<real mapped token>) N%, transparent)` for a
      missing opacity/tint token — N must match Figma's actual percentage
      (e.g. ToggleChip's selected background, Tag's hover/press tint).
  (b) a plain px literal with a FAIL-LOUD comment (the Figma value, the
      nearest ramp steps, a note that this needs a Figma Variables fix) for
      an off-ramp value — e.g. ToggleChip's 10px, Radio's 14px/6px.
  **Banned**: `calc()` curve-fits between unrelated scale tokens to hit a
  target number (e.g. averaging two scale steps) — this fabricates a
  relationship between tokens that doesn't exist in the source. Rejected
  once already; use pattern (b) instead.
- **Inferred interaction states** — if Figma's source doesn't define a
  hover/pressed/focus state for a component (or a specific state×selection
  combo), never add one silently. Flag it and ask, case-by-case — there is
  no standing rule that "interactive components always get hover/press."
  If approved, document it in docs/component-tokens.md as a deliberate
  addition beyond source, not as an inferred/default behavior.
- **API conventions** (established across Button/Tab/Link/ToggleChip/Tag):
  text content goes through a `label` prop wherever Figma models it as a
  string prop — never `children` (a silent-failure risk: `Button` has no
  `children` handling, so passing text as children renders nothing visibly
  wrong but silently drops the text). `previewState` (showcase-only, forces
  a visual state without interaction) uses the value `'pressed'`, not
  `'press'`. `onChange` callbacks pass the new value, e.g.
  `(checked: boolean) => void` — not a bare `() => void`. React list keys
  are stable IDs, never array indices.
- **Styling lives in a companion `.css` file** — never inline `style={{}}`
  objects for static, token-driven values, even simple ones. This isn't just
  a style preference: audits work by grepping every component's `.css` for
  token/hardcode violations, so inline styles are invisible to that process
  and become a permanent blind spot. (`Avatar`/`Logo` were originally built
  with inline styles for size-driven values; converted to `.css` + size
  modifier classes for exactly this reason.) The only legitimate exception is
  a genuinely per-instance computed value that can't be expressed as a finite
  set of classes (e.g. a live drag-position offset) — and even then, only the
  dynamic part should be inline, not the whole style object.
- React + TypeScript. One component per folder: src/components/<Name>/<Name>.tsx + index.ts —
  **except** a tightly-coupled family sharing one Figma component set or Parts
  frame, built and checkpointed together in one session (e.g. `Navigation`'s
  `BottomNavigation`+`SideNavigation`, `Header`'s `HeaderBg`+`HeaderDefault`,
  `Item`'s `ListItem`+`SummaryItem`+`ChartLegendItem`, `Card`'s 7 card types).
  These may share one folder, one file per exported component, one `index.ts`.
  In `docs/component-tokens.md`, such a family shares one `## <Family>`
  heading with `### <Component>` subsections underneath, rather than a
  separate `##` per component — shared context (Figma frame refs, nested-
  component notes) lives once at the top instead of repeating per component.
- Build one component at a time. Show output for review before moving on.

## Accessibility baseline
Every interactive component (Toggle, Checkbox, Radio, Tab/Tabs, Link,
Breadcrumbs, ToggleChips, ButtonGroup, etc.) must have, before it's considered
done:
- Correct ARIA role and state attributes for what it semantically is
  (`role="switch"`, `role="tablist"`/`role="tab"`, `role="group"`, etc.).
- `isRequired`-style props wire the real `required` + `aria-required`
  attributes on the underlying input, not just a visual asterisk.
- Visible `:focus-visible` styling (never rely on browser default alone).
- Keyboard interaction wherever the relevant WAI-ARIA pattern requires it
  (e.g. tablist needs roving tabindex + ArrowLeft/ArrowRight).
- No dangling `aria-controls`/`aria-describedby` pointing at elements that
  don't exist (e.g. a tabpanel id that's never rendered) — either render the
  real target or don't reference it.

## Showcase section pattern
Every component's showcase entry in `showcase/App.tsx` (Components tab) must match
the existing wrapper exactly — this is the only pattern in use, do not invent
variants of it:
```jsx
<div style={{ padding: '2rem', background: 'var(--mapped-surface-page, #fff)', transition: 'background 0.2s' }}>
  <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mapped-text-default-default, #111)', marginBottom: '0.2rem' }}>
    ComponentName
  </h1>
  <p style={{ color: 'var(--mapped-text-subtle-default, #888)', fontSize: '0.8rem', marginBottom: '2rem' }}>
    one-line description
  </p>
  {/* component demo */}
</div>
```
Sections are separated by `<hr style={HR} />` (HR is defined once near the top
of App.tsx as `{ border: 'none', borderTop: '2px solid rgba(128,128,128,0.2)', margin: '2rem 0 2.5rem' }`).
No border, no border-radius on the wrapper, no per-section style variants —
a batch of sections built with rounded-corner/bordered wrappers had to be
retroactively conformed to this once already.

## Verification discipline
- Verify visual/behavioral changes with `getComputedStyle` (color,
  background, outline, text-decoration, tabIndex, aria-* attributes, etc.)
  in **both light and dark mode** — not the screenshot tool, which has been
  unreliable within sessions (stale/collapsed renders, timeouts). Screenshots
  are a nice-to-have once computed-style checks pass, not the primary check.
  - **Caveat to the above — finish transitions first, or the reading is a
    lie.** The preview pane doesn't advance animation frames, so CSS
    transitions freeze at `currentTime: 0` and `getComputedStyle` keeps
    returning the **pre-transition** value indefinitely. Most components
    declare `transition: background/border-color 0.12s ease`, so this hits
    exactly the properties dark-mode checks care about. Always run
    `document.getAnimations().forEach(a => a.finish())` immediately before
    reading any transitioned property (`background`, `border-color`,
    `color`, `outline`, …), or measure a freshly-inserted probe element
    (a new node has no transition to run). Untransitioned/structural
    properties (padding, radius, `tabIndex`, `aria-*`, selector matching
    via `Element.matches()`) are unaffected.
  - **Same trap, different API: `scrollIntoView({ behavior: 'smooth' })` does
    nothing while the preview pane is hidden.** Smooth scrolling is driven by
    animation frames, which are suspended when `document.hidden === true` —
    so `scrollLeft` stays at its starting value indefinitely and the feature
    looks broken. `requestAnimationFrame` never firing in a hidden pane also
    hangs any verification script that awaits it (a 30s tool timeout, not an
    error). To verify scroll behavior, re-run the same call with
    `behavior: 'instant'` and compare: if instant moves the scrollport and
    smooth doesn't, the code is correct and the pane is the problem. Check
    `document.hidden` before concluding anything about scroll position.
    Found while verifying `Tabs`' `isScrollable` (2026-08-08).
  - This produced a **false-positive bug report** once: `Field` was logged
    as "background doesn't flip in dark mode" (audit F1) purely because the
    theme-flip transition was frozen mid-flight. The token, `Field.css`, and
    both `globals.css` theme blocks were all correct the whole time — the
    only defect was the measurement. Confirm a suspected styling bug with
    `getAnimations()` (a stuck `CSSTransition` at `currentTime: 0`) or a
    `transition: none` override **before** logging it or attempting a fix.
- **Vite HMR does NOT apply edits to component CSS reached through
  `src/styles/package.css`'s `@import` chain.** After editing any component
  `.css`, do a full reload and then confirm via CSSOM that the rule is actually
  loaded *before* trusting any geometry:
  ```js
  [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
    .filter(r => r.selectorText?.includes('your-new-class')).map(r => r.cssText)
  ```
  Found the expensive way in v1.5.0 Gate 2: both new props (`barWidth`, `sizing`)
  measured **byte-identical to their defaults** and were about to be reported as
  no-ops and deleted. They were correct the whole time — the stylesheet was stale.
  The tell was in the declarations, not the pixels: `alignSelf: "auto"` where the
  rule says `stretch`, `flex-grow: "0"` where it says `1`. This is the same class
  of trap as the frozen-transition false positive above, and the same discipline
  defeats it — **read the declaration, not the rendering.**
- **A set-difference diff silently UNDER-REPORTS removals. Use a true
  line-by-line diff of comment-stripped content.** Comparing two files by
  building `new Set(lines)` for each and reporting `a.filter(l => !setB.has(l))`
  looks like a diff and is not one: a removed line that still exists **verbatim
  somewhere else in the same file** is present in `setB`, so it is never
  reported as removed. CSS token maps are exactly the shape that triggers this —
  the same `--btn-border: var(--mapped-border-primary-default);` line appears in
  several variant blocks.
  - Concrete case, v1.8.0 Gate 28: rebinding four `--btn-border*` declarations in
    `.mn-btn--primary` produced a confinement report showing **four additions and
    zero removals**, because `.mn-btn--secondary` still carried all four old
    lines unchanged. The reported total was 1 changed declaration when the real
    answer was 5 — and the under-report pointed the wrong way, making the change
    look *smaller* and safer than it was. A prediction written beforehand said 5,
    which is the only reason the gap was noticed at all.
  - The fix: strip comments, trim, drop blank lines, write both revisions to
    files, and run a real `diff -u`. Set membership is not ordering-aware and not
    multiplicity-aware; a diff is both.
  - Same family as the two traps above: the tool answered a slightly different
    question than the one being asked, and its answer looked reasonable.
- **Screenshot capture mode changes the contrast answer — state which mode you
  measured.** `page.screenshot({ fullPage: true })` and a clipped in-viewport
  capture return **different** contrast figures for the same element.
  `fullPage` samples the element at its **at-rest scroll position**, where a
  fixed scrim/overlay still sits over it; `scrollIntoView` + a `clip` capture
  samples it **clear** of that scrim. Same element, same page, two answers.
  - A 100dvh layout-shift explanation was tested and **REFUTED**: fullPage and
    viewport captures agree **pixel-for-pixel at the same document
    coordinates**. The variable is *scroll state*, not viewport height and not
    a dynamic-viewport reflow.
  - Therefore: any contrast measurement is incomplete unless it says which of
    the two captures produced it. A figure quoted without its capture mode is
    not comparable to one taken the other way, and re-measuring the other way
    is not a contradiction of it.
- **`clientWidth` is harness-dependent; key to it and say which harness.** At a
  1280 viewport the MVP's Playwright harness reports `clientWidth` **1280**, while
  this dev browser pane reports **1265** (a 15px scrollbar gutter). Neither figure
  corrects the other. Always key widths to
  `document.documentElement.clientWidth` — never `window.innerWidth`, which reads
  2px high in the pane — and record which harness produced a measurement before
  comparing it to one from the other.
- Before reporting on "what's built" or "what's left," check disk and git
  (`ls src/components/`, `git log --oneline`) — never rely on running session
  memory, which has drifted from actual repo state before.

## Component composition / nesting
- When a Figma component contains an INSTANCE of another component we've already
  built, import and reuse that real component — never re-implement its markup.
- If a component nests another that does NOT exist in code yet, STOP and tell me
  which — do not inline a copy. We build the child first, then compose.
- Flexible/swappable content (icons, arbitrary children) is exposed as slots/props
  (ReactNode), not hardcoded inside the parent. A slot hardcoded to one default
  icon behind a boolean is not swappable — this was built wrong once (Link) and
  had to be fixed retroactively once a composite (Breadcrumbs) needed different
  icons per instance.
- When reading a component via MCP, first REPORT which nested component instances
  it contains, so we can confirm build order before building.

## Checkpoint discipline
One component at a time, checkpoints never batched together:
1. Read the Figma source. Report every variant/state and every nested
   component instance. **STOP** — wait for confirmation before writing code.
2. Build. Report the exact variant→token mapping as implemented (including
   any token-source gaps and how they were resolved). **STOP** — wait for
   confirmation before touching docs or the showcase.
3. Only after that confirmation: append the docs/component-tokens.md entry
   and add the showcase section.
This applies even mid-batch — "resume the batch" does not mean skip the
per-component stops for the next one.

## Git workflow

**Claude Code makes no git writes of any kind — not even a branch** (Teku,
25 Sept 2026). Teku commits directly on `main` in Sourcetree. Claude Code does
not create, switch or delete branches; it edits the working tree on whatever
Teku has checked out and leaves it dirty for review.

**Staging, committing, pushing and tagging are Teku's alone, via Sourcetree.**
Not "pushing only" — *all of them*. Claude Code leaves the working tree dirty at
the end of a step so the diff can be reviewed whole, and Teku decides how to
split it into commits.

**Never push, never open PRs, never touch remotes.**

Branch creation is therefore the only git write Claude Code makes. This
supersedes the earlier "you may stage and commit locally", which contradicted
the roadmap's own standing rule ("Claude Code never pushes. No commits, no PRs,
no remotes"). The MVP repo's `CLAUDE.md` carries the same rule, deliberately —
the two repos agree.

> **Correction (Gate 73, 2026-09-28):** the first sentence of the paragraph
> above is no longer true. Since 25 Sept 2026 Claude Code makes no git writes
> at all, branch creation included; see the first paragraph of this section.

### Release hygiene — the version field is part of the release

**The package version field must be bumped in the same commit as the release it
names.** Not in a follow-up, not "next time" — the same commit the release tag
will point at. Bump it with

```
npm version <x.y.z> --no-git-tag-version
```

which updates `package.json` **and** the root `version` entries in
`package-lock.json` together, and touches git not at all (so it stays inside the
"Claude Code makes no git writes" rule above). Do **not** hand-edit the string in
`package.json` and hope the lockfile agrees — it is recorded in two places and
they drift independently.

**The six-command tag verification cannot catch this, and that is the whole**
**point of writing the rule down.** That check verifies a tag *points where it
should* — that `v1.8.0^{}` resolves to the intended commit, that the tag is
annotated, that CI was green there. Every one of those can pass against a tree
that **describes itself as a different version**. The tag is metadata *about* the
commit; the version field is a fact *inside* it, and nothing in the six commands
reads the tree's contents.

**v1.8.0 is the case that got written up — but it was the second of three, not
the only one.** `8be2d1f` is tagged `v1.8.0`, annotated,
CI green — and `package.json` at that commit reads `"version": "1.7.0"`. The tag
verification passed in full. Anyone installing the package from that tag gets
something that calls itself 1.7.0. Worse, `package-lock.json` had never been
bumped at all and read `0.0.0` at both root entries, so the drift was two
releases deep in one file and nine in the other, and no gate had ever looked.

**Three of eighteen tags carried this defect** (measured at Gate 42, 2026-09-02,
by reading the version field out of every tag rather than trusting the record):

| tag | version field declared at that commit |
|---|---|
| v1.1.0 | `1.0.0` |
| v1.8.0 | `1.7.0` |
| v2.0.0 | `1.16.0` |

Reproduce it with:

```
for t in $(git --no-pager tag -l | sort -V); do
  echo "$t declares $(git --no-pager show "$t:package.json" | grep -m1 '"version"')"
done
```

**v1.1.0 had never been recorded anywhere.** This section presented v1.8.0 as
the case that proved the rule; it was in fact the second instance, and the first
predates the rule being written down at all. v2.0.0 is the third — tagged with
the field still reading `1.16.0`, which is the whole reason v2.0.1 exists. So
this is not a one-off that a written rule has since contained: it has recurred
roughly once every six tags, and prose is its only enforcement.

**STANDING CHECK — run this before any annotated tag is cut.** Not aspirational;
it is the procedure, and it costs two commands:

1. Bump first, inside the release commit itself:
   `npm version <x.y.z> --no-git-tag-version`.
2. Read the field back out of the tree that is about to be tagged:
   `node -p "require('./package.json').version"`.
3. Confirm that string equals the intended tag name with its leading `v`
   stripped. If it does not, **stop and fix the tree — do not cut the tag.**
4. Confirm `package-lock.json` agrees at **both** root entries, since they drift
   independently:
   `node -p "const l=require('./package-lock.json');[l.version,l.packages[''].version].join(' ')"`.

**An automatic CI guard is deferred, not rejected.** Gate 42 established that no
such guard exists anywhere on disk — `.github/workflows/` holds one file whose
eight steps never read the version field or a tag ref, `.git/hooks/` holds only
the 14 stock `.sample` files, `core.hooksPath` is unset, and there is no husky,
lefthook, simple-git-hooks or pre-commit config, nor a dependency on one. Gate 42
was scoped not to add one; whether to is Teku's call. Until it is made, step 3 is
the only thing standing between a release and a fourth instance.

A tag that points at the right commit is not the same as a tree that knows what
it is. Check the field, not just the tag.

## Working conventions
- Incremental. One layer/component at a time. Verify before proceeding.
- Do not generate many files unseen — show output, review, then continue.
- Components consume tokens (CSS vars / `.type-*` classes). No hardcoded values.

## Build roadmap

`MONARCH-BUILD-ROADMAP.md` (repo root) holds the locked plan for the current
work: phase/step structure, locked architectural decisions (D1–D8), standing
rules, and parked items.

- When a session references a phase or step number (e.g. "Phase 0, Step 0.1"),
  read the roadmap first and follow that step's stated scope, gates, and
  acceptance criteria.
- Do not deviate from a locked decision in the D-table. If a step appears to
  require deviating, STOP and report rather than proceeding.
- Do not mark checkboxes complete on your own initiative. Teku does that.
