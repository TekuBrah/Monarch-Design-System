# Monarch — Build Roadmap (07/27/2026)

> **What this is:** the locked plan for taking the Monarch Design System from "components built"
> to "design system + MVP app, both deployed, one token source." Read at the start of any session
> touching this work. Distinct from the dated `MONARCH-CHAT-HANDOFF-*.md` files, which capture
> point-in-time state — this captures *direction*.
>
> **Where it lives:** root of `Monarch-Design-System`. Referenced from `CLAUDE.md`.
>
> **Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` skipped/parked

---

## Locked decisions

These were argued through and settled. Don't relitigate them mid-build without a specific reason;
if one does need revisiting, note the reason and the date here.

| # | Decision | Rationale |
|---|---|---|
| D1 | **MVP is React DOM, mobile-first viewport** — not React Native | RN shares no rendering primitives or CSS cascade with the DS. Every component would be rewritten. React DOM = 100% reuse, embeddable in the showcase, installable as a PWA. |
| D2 | **Two permanently separate repos** | `Monarch-Design-System` and `Monarch-MVP`, each with its own GitHub remote and its own Vercel deploy. |
| D3 | **Dependency runs one direction only** — MVP imports DS, never the reverse | Keeps the DS a real library rather than two tangled apps. |
| D4 | **The wrapper site lives in the DS repo** | Phase 3 already builds the shell there; MVP stays a pure mobile app; the narrative reads system-first. The MVP tab is an iframe — a URL string, not a code dependency. |
| D5 | **Local dev links to DS *source*; deploys use a pinned git tag** | Source alias = instant HMR on token changes, no publish loop. Pinned tag = reproducible builds and deliberate opt-in to DS changes. |
| D6 | **Package specifier is `@monarch/design-system` everywhere** | Showcase and MVP import identically. Showcase becomes consumer #1 and dogfoods the package before the MVP depends on it. |
| D7 | **No visual-regression tooling** | Screenshot tooling has been unreliable throughout this project. `getComputedStyle` in both themes remains the verification standard. |
| D8 | **No pnpm workspaces / monorepo** | One package, one consumer, separate repos by design. Two Vite configs is sufficient machinery. |

---

## Standing rules across all phases

- **Branch per phase.** `main` holds the last verified-working state. Merge only when the phase's
  acceptance criterion passes. If a phase goes sideways, `git checkout main` restores a working
  showcase immediately.
- **Claude Code never pushes.** No commits, no PRs, no remotes. Teku commits via Sourcetree,
  splitting multi-concern diffs into separate commits.
- **Ground truth is disk and git, never session memory.** `ls`, `git log --oneline`, `git status`
  before trusting any status claim.
- **Token gaps require in-session approval before any non-`var()` solution.** Approval happens
  before the fallback is written, never retconned onto it.
- **STOP means stop.** Where a step is marked with a STOP gate, Claude Code reports and halts.
  No proceeding to the next step on its own initiative.

---

## Phase 0 — Library-Readiness Audit

**Repo:** Monarch-Design-System · **Risk:** none (read-only) · **Branch:** not needed

The framing: *Monarch is currently an app, not a package.* Nothing about it is consumable from a
second codebase. That gap frames the whole audit.

- [ ] **0.1 — Ground truth inventory.** `ls src/components/`, `git log --oneline -50`,
      `git status`. Reconcile on-disk components against `docs/component-tokens.md` and the
      handoff list. Output: definitive component roster. Everything downstream depends on this.
- [ ] **0.2 — Public API surface sweep.** Prop naming consistency, size-scale vocabulary,
      event-handler signatures, exported prop interfaces, `any` usage. Feeds Phase 1.
- [ ] **0.3 — Token discipline sweep.** Grep for raw hex, raw px, `--alias-*` in interactive
      states, `--mapped-*` referenced but undefined in either theme block.
- [ ] **0.4 — CSS isolation check.** Are class names globally scoped and generic enough to
      collide with a host app's CSS? Only becomes a hazard once consumed externally.
- [ ] **0.5 — A11y regression sweep.** Roles, keyboard patterns, focus-visible in both themes,
      aria completeness. Confirm prior fixes landed (Tabs keyboard nav, ButtonGroup `role="group"`).
- [ ] **0.6 — Packaging gap analysis.** What's missing to be a consumable package: barrel export,
      exports map, lib build config, `.d.ts` emission, peer deps, `sideEffects`. Feeds Phase 2.
- [ ] **0.7 — Audit report + triage.** Single `AUDIT-07272026.md`. Every finding tagged
      **severity** + **blocks-MVP-consumption (Y/N)**. Triage into: fix in Phase 1, fix in
      Phase 2, or park. → **STOP.**
- [ ] **0.8 — Deploy the current showcase to Vercel.** Before anything changes. Gives a permanent
      live URL of the known-good showcase, unaffected by whatever state local is in. ~15 minutes.

**Acceptance:** audit report reviewed and triaged; current showcase live at a public URL.

**Run on:** a wide-context model (Fable 5 or equivalent) — this is exactly the breadth-of-context
sweep that benefits from holding the whole codebase in view.

---

## Phase 1 — Resolve Blocking API Decisions

**Repo:** Monarch-Design-System · **Risk:** brief build breakage, self-healing · **Branch:** `phase/1-api`

The sequencing logic: **the moment the MVP imports Monarch, every prop name becomes a breaking
change.** These are free today and expensive in three weeks.

- [ ] **1.1 — Size vocabulary normalization.** Collapse the 7 coexisting size scales into one.
      Decision in chat first, then execution.
- [ ] **1.2 — `disabled` vs `isDisabled`.** Pick one, apply everywhere.
- [ ] **1.3 — CSS class prefixing / scoping.** Only if 0.4 flagged collision risk.
      Prefix (`.mn-*`) or migrate to CSS Modules.
- [ ] **1.4 — Remaining Y-flagged audit findings.** Whatever 0.7 marked as blocking.
- [ ] **1.5 — Smoke test suite.** Vitest + Testing Library + jest-axe. One file per component:
      renders, each variant renders, zero axe violations. Doubles as the safety net for 1.1–1.4.

**Acceptance:** `npm run build` clean, all smoke tests pass, showcase renders as before.

**Note:** TypeScript will surface every broken call site during 1.1/1.2. Dev server may error
mid-step; it comes back.

---

## Phase 2 — Repackage as a Consumable Library

**Repo:** Monarch-Design-System · **Risk:** real breakage window · **Branch:** `phase/2-package`

Target structure:

```
Monarch-Design-System/
├─ src/                    # THE LIBRARY
│  ├─ components/
│  ├─ tokens/              # generated CSS from Token Studio
│  ├─ styles/
│  └─ index.ts             # barrel — every component + type
├─ showcase/               # THE SITE (a consumer)
│  ├─ main.tsx
│  └─ ...
├─ index.html              # showcase entry
├─ vite.config.ts          # showcase build (default)
├─ vite.config.lib.ts      # library build → dist/
└─ package.json
```

- [ ] **2.1 — Restructure directories.** `src/` = library only. Showcase moves to `showcase/`.
      Mechanical relocation, no logic changes.
- [ ] **2.2 — Barrel export.** `src/index.ts` — every component + every public type.
- [ ] **2.3 — Library build config.** `vite.config.lib.ts`, `build.lib` mode, `vite-plugin-dts`,
      React/ReactDOM externalized in `rollupOptions`.
- [ ] **2.4 — package.json contract.** `exports` map (root + `./tokens.css` + `./styles.css`),
      `files`, `sideEffects: ["**/*.css"]`, `peerDependencies`, `prepare` script, build scripts.
- [ ] **2.5 — Showcase re-wires to the package specifier.** Self-alias
      `@monarch/design-system` → `src`. Showcase now imports exactly as the MVP will.
- [ ] **2.6 — Verify the built artifact.** `npm run build:lib`; inspect `dist/`; confirm types
      emit, tokens CSS ships, no React bundled in.
- [ ] **2.7 — Tag `v1.0.0`.** First version contract.

**Acceptance:** **the showcase renders visually identical to before.** Any visible difference
means the relocation went wrong. Plus: `dist/` builds clean with types.

**`sideEffects` is not optional** — omit the CSS entry and a bundler tree-shakes the token
stylesheet out, and every component renders unstyled for no obvious reason.

---

## Phase 3 — Showcase Redesign

**Repo:** Monarch-Design-System · **Risk:** intentional change, additive · **Branch:** `phase/3-showcase`

Astryx-inspired. Single-page infinite scroll retained; sidebar is a filter/jump-to tool, not
per-component routing.

- [ ] **3.1 — Retrieve + review the original Phase 0 output.** The grouping table and shell
      structure Claude Code already produced. Re-validate against the 0.1 roster. → **STOP.**
- [ ] **3.2 — Shell implementation.** Top nav (Monarch logo / Foundations · Components tabs /
      light-dark toggle), sidebar, responsive behavior.
- [ ] **3.3 — `<Section>` wrapper extraction.** Parked decision, resolved here as a side effect
      rather than as separate work.
- [ ] **3.4 — Sidebar live search + jump-to.** Filter and scroll behavior.
- [ ] **3.5 — Foundations tab.** Token surface — color ramps, typography, spacing, elevation.
- [ ] **3.6 — Redeploy.** Replaces the 0.8 deploy.

**Acceptance:** every component from the 0.1 roster is reachable via sidebar and search, in both
themes.

**Tip:** `git worktree add ../Monarch-DS-before main` gives a second checkout of the old showcase
on a different port. Old on `:5174`, new on `:5173`, side by side — makes "is this actually better"
a real comparison instead of a memory exercise.

---

## Phase 4 — MVP Scaffold + Linkage Proof

**Repo:** Monarch-MVP (new) · **Risk:** none to the DS · **Branch:** `main` initially

Smallest possible thing that proves the pipe works, before any product code exists.

- [ ] **4.1 — Scaffold repo.** Vite + React + TS, mobile viewport. Clone as a **sibling folder**
      to the DS locally (the alias in 4.2 depends on this). Push to its own GitHub remote.
- [ ] **4.2 — Dual-mode linkage.** `vite.config.ts` with conditional source alias +
      `resolve.dedupe: ['react','react-dom']`. Git dependency pinned to `v1.0.0` in package.json.
- [ ] **4.3 — Import tokens + one component.** Render a single Monarch Button. Confirm styled,
      themed, type-safe.
- [ ] **4.4 — Prove live propagation.** Change a radius token in the DS, save, confirm the MVP
      hot-reloads with it. → **STOP. If this fails, nothing after it matters.**
- [ ] **4.5 — MVP `CLAUDE.md` guardrails.** The five rules (below).
- [ ] **4.6 — Grep guardrail script.** Hardcoded hex/px check, wired as npm script or pre-commit hook.
- [ ] **4.7 — App shell.** Router, theme provider, mobile layout frame, nav pattern.

**Acceptance:** token change in DS visibly propagates to running MVP without a build step.

### The linkage pattern

```ts
// Monarch-MVP/vite.config.ts
const DS_LOCAL = fs.existsSync(path.resolve(__dirname, '../Monarch-Design-System/src'));

