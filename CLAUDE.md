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
  components/<Name>/    # 49 component folders
  test/                 # vitest setup + type shims (setup.ts, *.d.ts)
```

Two of these bite silently if forgotten when adding a component:
**`src/index.ts`** (omit it and the package has no export — `tsc -b` catches it,
the test suite does not) and **`src/styles/package.css`** (omit it and the
component ships with no CSS, with no error at all).

## Commands
- `npm run dev` — local dev server

## Known open items
- **Heading font-size in source**: Figma composites wire `{fontSize.N}` (static), not a
  responsive token. Resolved at build time by mapping heading keys → responsive vars.
  If Figma fixes the composites, update `build-typography.mjs` accordingly.
- **paragraphSpacing / paragraphIndent**: intentionally ignored — document-level
  properties, not relevant for inline CSS classes.
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

## Component roster — current state

**49 components are built** (`ls src/components/` — verified 2026-08-11), with
**59 test files / 487 tests** and 47 showcase sections.

> **Test count history.** This line read *472 tests* and was stale by one: it was
> recorded on 2026-08-11 *before* commit `6bacfe8` landed later the same day,
> which added `it('defaults to size l')` to `ElementWrapper.test.tsx` (it also
> renamed two tests, netting zero). The v1.3.0 baseline is therefore **473**.
> The v1.4.0 gap batch added **14** tests — `Label.tone` (4), `Link.weight` (6:
> a 2×2 `it.each` matrix plus a default-preservation and an `m`-invariance case),
> `Icon` `logo_monarch` + size `xl` (2), and `ListItem` chart-slot gating (2) —
> for a current total of **487**, with the file count unchanged at 59 (all
> additive: no new test files, no existing test modified). The library is well past
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
- **Token-source gap protocol** — when Figma specifies a value with no
  corresponding token (missing opacity/tint, or a px value off the
  `--brand-scale` ramp), do not invent a fallback silently. Get explicit
  approval before using either approved pattern:
  (a) `color-mix(in srgb, var(<real mapped token>) N%, transparent)` for a
      missing opacity/tint token — N must match Figma's actual percentage
      (e.g. FilterChip's selected background, Tag's hover/press tint).
  (b) a plain px literal with a FAIL-LOUD comment (the Figma value, the
      nearest ramp steps, a note that this needs a Figma Variables fix) for
      an off-ramp value — e.g. FilterChip's 10px, Radio's 14px/6px.
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
- **API conventions** (established across Button/Tab/Link/FilterChip/Tag):
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
Breadcrumbs, FilterChips, ButtonGroup, etc.) must have, before it's considered
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

**Branch creation is Claude Code's, when a step calls for it** — e.g.
`git checkout -b phase/5.4-gap-resolution`, created off `main` as the first
action of the step.

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

**v1.8.0 is the case that proved it.** `8be2d1f` is tagged `v1.8.0`, annotated,
CI green — and `package.json` at that commit reads `"version": "1.7.0"`. The tag
verification passed in full. Anyone installing the package from that tag gets
something that calls itself 1.7.0. Worse, `package-lock.json` had never been
bumped at all and read `0.0.0` at both root entries, so the drift was two
releases deep in one file and nine in the other, and no gate had ever looked.

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
