# Monarch Design System — Chat Handoff (2026-08-01)

Every claim below is grounded in commands run fresh at the end of this session —
`git status`, `git log --oneline -15`, `git tag -l`, `git ls-remote --tags origin`,
`npm run build`, `npm run build:lib`, `npx vitest run`, plus a live re-check of the
Phase 3 acceptance criterion in the browser. Nothing is carried forward from
session memory. All earlier dated `MONARCH-CHAT-HANDOFF-*.md` files are left in
place, unedited, as historical record — read this file for current state.

**This session closed out Phase 3 (Showcase Redesign).**

## Who / goal / rules — pointer only

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Standing rules —
token-source gap protocol, alias/dark-flip discipline, API conventions,
accessibility baseline, showcase wrapper pattern, checkpoint discipline — all
live in **`CLAUDE.md`** and **`.claude/skills/monarch-component/SKILL.md`**.
Not restated here; read those files directly, they are the source of truth,
not this handoff. Phase/step structure and locked decisions D1–D8 live in
**`MONARCH-BUILD-ROADMAP.md`**.

## CURRENT STATE — verified fresh this session

| Check | Result |
|---|---|
| Branch | `main` |
| Working tree | **clean** (`git status` empty) |
| HEAD | `1fdd521` — "Minor tweaks" |
| `origin/main` | `1fdd521` — **local and remote in sync**, 0 ahead / 0 behind |
| Tags (local) | `v1.0.0` |
| Tags (remote) | `v1.0.0` → `6248fb0` — **pushed, matches local** |
| `npm run build` (showcase) | ✅ clean, built in 3.00s |
| `npm run build:lib` | ✅ clean, built in 4.82s |
| Lib artifacts | `dist/index.js` 5,577.96 kB · `dist/index.css` 136.09 kB · `dist/index.d.ts` emitted · `dist/components/` · `dist/tokens/` |
| `npx vitest run` | ✅ **377 passed (377)** across **55 test files** |
| Components on disk | 45 folders in `src/components/` → 43 showcase sections (Tab+Tabs and Toast+ToastMobile are deliberately combined, per the family convention) |

The only build warning is the pre-existing "chunks larger than 500 kB" notice —
informational, not a failure, unchanged for many sessions.

### Phase 3 acceptance criterion — re-confirmed live this session

The roadmap's bar is *"every component from the 0.1 roster is reachable via
sidebar and search, in both themes."* Re-verified in the browser, per-slug,
across all 43, in **both** themes:

| Check | Light | Dark |
|---|---|---|
| Sidebar entries | 43 | 43 |
| Sections rendered | 43 | 43 |
| All resolve by `getElementById` | ✅ | ✅ |
| All direct children of `.app-main` | ✅ | ✅ |
| All findable by search | ✅ | ✅ |
| Failures | **0** | **0** |

Foundations (8 sections) was **intentionally excluded** from that bar by explicit
decision this session — it stays a short single-page scroll with no sidebar, no
search, no jump-to, no ids, and no scrollspy involvement.

## Phase 3 — all 6 steps done

- **3.1 — Retrieve + review Phase 0 output.** The grouping table and shell were
  never a separate document; they are code, introduced in commit `bf10546`
  (2026-07-27) as `SIDEBAR_CATEGORIES` + `AppShell.css`. Re-validated against the
  45-folder roster: no components missing, one rename (`FilterChips` →
  `FilterChip`) already reconciled.
- **3.2 — Shell implementation.** Became a defect-fixing pass rather than a build:
  the shell already existed. Eight reference-independent bugs found and fixed
  (see below).
- **3.3 — `<Section>` wrapper extraction.** New `showcase/Section.tsx`; all 43
  Components call sites migrated. `showcase/App.tsx` 3231 → 3045 lines.
- **3.4 — Sidebar live search + jump-to.** Search already worked; the step became
  three fixes (see below).
- **3.5 — Foundations tab.** All 8 sections migrated to `<Section>`, preceded by a
  mandatory root-cause body-colour fix.
- **3.6 — Redeploy.** Done by Teku (push + Vercel). Replaces the Step 0.8 snapshot.

