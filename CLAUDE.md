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
Run **all seven, in this exact order** (each layer reads what the previous wrote
to `globals.css`):
```
node scripts/build-brand-colors.mjs
node scripts/build-alias-colors.mjs
node scripts/build-mapped.mjs
node scripts/build-responsive.mjs
node scripts/build-typography.mjs
node scripts/build-gradients.mjs
node scripts/build-shadows.mjs
```

**Do not skip the last two.** This list previously stopped at typography, and
following it verbatim regenerated a `globals.css` with no `--shadow-*` or
`--gradient-*` declarations at all — while 10+ component CSS files
(all four `Card` variants, both `Navigation` components, `Tab`) kept consuming
`var(--shadow-*)`. Those silently resolved to nothing, so every card and nav
rendered with no shadow and no build error. Regression introduced at `142df40`,
found and repaired 2026-07-31.

**`build-shadows.mjs` must run last.** Six of the seven scripts rewrite
`src/tokens/index.ts` from their own hardcoded export list, so whichever runs
last decides the final barrel. Only `build-shadows.mjs` writes the complete set
(brand, alias, mapped, responsive, typography, gradients, shadows) —
`build-gradients.mjs`, for instance, omits the `shadows` exports, so running it
after shadows silently breaks `import { shadows }`.

### Generated outputs (never hand-edit)
- `src/tokens/brand.ts` · `alias.ts` · `mapped.ts` · `responsive.ts` · `typography.ts` · `gradients.ts` · `shadows.ts` · `index.ts`
- `src/styles/globals.css` — all CSS custom properties (brand → alias → mapped → spacing → responsive font)
- `src/styles/typography.css` — `--font-family-primary` + 22 `.type-*` classes

### Cascade contract
`--brand-*` (primitives) → `--alias-*` (semantic colors) → `--mapped-*` (surface/text/icon/border, light + dark)
`--brand-scale-*` (px steps) → `--spacing-*` → consumed by components
`--responsive-font-*` (mobile base + `@media 768px` overrides) → consumed by `.type-*` classes

Never flatten alias chains to hardcoded values. Always emit `var(--x)` references.

## Structure
```
design-tokens/          # JSON exports from Token Studio (source of truth)
scripts/                # one build script per token layer
src/
  tokens/               # generated .ts files + index.ts
  styles/
    globals.css         # all CSS vars (brand, alias, mapped, spacing, responsive)
    typography.css      # font-family var + 22 .type-* composite classes
  components/<Name>/    # components (not yet built — see Next)
  main.tsx              # entry — imports fonts + typography.css + App
  App.tsx               # showcase page (all token layers previewed)
```

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

## Next
Build the first component (e.g. Button) on top of the token foundation:
- One component at a time, in `src/components/<Name>/`.
- Consume only CSS vars (`--mapped-*`, `--spacing-*`, `.type-*` classes).
- No hardcoded colors, spacing, or font sizes anywhere in component code.

## Component rules
- Components consume our existing token CSS variables ONLY — never hardcode
  colors, spacing, radius, shadows, or type. Use var(--mapped-*), var(--spacing-*),
  var(--brand-scale-*) for radius/borders, var(--shadow-*), and the .type-* classes.
- Map interaction states to tokens: default/hover/pressed/subtle → the matching
  --mapped-surface-* / --mapped-text-* tokens (that's why they exist).
  **`--alias-*` never dark-flips** (the `[data-theme="dark"]` block only redefines
  `--mapped-*`) — an alias token in a hover/pressed/selected/focus rule is a bug,
  found and fixed twice (Toggle/Checkbox/Radio, then Tag). After building or
  editing any component, grep its CSS for `--alias-` — any hit in an interactive
  state must be replaced with a mapped token or the color-mix pattern below.
  This grep is a required verification step, not optional.
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
Every component's showcase entry in `src/App.tsx` (Components tab) must match
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
  - This produced a **false-positive bug report** once: `Field` was logged
    as "background doesn't flip in dark mode" (audit F1) purely because the
    theme-flip transition was frozen mid-flight. The token, `Field.css`, and
    both `globals.css` theme blocks were all correct the whole time — the
    only defect was the measurement. Confirm a suspected styling bug with
    `getAnimations()` (a stuck `CSSTransition` at `currentTime: 0`) or a
    `transition: none` override **before** logging it or attempting a fix.
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
- You may stage and commit locally with clear messages.
- Do NOT push to the remote, and do NOT create pull requests. I handle all
  pushes manually via Sourcetree. Never run git push or /create-pr.

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