export default defineConfig({
  resolve: {
    alias: DS_LOCAL ? {
      '@monarch/design-system': path.resolve(__dirname, '../Monarch-Design-System/src'),
    } : {},
    dedupe: ['react', 'react-dom'],   // ← prevents "Invalid hook call"
  },
});
```

Locally the sibling folder exists → alias to source → instant HMR. In CI it doesn't → resolves the
pinned git dependency. One specifier, two modes.

`resolve.dedupe` is the line that saves you. Two React copies is *the* classic failure mode when
linking a React component library, and it surfaces as "Invalid hook call" with a stack trace that
points nowhere useful.

### MVP `CLAUDE.md` rules

1. Never define a component here that duplicates a Monarch component. Import from
   `@monarch/design-system`.
2. Never write a raw color, radius, spacing, or font value. Only `var(--mapped-*)` /
   `var(--responsive-*)`.
3. If a screen needs a primitive Monarch doesn't have — **STOP and report.** Do not build it here.
   It either gets added to the DS properly, or the design gets adjusted.
4. MVP-local components are allowed only for *composition* (screen layouts, feature-specific
   arrangements of DS components), never for *primitives*.
5. Never push, never open PRs, never touch remotes.

Rule 3 is the one that preserves the system — it converts "the MVP diverged" into "the DS grew a
component," which is both the correct outcome and the better case-study story.

---

## Phase 5 — MVP Flows

**Repo:** Monarch-MVP · **Branch:** one per flow

**Gate discipline changes here.** The DS uses three gates per component because those components
are the durable artifact. MVP screens are compositions of already-verified parts — different risk
profile entirely. **One gate per flow.** Three gates per screen would quadruple the time for no
safety benefit.

- [ ] **5.1 — Flow inventory + prioritization.** From the Figma file: which flows are the "main
      feature flows." Order them.
- [ ] **5.2 — Figma MCP verification.** Confirm the **local desktop** server
      (`http://127.0.0.1:3845/mcp`) is reachable from the new repo. Not the remote server — it
      returns viewer-access errors.
