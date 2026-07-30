# Monarch Design System — Chat Handoff (2026-07-31)

Every claim below was verified fresh this session — `git status`, `git log
--oneline`, `git tag -l`, `git ls-remote --tags origin`, a full
`npx vitest run`, `npm run build`, and `npm run build:lib` — not carried
forward from prior handoff text except where explicitly marked. All earlier
dated `MONARCH-CHAT-HANDOFF-*.md` files are left in place, unedited, as
historical record — read this file for current state.

**Note on how "latest handoff" gets found:** `CLAUDE.md` contains no
automated instruction to check for the newest `MONARCH-CHAT-HANDOFF-*.md`
file — that has been a manual instruction at the start of each session, not
a persisted rule. The `MMDDYYYY` filename convention does sort correctly by
both string order and calendar date, so "most recent by filename" reliably
finds this file — but nothing enforces that check happening automatically.
Worth knowing so the next session doesn't assume a mechanism that isn't
there.

## Who / goal / rules — pointer only

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Standing rules live
in `CLAUDE.md`; the locked plan lives in `MONARCH-BUILD-ROADMAP.md`. Read both
before acting. Claude Code never pushes and never creates PRs — Teku handles
all pushes via Sourcetree.

## CURRENT STATE — verified fresh this session

| Check | Result |
|---|---|
| Working tree | **clean** (`git status` → nothing to commit) |
| Latest commit | `6248fb0` ("package.json's version changed 0.0.0 → 1.0.0") |
| Local vs remote | local `main` is **2 commits ahead** of `origin/main` — not pushed |
| Tag | `v1.0.0` exists **locally only** — `git ls-remote --tags origin` returns empty. **Not yet pushed.** Push is Teku's action via Sourcetree, same as every commit. |
| Test suite | **377 passed / 377**, 55 files, zero failures |
| `npm run build` (showcase) | **exit 0** (only the pre-existing >500 kB chunk-size advisory) |
| `npm run build:lib` (library) | **exit 0** — `dist/index.js` 5,577.96 kB, `dist/index.css` 135.81 kB, `dist/index.d.ts` + 110 per-component/token `.d.ts` files |
| Components | **45** folders, **55** test files, 45/45 covered (unchanged since Phase 1) |

**Phase 0, Phase 1, and Phase 2 are all fully complete.** All 7 Phase 2 steps
(2.1–2.7) are done. Phase 2's acceptance criterion from the roadmap —
"the showcase renders visually identical to before" **and** "`dist/` builds
clean with types" — is met; both were re-verified directly at 2.7's
phase-closing gate, not assumed from earlier steps.

## What Phase 2 actually shipped

- **2.1 — Directory restructure.** `src/App.tsx`, `AppShell.css`, `main.tsx`
  moved to `showcase/` via `git mv` (clean renames, history preserved).
  `src/` is now library-only: `components/`, `tokens/`, `styles/`, `test/`,
  `vite-env.d.ts`. Audit finding #17 (`AppShell.css`'s unscoped `html, body {}`
  rule) confirmed landed in `showcase/`, not `src/`, as the audit expected.
- **2.2 — Barrel export.** `src/index.ts` re-exports all 45 components +
  `./tokens`.
- **2.3 — Library build config.** `vite.config.lib.ts` — ESM-only lib build,
  `vite-plugin-dts` for declarations, React/ReactDOM externalized.
- **2.4 — `package.json` contract.** Renamed to `@monarch/design-system`,
  `exports` map, `files: ["dist"]`, `sideEffects`, `react`/`react-dom` moved
  to `peerDependencies`, `prepare` script wired to `build:lib`.
- **2.5 — Showcase re-wires to the package specifier.** `showcase/` now
  imports `@monarch/design-system` / `@monarch/design-system/styles.css`,
  not relative paths into `src/`. Zero relative `../src` imports remain in
  `showcase/`.
- **2.6 — Verify the built artifact, plus close a real gap.** Found and
  fixed: `dist/index.css` originally shipped component CSS only, never the
  token/typography CSS — every shipped component would have referenced
  undefined custom properties. Fixed by importing the new
  `src/styles/package.css` aggregate as a side effect in `src/index.ts`.