## Bugs found and fixed across Phase 3

This phase surfaced substantially more real defects than planned feature work.
Full list, grouped by where they were found.

### The 8 shell defects (Step 3.2)

1. **Dead active-state token.** `--mapped-surface-primary-default-subtle` resolves
   to *exactly* `--mapped-surface-page` in **both** themes (`#ffffff` / `#000000`),
   so the active sidebar item had a literally invisible background. Moved to
   `--mapped-surface-default-default`.
2. **Hover read stronger than active.** A consequence of #1 — hovering any row
   looked more selected than the actual current section. Hover downgraded to
   `--mapped-surface-subtlest-hover` so ordering is hover < active.
3. **Active-item contrast failed WCAG AA.** 4.49:1 light / 3.27:1 dark. Label moved
   to `--mapped-text-default-default` (matching Tab's selected-label precedent):
   now **8.85 / 5.81**, both pass.
4. **Font cascade broken three ways.** Poppins was loaded and
   `--font-family-primary` was correct, but the shell root hardcoded
   `system-ui`, `body` inherited Times New Roman, and sidebar `<button>`s fell back
   to **Arial** (buttons don't inherit `font-family`). Three typefaces rendered at
   once. Fixed at `body` + `font-family: inherit` on the nav buttons.
5. **UA 8px body margin never reset.** The whole app sat inset from the viewport and
   the sticky top nav never reached the window edges.
6. **Sticky-offset drift.** Sidebar hardcoded `top: 49px` ("approx top-nav height");
   the real nav is 48px desktop / 54px mobile, so the sidebar sat *under* the nav by
   7px / 13px. Replaced with `--app-topnav-h`, measured live by a `ResizeObserver`.
   The same stale `49px` literal existed a second time in the scrollspy
   `rootMargin` and was collapsed onto the same measured value.
7. **Mobile drawer had no scrim and no scroll lock.** Page scrolled behind the open
   drawer. Fixed by reusing the real `Blanket` component (not a bespoke overlay) plus
   a body scroll lock released on close.
8. **Hardcoded drawer shadow.** `rgba(0,0,0,0.15)` bypassing the token layer →
   `var(--shadow-subtle)`.

### The token-generation regression (found while fixing #8)

- **`--shadow-*` and `--gradient-*` were missing from `globals.css` entirely.**
  Present at `b48231f`, dropped at `142df40` when `globals.css` was regenerated
  without running the last two build scripts. **13 consumers** across the codebase
  (all 4 Card variants, both Navigation components, Tab ×3, Toggle, SideNavigation,
  plus showcase) were referencing dead variables — every card and nav rendered with
  **no shadow, no build error, no warning**. Repaired by running
  `build-gradients.mjs` then `build-shadows.mjs`; verified additions-only (13 lines).
- **Two `CLAUDE.md` script-order bugs, which were the root cause.** (a) The documented
  run order listed only 5 of 7 scripts, omitting `build-gradients.mjs` and
  `build-shadows.mjs` — following it verbatim *reproduces* the regression. (b) It
  named `build-alias.mjs`, but the real file is `build-alias-colors.mjs` — the
  documented sequence would fail outright on line 2. Both fixed, plus a documented
  hard constraint: **`build-shadows.mjs` must run last**, because 6 of the 7 scripts
  rewrite `src/tokens/index.ts` from their own hardcoded export list and only
  `build-shadows.mjs` writes the complete set (`build-gradients.mjs` omits the
  `shadows` exports, so running it after shadows silently breaks `import { shadows }`).

### The `<Section>` extraction hazard (Step 3.3 — avoided, not hit)

`AppShell.css`'s `.app-main > div` is a **direct-child** selector supplying the
width cap and centering to every section. Any `<Section>` implementation that
introduced a nesting level would have silently dropped `max-width`/`margin` on all
43 sections with no error and no build failure. Flagged before implementation and
designed around (Section renders exactly one outermost element); verified after by
asserting all 43 are still direct children of `.app-main`.

### The 4 fixes from Step 3.4

- **Jump-to occlusion (the underlying bug).** No `scroll-margin-top` existed
  anywhere, so `scrollIntoView({block:'start'})` landed every section *behind* the
  sticky nav — measured 48px occluded at 1280px, 53px at 900px; the section `<h1>`
  was not visible after any sidebar click.
- **`scroll-margin-top: var(--app-topnav-h)`** — applied to the shared
  `.app-main > div` selector rather than inside `Section.tsx`, so the 8 Foundations
  sections (which don't use `<Section>`) get identical behaviour instead of a
  known-inconsistent gap.
- **Slug matching in search.** Only `label` was searched, so typing `status-bar`
  (the on-disk/anchor name) returned nothing. Now matches label **or** slug.
- **`aria-current` on the active sidebar item.** Was entirely absent — the current
  section was conveyed by colour and weight only, never exposed to assistive tech.
  Uses `aria-current="location"` (sections within one page, not a set of pages).
  ⚠️ Note the rest of the codebase uses `"page"` (`Link`, `BottomNavigation`,
  `SideNavigation`, `Breadcrumbs`, with tests asserting it). Both are valid ARIA;
  this was a deliberate precision-over-local-consistency call and is a one-word
  change if you'd rather it match.

### The Step 3.5 latent body-colour bug

**`body` colour was never wired to a token — it computed pure black in *both*
themes.** Latent only because every descendant happened to set its own colour.
Migrating Foundations to `<Section>` (which sets no colour) would have made it live:
measured **32 elements** — Typography's 22 `.type-*` specimens and Responsive
type's 10 — would have rendered **black text on a black page** in dark mode. These
specimens correctly *don't* set their own colour, since a type specimen shouldn't
hardcode one. Fixed at the root (`body { color: var(--mapped-text-default-default) }`)
**before** any migration, then re-verified zero pure-black elements in both themes.
Incidentally also fixed "Mapped / Semantic surfaces", the one Foundations section
that had never set an explicit colour.

### The 4 post-deploy polish fixes

Reported from the live deployed site after 3.6.

1. **Search field overflow.** Not a missing-padding issue: `Field` carries a fixed
   `width: 240px` default that overflowed the sidebar's 228px content box, squeezing
   the right gap to **4px** against 16px on the left. Fixed with a scoped
   `width: 100%` (the same pattern `SideNavigation` already uses) → symmetric 16/16.
2. **DEAD LOGO CSS SELECTOR — dead since Phase 1.3.** The nav rule was
   `.app-topnav__left .logo { height: 24px }`, but `Logo`'s root class became
   `.mn-logo` in **Phase 1.3's `mn-` prefixing pass** and this scoped override was
   never updated. Confirmed matching **zero** elements, so the logo had been
   silently rendering at its natural `size="s"` height (32px) ever since. Selector
   corrected; logo now 41×24, closely matching the hamburger's 38×38 footprint.
   *Worth noting as a class of bug: Phase 1.3 fixed 5 cross-component coupling
   selectors, but this showcase-shell one was missed — there may be no others, but
   nothing systematically checked shell CSS against the rename.*
3. **Foundations background flattening.** All 8 sections' background variants
   (5 × `page-secondary`, 1 × `subtle`, 2 × explicit `page`) removed; all now use the
   plain page background. **This deliberately reverses the 3.5 decision** to preserve
   the original Phase 0 variants during migration — confirmed as an intentional
   design change, not a bug fix. Contrast re-verified after: headings 11.15 light /
   14.2 dark, descriptions 4.56 / 6.87, all 32 type specimens legible, zero
   pure-black nodes. (The 4.56 light description figure is the tightest margin —
   passes AA, but worth knowing if the page background is ever darkened.)
4. **Link showcase wrapper cleanup.** Removed the gray box (background + padding +
   radius) from the "Default appearance" and "Subtle appearance" rows. Confirmed
   showcase-only first: `Link.css` sets no background and `src/components/Link/` is
   untouched. The "Inverse appearance" row keeps its blue surface, which inverse
   links need to be legible at all.

## STILL OUTSTANDING — environment-unverifiable, needs one real-browser pass

**None of these are known to be broken.** Each was reasoned through structurally and
its static half verified; what could never be observed is the dynamic behaviour,
because **this preview environment cannot run `IntersectionObserver` or
`ResizeObserver`** — the pane reports `document.hidden: true`, and a bare control
probe confirmed zero callbacks fire. Low urgency; nothing points at a defect.

- **Scrollspy firing on real scroll** — does `activeSlug` actually update as you
  scroll? Never observed working, across multiple sessions dating back to the
  07/24 handoff. The static half is verified: all 43 ids resolve, all are direct
  children of `.app-main`, and the observer's null-guard is intact.
- **`--app-topnav-h` updating live on window resize** — the `ResizeObserver`
  callback has never been seen to fire here. Verified instead in two halves: the
  effect's logic computes the correct value (48px desktop / 54px mobile) from the
  live nav, and setting the variable manually makes the sidebar and scroll-margin
  track it exactly.
- **`aria-current` actually moving between sidebar items during scroll** —
  `setActiveSlug` is called from exactly one place (the observer callback), so
  nothing else can change it in this environment. Verified structurally: the
  attribute and the active class are driven by the *same* expression on the same
  element, the attribute is absent (not `false`) on inactive items, and the
  compiled bundle contains the correct conditional.
- **Mobile drawer scrim + scroll lock on real touch/resize** — the DOM assertions
  from 3.2 all pass (scrim renders, z-order correct at 95 < 110, body locks to
  `hidden` and releases to `''` on close), but this was driven programmatically,
  not by real touch.

The load-bearing detail if any of these is ever debugged: **the observer's
null-guard at `App.tsx`'s scrollspy effect is not defensive decoration.**
`observer.observe(null)` throws `TypeError`; `observer.observe(detachedNode)` does
**not** throw and silently never fires. That second behaviour is why a broken
scrollspy would produce no error anywhere.

## Vercel deployment status

**Live and auto-deploying correctly as of this session** — reported and confirmed
by Teku from the Vercel dashboard, not independently verifiable from here (Claude
Code has no Vercel access).

Earlier in the session the GitHub webhook appeared stale / silently non-functional;
it either self-resolved or was resolved by a reconnect. Prompted the throwaway test
commit below. **Worth spot-checking again if a future push doesn't appear in
Deployments within a couple of minutes** — the failure mode was silent, with no
error surfaced anywhere.

## README.md — throwaway scaffolding, not real documentation

`README.md` was created this session purely to trigger a push and test the webhook.
Full contents:

```markdown
# Monarch Design System

<!-- deployment webhook test, 2026-07-31 -->
```

Committed as `9557e99` "test: verify Vercel deploy webhook". The title line exists
only so the file doesn't render blank on GitHub. **This is scaffolding — Phase 6.6
("READMEs + case study framing") will overwrite it entirely.** Do not treat it as
documentation, and don't build on it.

## Standing note — handoff discovery is still not automated

Repeated unchanged from the 07/31 handoff: **`CLAUDE.md` still contains no
instruction to look for the newest `MONARCH-CHAT-HANDOFF-*.md` file.** Reading the
latest handoff at session start remains a manual convention that depends on Teku
saying so, not something the tooling enforces. Worth fixing at some point; still
hasn't been done. (There are now 12 dated handoff files at repo root, so "read the
newest" is increasingly non-obvious to a fresh session.)

## NEXT STEP — Phase 4: MVP Scaffold + Linkage Proof

**In a NEW repository (`Monarch-MVP`), not this one.** Per roadmap decision D2, the
two repos stay permanently separate, each with its own remote and Vercel project.

First step is **4.1 — Scaffold repo**: Vite + React + TS, mobile viewport, cloned as
a **sibling folder** to this one locally (the conditional alias in 4.2 depends on
that adjacency), pushed to its own GitHub remote.

The critical gate is **4.4 — Prove live propagation**: change a radius token here,
confirm the MVP hot-reloads with it. The roadmap marks it *"STOP. If this fails,
nothing after it matters."*

Two things worth carrying into that work:
- `resolve.dedupe: ['react','react-dom']` is the line that prevents the classic
  "Invalid hook call" from two React copies — it's in the roadmap's linkage pattern.
- This package is consumable: `v1.0.0` is tagged **and pushed**, `dist/` builds clean
  with types, and the `prepare` script regenerates `dist/` on install (required,
  since `dist/` is gitignored and the MVP installs via a pinned git tag).

## Open decisions still parked for Teku

Carried forward, unchanged unless noted:

- **#2 — Tab/ToastMobile showcase-anchor structure.** *Resolved this session:*
  Tab+Tabs and Toast+ToastMobile stay combined as single sidebar entries, matching
  the Card/Header/Item/Navigation family convention. Recorded as a comment next to
  `SIDEBAR_CATEGORIES`.
- **#8** — `variant` vs `appearance` split (5 vs 13 components); 0.2 explicitly did
  not confirm it as a defect.
- **#24** — `isRequired` coverage gap (Select, DatePicker, TimePicker, TextArea,
  SelectTransfer, SelectWalletAccount). Needs Figma access.
- **#21 / #22** — Escape-to-close gap across the Select family; SelectWalletAccount
  has no focus-indication CSS. Both deliberately not asserted around in tests.
- **`aria-current` value inconsistency** (new this session) — showcase sidebar uses
  `"location"`, DS components use `"page"`. Both valid; needs a call if uniformity
  is wanted.
- **`<Section>`'s `background` and `noTopPadding` props are now unused by any
  caller** (new this session) after the Foundations flattening. Kept because Section
  is a general wrapper; remove if you'd rather it stay minimal.
- **Motion/elevation token layer** — `0.12s` transitions, z-index, and some opacity
  values still have no backing token. Unchanged.

## Deeper-testing candidates (accumulated, still open)

The suite is smoke-level by design. These have real behaviour it does not cover:
**Modal** (focus trap, Escape, scrim dismissal), **Toast/ToastMobile** (presentation
lifecycle — neither has a visibility prop or auto-dismiss timer), **DatePicker /
TimePicker** (calendar open/close, date parsing), **RangeSlider** (thumb clamping,
two-way Field sync), **Slider/RangeSlider** (keyboard stepping), **Blanket**
(click-to-dismiss). Add to this list: the **showcase shell itself** has no tests at
all — the 43-section reachability check that gates Phase 3 acceptance is run
manually in the browser, not asserted anywhere in CI.

## Verification standards used throughout Phase 3

- `getComputedStyle` and DOM assertions in **both themes**, never screenshots — the
  screenshot tool failed repeatedly again this session ("Browser pane is not
  displayed, not compositing frames"), consistent with `CLAUDE.md`'s standing note.
- **Finish transitions before reading any transitioned property:**
  `document.getAnimations().forEach(a => { try { a.finish() } catch(e) {} })`. The
  `try/catch` matters — an infinite animation (e.g. `Loader`) throws
  `InvalidStateError` and would abort the rest of the check.
- **Baselines captured before changing anything**, so before/after comparisons are
  real measurements rather than recollection.
- **Large mechanical edits go through a scratch script with integrity checks, run to
  a temp file first** — the 43-section `<Section>` migration was validated for
  bracket balance, tag pairing, and unchanged component tag counts before being
  applied. This follows the precedent set by the 07/24 section reorder.
- **False positives were caught by checking rather than assuming**, twice this
  session: a "drawer scrim exists" reading that was actually matching
  `mn-header-bg__scrim` inside the Header *demo*, and a "shadow missing on
  BottomNavigation/Toggle" reading caused by probing the wrapper element instead of
  the child that carries the shadow.

## Uncommitted / unpushed right now

**Nothing.** Working tree clean, `main` in sync with `origin/main` at `1fdd521`,
`v1.0.0` tagged locally and on the remote.

The two handoff files written this session (`MONARCH-CHAT-HANDOFF-08012026.md` and
`MONARCH-CLAUDE-CHAT-HANDOFF-08012026.md`) are new and untracked until Teku commits
them via Sourcetree, per the standing rule that Claude Code never pushes.
