# Monarch Design System — Chat Handoff (2026-07-05)

Supersedes `MONARCH-CHAT-HANDOFF-06292026.md` (stale — that file no longer
exists in the repo; if you have a copy elsewhere, it's out of date).

## Who / goal

Teku is building a personal design-system codebase — a reusable component
library on top of Figma design tokens, for future apps/sites. Not a product.
The assistant's job across sessions: read each component from Figma via the
local figma-desktop MCP, build it as a typed React component consuming only
existing CSS tokens, document it, add it to the showcase, and stop for
review at defined checkpoints. Teku pushes to remote manually via
Sourcetree — the assistant never pushes.

## Stack / environment (unchanged)

- Vite + React + TypeScript, `@fontsource/poppins` (400/500/600).
- Figma file: `xhA5ARVgSeD3gA41lYDqST` ("Monarch design system"), read via the
  **local** figma-desktop MCP (`http://127.0.0.1:3845/mcp`) — never the
  remote Figma server.
- Token pipeline (Brand → Alias → Mapped → Responsive → Typography) is
  complete; see `CLAUDE.md` for the build scripts and cascade contract.
- `npm run dev` for the local showcase (`src/App.tsx`, Foundations +
  Components tabs, light/dark toggle).

## Standing rules

All of this session's established rules — token-source gap protocol,
`--alias-*` dark-flip discipline, inferred-state approval, API conventions,
accessibility baseline, showcase wrapper pattern, verification discipline,
checkpoint discipline — are now written into **`CLAUDE.md`**, not repeated
here. Read it before doing any component work; it is the source of truth for
how to work in this repo, not this file.

## Current state (verified against `ls src/components/` and `git log`, 2026-07-05)

**24 components built**, all in `src/components/`:

Avatar, Badge, Blanket, Breadcrumbs, Button, ButtonGroup, Checkbox, Chips,
Divider, ElementWrapper, FilterChips, Icon, IconButton, IconObject, Label,
Link, Loader, Logo, ProgressStepper, Radio, Tab, Tabs, Tag, Toggle.

All 24 have entries in `docs/component-tokens.md` (1283 lines, 24 `##`
sections — one-to-one with the component list above).

**Batch build (15-component work order) is complete.** Permanently skipped,
by design, not by omission:
- **Field / "Chip"** (Figma node 228:1296) — a removable-tag component found
  alongside Filter Chips, explicitly scoped out at build time. See "Open
  decisions" below.

**Post-batch audit + remediation is complete.** A full read-only audit was
run across all 20 then-existing batch/original components (six categories:
token discipline, docs-vs-code drift, API consistency, color-behavior split,
accessibility, general drift). Findings were triaged into four remediation
groups and committed separately, in order:

```
ba33dac  Remediation G4 — geometry hygiene
7a6562c  Remediation G3 — accessibility
6b6116c  Remediation G2 — API consistency
3f7ad8e  Remediation G1 — token/doc defects
```

All four are resolved and verified (computed-style checks in both themes,
grep confirmation, zero console errors) — see those commits' messages for
exact scope. The only audit findings **not** acted on were explicitly
deferred to Teku's call (see "Open decisions").

**Uncommitted at time of writing:** `src/components/Tab/Tab.css` — Teku
updated the Tab's Figma frame (radii + focus-stroke offset); the focus state
now uses `outline-offset: var(--brand-scale-50)` (2px gap) instead of `0`,
with the ring rendering at ~10px (`border-radius/lg`) via the tab's own 8px
corners + the 2px offset, rather than a separate radius override. This also
fixed a latent bug (the old rule set `--brand-scale-300` = 12px while its own
comment claimed 10px). Verified via computed styles in both themes; not yet
committed — Teku was reviewing.

## Open decisions (parked for Teku, not the assistant's call)

From the post-batch audit, explicitly **not** fixed — recorded findings
waiting on a decision, not oversights:

- **Size-vocabulary normalization (audit finding M1)** — seven different
  size-name vocabularies across components (`s|m|l`, `xs..xxxl`,
  `small|medium|large|xl|xxl`, `regular|large`, `medium|large`, `M|S`,
  `S|M`). Partly driven by each Figma component's own naming. Normalizing
  would touch every component's public API — needs Teku's call on whether
  it's worth the churn.
- **`disabled` vs `isDisabled` split (M2)** — Button/IconButton/ButtonGroup
  use `disabled`; Toggle/Tag/Checkbox/Radio use `isDisabled`. Same
  cross-API-consistency tradeoff as M1.
- **Chips/Badge alias colors (M5, code)** — Chips' subtle-fill backgrounds
  and Badge's `added`/`removed`/`dark` backgrounds use `--alias-*` directly
  (frozen across themes) because no mapped subtle-tint token exists. This is
  the *documented, disclosed* version of the Tag bug fixed in G1 — the
  difference is these are **non-interactive** appearance colors, not
  hover/pressed states, so it wasn't in scope for the G1 fix. Both docs
  entries already disclose it. Fixing it would mean applying the
  `color-mix()` pattern here too — a code change, needs Teku's go-ahead.
- **`<Section>` wrapper extraction** — the showcase wrapper (see `CLAUDE.md`
  → Showcase section pattern) is copy-pasted inline in all ~24 sections.
  Flagged as worth extracting into a real component; explicitly not done
  without approval, per instruction at the time.
- **Field / "Chip" component** — the removable-tag component sitting next to
  Filter Chips in Figma (node 228:1296, has an "×" affordance, different
  purpose from the existing `Chips` status lozenge). Not built. Candidate
  for a future session if Teku wants it.

## Deferred (carried over, not re-litigated)

- **Icon bulk-populate on demand** — the Icon registry currently has 94
  icons (59 Material Round + 35 custom); more can be added as components
  need them rather than front-loading the full Material set.
- **Token build script consolidation** — `CLAUDE.md`'s "Known open items"
  already flags consolidating the five `build-*.mjs` scripts into one
  `npm run build:tokens`; Style Dictionary is a longer-term option if the
  pipeline grows more complex. Still open, still low priority.
- **Doc site: Storybook vs. custom** — whether the component docs eventually
  move to Storybook or stay as the custom `App.tsx` showcase +
  `docs/component-tokens.md` pairing is undecided. No pressure to decide
  soon; the current setup is working.
- **Figma "doc frames" experiment** — several Figma source frames mix real
  components with documentation/annotation scaffolding (section headers,
  "Parts" labels, hidden description boxes) in the same frame. Whether to
  propose a cleaner Figma-side convention (e.g. isolating real components
  from their documentation wrapper) for future component work is an open
  idea, not a commitment.
- **Commit-email privacy step** — if/when this build process gets written
  up or shared externally, revisit whether the git commit author email
  should be scrubbed/replaced first. Not urgent, just don't forget it
  before anything public happens.