- [ ] **5.3 — Flow build loop** *(repeats per flow)*: paste Figma link → Claude Code reports
      screen inventory + DS component mapping + gaps → **STOP** → approve → build the full flow
      with interactions.
- [ ] **5.4 — Gap resolution** *(as triggered by 5.3)*: build the missing primitive properly in
      the DS via `/monarch-component`, bump the tag, then continue. Never patch it in the MVP.
- [ ] **5.5 — State + data layer.** Local state, mock data, persistence — whatever the flows need.
      Decide once, early in the loop, not per-flow.

**Acceptance per flow:** navigable end to end, works in both themes, grep guardrail passes.

---

## Phase 6 — MVP Tab + Deploy Wiring

**Repo:** both

- [ ] **6.1 — Deploy MVP to Vercel.** Own project. Confirm it builds from the **git dependency**,
      not the local alias.
- [ ] **6.2 — MVP tab in the showcase.** Third top-level tab alongside Foundations and Components.
      Phone frame (390×844, device chrome) + `<iframe>`. Device-size selector,
      open-fullscreen link.
- [ ] **6.3 — Cross-links.** Showcase header → "View the Monarch App". MVP about screen or footer
      → "Built with Monarch Design System". Whichever URL someone lands on, they find the other half.
- [ ] **6.4 — Version bump workflow.** Document the loop: DS change → tag → bump MVP dependency →
      MVP redeploys. Manual to start.
