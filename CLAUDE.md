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
| Alias | `Alias/Alias.json` | `build-alias.mjs` | `alias.ts`, `/* === Alias === */` block in `globals.css` |
| Mapped | `Mapped/Light.json` + `Dark.json` | `build-mapped.mjs` | `mapped.ts`, light/dark blocks in `globals.css` |
| Responsive | `Responsive/Desktop.json` + `Mobile.json` | `build-responsive.mjs` | `responsive.ts`, spacing + font vars (+ `@media 768px`) in `globals.css` |
| Typography | `Brand/Value.json` (composites) | `build-typography.mjs` | `typography.ts`, `typography.css` (22 `.type-*` classes) |

### Running the scripts
Run in order (each layer reads what the previous wrote to `globals.css`):
```
node scripts/build-brand-colors.mjs
node scripts/build-alias.mjs
node scripts/build-mapped.mjs
node scripts/build-responsive.mjs
node scripts/build-typography.mjs
```

### Generated outputs (never hand-edit)
- `src/tokens/brand.ts` · `alias.ts` · `mapped.ts` · `responsive.ts` · `typography.ts` · `index.ts`
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
- **PARTIALLY RESOLVED — `on-color`/`Interactive.on-color` dark-mode bindings.**
  In `Mapped/Dark.json`, this family was bound to `Foundations.black` (verified
  in the JSON). These tokens describe content on a *fixed* colored surface that
  doesn't flip with the app theme, so black bindings were a real semantic error.
  - **FIXED (2026-07-22, manual JSON edit — user maintains Figma but exports
    manually):** `surface.Interactive.on-color{,-hover,-pressed}` →
    `{Foundations.white}` / `{Neutral.100}` / `{Neutral.200}`, and
    `border.Interactive.on-color{,-hover,-pressed}` → `{Foundations.white}` /
    `{Surface.100}` / `{Surface.200}`, matching Figma's Inverse-variant dark
    values. This is the family `Button`/`IconButton` depend on. Those two
    components were also refactored to collapse the old `inverse` appearance
    into `[data-theme="dark"]` (no more `appearance` prop) — see
    `docs/component-tokens.md`'s Button entry. Both now render correctly in dark
    (white primary, white-bordered secondary, alpha-wash hover). Zero blast
    radius: the `interactive-on-color` family is consumed only by the buttons.
  - **STILL OUTSTANDING:** `text.on-color.heading/body`, `icon.*.on-color`, and
    other `on-color` members remain bound to `Foundations.black` in Dark.json.
    Not consumed by Button/IconButton, but the narrower workarounds in `Toast`
    (icons), `Badge` (`dark` appearance), `ProgressRing` (pill), and `HeaderBg`
    (static color) are still in place for those. A proper Figma Variables fix +
    re-sync would let those self-correct; until then they stay as-is.

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
