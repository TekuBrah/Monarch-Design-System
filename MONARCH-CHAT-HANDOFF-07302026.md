# Monarch Design System — Chat Handoff (2026-07-30)

Every claim below was verified fresh this session — `git status`, `git log
--oneline`, `ls src/components/`, a full `npx vitest run`, and a full
`npm run build` — not carried forward from prior handoff text except where
explicitly marked. All earlier dated `MONARCH-CHAT-HANDOFF-*.md` files are
left in place, unedited, as historical record — read this file for current
state.

## Who / goal / rules — pointer only

Teku is building a personal design-system codebase — a reusable, typed React
component library on Figma design tokens (not a product). Standing rules live
in `CLAUDE.md`; the locked plan lives in `MONARCH-BUILD-ROADMAP.md`. Read both
before acting. Claude Code never pushes and never creates PRs — Teku handles
all pushes via Sourcetree.

## CURRENT STATE — verified fresh this session

| Check | Result |
|---|---|
| Working tree | **clean** (`git status --short` → 0 entries) |
| Latest commit | `200bb39` |
| Test suite | **377 passed / 377**, 55 files, zero failures |
| `npm run build` | **exit 0** (only the pre-existing >500 kB chunk-size advisory) |
| Components | **45** folders, **55** test files, 45/45 covered |

**Phase 0 and Phase 1 are fully complete.** All 13 steps (0.1–0.8, 1.1–1.5)
are checked off in `MONARCH-BUILD-ROADMAP.md`. Everything is committed.
Nothing is pushed — that is Teku's step.

## What Phase 1 actually changed

- **1.1 — Size vocabulary.** Normalized to lowercase `xs/s/m/l/xl/xxl/xxxl`
  across 7 components. Verified against Figma first: every component's variant
  *count* already matched the design source, so this was a pure rename, not a
  scope change.
- **1.2 — `disabled` → `isDisabled`.** 5 components renamed (Button,
  ButtonGroup, IconButton, RangeSlider, Slider); the other 11 already conformed.
  The preceding investigation found the old split did **not** track any
  native-vs-simulated distinction — it was arbitrary.
- **1.3 — CSS prefixing.** All 51 root classes + their BEM children prefixed
  `mn-` across 104 files, plus 6 cross-component coupling selectors that had to
  be updated on both sides in the same pass.
- **1.4 — `onClick` normalization.** 7 components collapsed to `() => void`.
  `Link` deliberately kept `MouseEventHandler<HTMLAnchorElement>` — it renders a
  real `<a href>` whose default navigation a caller may need to `preventDefault()`.
- **1.5 — Smoke test suite.** Vitest + Testing Library + jest-axe, one file per
  component, 45/45 covered.

## Beyond the planned scope — read AUDIT Section F

Phase 1 was **not** purely its 5 steps. Five defects surfaced during execution
and are logged in `AUDIT-07272026.md` **Section F**:

- **F1 — false positive, no code changed.** "Field doesn't dark-flip" was a
  *measurement* artifact: the preview pane doesn't composite frames, so CSS
  transitions freeze at `currentTime: 0` and `getComputedStyle` returns the
  pre-transition value forever. **This is now a standing rule in `CLAUDE.md`** —
  always run `document.getAnimations().forEach(a => a.finish())` before reading
  any transitioned property.
- **F2 — `aria-expanded` on a non-combobox role** (DatePicker, TimePicker).
  Fixed by adding `role="combobox"`, matching their 3 siblings.
- **F3 — unnamed `role="progressbar"`** (ProgressBar, ProgressStepper). Fixed
  with generated fallbacks mirroring ProgressRing's existing pattern.
- **F4 — unnamed `role="listbox"`** (Menu). Added `listAriaLabel` with
  deliberately **no** default; all 8 listbox-rendering call sites given specific
  labels.
- **F5 — unnamed nested ProgressBar** (CardGoals). Self-generates from its own
  `title`; no new API.

F2–F5 were all found *by the new test suite* and all missed by Phase 0's a11y
sweep, which had reported ARIA wiring "100% clean" (finding #20). That is the
clearest evidence the suite is earning its keep.

## NEXT STEP — Phase 2, Step 2.1 (directory restructure)

`src/` becomes library-only; the showcase moves to `showcase/`. Per audit
finding #32 this must happen **first** — findings #17 and #25–#31 all depend on
it. Two things to know going in:

1. **Audit #17 (Critical) rides on this step.** `AppShell.css` has an unscoped
   `html, body {}` rule that would override a host page's background. It is
   commented showcase-only and is *expected* to land in `showcase/` here —
   the roadmap says verify that explicitly rather than assume it resolved.
2. **Test files are co-located** (`src/components/<Name>/<Name>.test.tsx`) and
   are currently inside `tsconfig.app.json`'s `include: ["src"]`, so `tsc -b`
   typechecks them during `npm run build`. Whatever the restructure does with
   `src/`, that relationship needs a deliberate decision — tests should not end
   up in the shipped library bundle.

## Known-good but unverified-since

- The Vercel deploy from Step 0.8 (`https://monarch-design-system.vercel.app`)
  is a snapshot of the **pre-Phase-1** showcase. It has not been redeployed
  since, so it does not reflect the `mn-` class prefixing or any Phase 1 fix.
  Roadmap Step 3.6 replaces it; nothing depends on it before then.

## Open decisions still parked for Teku

Carried forward from the audit, unchanged this session:

- **#2** — Tab/ToastMobile showcase-anchor structure: intentional or a gap?
- **#8** — `variant` vs `appearance` split (5 vs 13 components); 0.2 explicitly
  did not confirm it as a defect.
- **#24** — `isRequired` coverage gap (Select, DatePicker, TimePicker, TextArea,
  SelectTransfer, SelectWalletAccount). Needs Figma access to resolve.
- **#21 / #22** — Escape-to-close gap across the Select family; SelectWalletAccount
  has no focus-indication CSS. Both parked, deliberately **not** asserted around
  in the test suite.

## Deeper-testing candidates (accumulated across 1.5)

The suite is smoke-level by design. These have real behavior it does not cover:
**Modal** (focus trap, Escape-to-close, scrim dismissal), **Toast/ToastMobile**
(presentation lifecycle — note neither has a visibility prop or auto-dismiss
timer today), **DatePicker/TimePicker** (calendar/list open-close, date parsing),
**RangeSlider** (thumb clamping, two-way Field sync), **Slider/RangeSlider**
(keyboard stepping), **Blanket** (click-to-dismiss).

## Uncommitted / unpushed right now

**Nothing uncommitted.** Working tree clean at `200bb39`. Everything from this
session is committed locally and **not pushed** — Teku pushes via Sourcetree.