- [ ] **6.5 — Optional: deploy hook automation.** GitHub Action in the DS pinging a Vercel deploy
      hook on the MVP. Add only when manual bumping actually becomes annoying.
- [ ] **6.6 — READMEs + case study framing.** Both repos. The architecture story — two repos, one
      token source, live propagation — is a large part of what's being demonstrated. Include the
      commit-email privacy step (GitHub no-reply address) in the process writeup.

**Known gotcha:** the deployed MVP is built against a pinned DS tag. Change a token and the
showcase updates but the iframe won't, until the MVP rebuilds. Locally this doesn't apply — the
alias means both see changes on save.

---

## Parked / revisit later

| Item | Revisit when |
|---|---|
| **Graphify** (AST knowledge graph for agents) | Phase 5, once the MVP has 15+ screens and blast-radius questions get real. Not before — the DS is too small, too regular, and too well-documented for it to earn its place. |
| **Motion/elevation token layer** | Genuinely new token layer (`0.12s` transitions, z-index, some opacity values have no backing token). Needs a design decision, not a code fix. May surface as a gap during Phase 5. |
| **Field/"Chip" removable tag** | Only if a Phase 5 flow demands it. |
| **Chips/Badge alias-color usage** | Stays as faithful Figma-source recording unless a deliberate design decision changes it. |
| **Changesets / formal versioning** | Overkill at one package, one consumer. Plain `git tag` suffices. |
| **Storybook** | Superseded — the custom showcase is the better portfolio artifact. |

---

## Method notes

**Tight leash on the DS, loose leash on the MVP.** The DS is a public artifact with one API
surface where every mistake compounds across every consumer — the existing three-gate discipline is
correct there, keep it. MVP screens are disposable compositions of verified parts; read the diff,
don't gate it. Getting this backwards — vibe-coding the DS or over-gating the MVP — is the actual
risk.

**Thread hygiene.** Fresh chat per phase. Paste relevant file slices, not whole files. Sonnet for
routine decision/verification turns; extended thinking off unless the turn warrants it. Wide-context
model reserved for read-only breadth sweeps (Phase 0).