- **2.7 — Tag `v1.0.0`.** Version bumped `0.0.0` → `1.0.0` to match; annotated
  tag created locally, pointing at the version-bump commit.

## Key decisions made during Phase 2, not in the original roadmap

- **Single combined `index.css`, not the roadmap's original `tokens.css` /
  `styles.css` split.** No consumer in this architecture ever needs tokens
  without component styles — the MVP never builds independent primitives
  (Phase 4's `CLAUDE.md` rules forbid it). `exports` map has one
  `"./styles.css"` entry pointing at `dist/index.css`.
- **`src/styles/package.css` created as a new source-level CSS aggregate**
  (`globals.css` + `typography.css` + all 51 component CSS files, hand-
  maintained with a comment explaining why). Needed for two reasons: (1) dev
  mode needs something real for the `@monarch/design-system/styles.css`
  alias to resolve to, since `dist/index.css` only exists after a build; (2)
  it's what closes the 2.6 gap — importing it as a side effect from
  `src/index.ts` is what makes `dist/index.css` actually ship tokens.
- **`vite-plugin-dts` added as a devDependency** (flagged and approved before
  installing — was not present at all). **`rollupTypes`/`@microsoft/api-
  extractor` deliberately NOT added** — `rollupTypes: true` silently no-ops
  without `api-extractor`, and the per-file `.d.ts` output (reachable via
  the barrel's re-export chain) already satisfies "`.d.ts` covering the full
  public API." A second new-dependency judgment call wasn't worth it for a
  cosmetic single-file flatten.
- **`@types/node` added as a devDependency** (flagged and approved). This
  was a latent gap since `vite.config.lib.ts`'s introduction in 2.3 —
  `tsc -b` never covered that file (`tsconfig.node.json`'s `include` only
  lists `vite.config.ts`/`vitest.config.ts`), so its `node:path`/`__dirname`
  usage went untyped and undetected until `vite.config.ts` needed the same
  pattern in 2.5, which **is** covered by `tsc -b`.
- **`react`/`react-dom` moved to `peerDependencies`, deliberately NOT
  duplicated into `devDependencies`.** Verified directly: a fresh `npm
  install` in this repo resolves them into `node_modules` via npm 7+'s
  peer-auto-install, so local dev/test/build all work without the
  duplication the roadmap didn't ask for.
- **`prepare` script added** (`npm run build:lib`). Required because
  `dist/` is gitignored — when Monarch-MVP later installs this package via
  the pinned git tag (not the local source alias), there is no built output
  in the git tree at all. `prepare` is the only mechanism that produces
  `dist/` in that scenario. Verified directly, not just read: a fresh
  `npm install` after deleting `dist/` regenerated it automatically via the
  `prepare` hook.
- **`package.json` version bumped `0.0.0` → `1.0.0`** to match the `v1.0.0`
  tag — flagged at 2.4 as a loose end, closed here at 2.7.

## Two real bugs found and fixed during Phase 2 verification (not planned work)

- **2.3 — `react/jsx-runtime` was bundled despite `react`/`react-dom` being
  externalized.** `@vitejs/plugin-react`'s automatic JSX transform imports
  `react/jsx-runtime` as a separate specifier from `react` — externalizing
  only the latter two left the `jsx`/`jsxs` implementations inlined into
  `dist/index.js`. Fixed by adding `'react/jsx-runtime'` and
  `'react/jsx-dev-runtime'` to `rollupOptions.external`. Re-verified: zero
  React internals in the 5.58 MB bundle, only three externalized import
  specifiers.
- **2.6 — `dist/index.css` shipped component CSS only, never tokens.** See
  above under "Key decisions" — this would have shipped a package where
  every component rendered with undefined CSS custom properties, silently,
  with no build error. Verified fixed by grepping the built `dist/index.css`
  directly for real `--brand-*`/`--alias-*`/`--mapped-*` declarations and
  `.type-*` classes, not just checking file size or existence.

## NEXT STEP — Phase 3, Step 3.1 (retrieve + review Phase 0 output)

Per the roadmap: **fresh chat required** — Phase 2 is closed, and this
project's thread-hygiene convention is one phase per chat. Step 3.1 is:
retrieve and review the original Phase 0 output (the grouping table and
shell structure Claude Code already produced back in Phase 0), re-validate
it against the Step 0.1 component roster (the 45-folder list), then
**STOP** — the roadmap marks this step with an explicit stop gate before
3.2 (shell implementation) begins.

## Known-good but unverified-since

- The Vercel deploy from Step 0.8 (`https://monarch-design-system.vercel.app`)
  is a snapshot of the **pre-Phase-1** showcase. Still not redeployed —
  Roadmap Step 3.6 replaces it. Nothing depends on it before then.

## Open decisions still parked for Teku

Unchanged this session, carried forward from the audit:

- **#2** — Tab/ToastMobile showcase-anchor structure: intentional or a gap?
- **#8** — `variant` vs `appearance` split (5 vs 13 components); 0.2 explicitly
  did not confirm it as a defect.
- **#24** — `isRequired` coverage gap (Select, DatePicker, TimePicker, TextArea,
  SelectTransfer, SelectWalletAccount). Needs Figma access to resolve.
- **#21 / #22** — Escape-to-close gap across the Select family; SelectWalletAccount
  has no focus-indication CSS. Both parked, deliberately **not** asserted around
  in the test suite.

## Deeper-testing candidates (accumulated across Phase 1, still open)

The suite is smoke-level by design. These have real behavior it does not cover:
**Modal** (focus trap, Escape-to-close, scrim dismissal), **Toast/ToastMobile**
(presentation lifecycle — note neither has a visibility prop or auto-dismiss
timer today), **DatePicker/TimePicker** (calendar/list open-close, date parsing),
**RangeSlider** (thumb clamping, two-way Field sync), **Slider/RangeSlider**
(keyboard stepping), **Blanket** (click-to-dismiss).

## Verification standards used throughout Phase 2

- `getComputedStyle` in both themes, not screenshots — the preview pane has
  been unreliable within sessions (documented in `CLAUDE.md`). Screenshots
  are a nice-to-have once computed-style checks pass.
- **Transitions must be finished before reading a transitioned property** —
  `document.getAnimations().forEach(a => { try { a.finish(); } catch(e) {} })`
  before any `background`/`border-color`/`color` read in the preview pane.
  The `try/catch` matters: an infinite-target animation (e.g. a `Loader`
  spinner) throws `InvalidStateError` on `.finish()` and will abort the rest
  of the check if not caught.
- Content-level verification over existence-level — e.g. 2.6 grepped
  `dist/index.css` for actual `:root` custom-property declarations and
  `.type-*` class rules, not just confirmed the file was non-empty; 2.5
  confirmed real computed styles reached the DOM through the new alias
  chain, not just that the build succeeded.
- Every "confirmed committed" claim from Teku was independently re-verified
  via `git status`/`git log`/`git show` before the next step proceeded —
  never taken on word, per explicit instruction each time it came up this
  session.

## Standing rules (pointer, unchanged)

Full detail in `CLAUDE.md` and `MONARCH-BUILD-ROADMAP.md`. Highlights that
were load-bearing this session:
- Claude Code never pushes, never creates PRs, never commits without being
  asked — Teku commits and pushes via Sourcetree.
- Ground truth is disk and git, never session memory or a prior turn's
  claim — re-verify before acting on any "this is done" statement.
- New dependencies require an explicit stop-and-ask before installing, one
  judgment call surfaced at a time (this session: `vite-plugin-dts`,
  `@types/node`).
- STOP gates in the roadmap are real stops — report and wait, don't
  continue into the next step on inference that it's probably fine.

## Uncommitted / unpushed right now

**Nothing uncommitted.** Working tree clean at `6248fb0`. Two commits and
one annotated tag (`v1.0.0`) exist **locally only** — none of it is pushed.
That is Teku's step, via Sourcetree, same as always.
