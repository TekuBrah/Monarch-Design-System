# Monarch — Seed for the next Claude.ai review chat (2026-08-01)

Short context file for starting a **fresh Claude.ai thread** (the review/prompting
layer — not Claude Code). Enough to pick up Phase 4 without reading the full
technical handoff first.

## Where things stand

**Phase 3 (Showcase Redesign) is complete and deployed.** The Monarch Design System
repo is on `main`, working tree clean, local in sync with `origin/main` at commit
`1fdd521`, tag `v1.0.0` pushed. Showcase build, library build (`dist/` with types),
and the full test suite (**377/377 across 55 files**) all pass as of session close.
The showcase is live on Vercel and auto-deploying.

45 component folders → 43 showcase sections, every one reachable via sidebar and
search in both light and dark mode (re-verified live at session close — that's the
roadmap's Phase 3 acceptance criterion).

One characterisation worth carrying: **Phase 3 was mostly bug-fixing, not feature
work.** The shell, the sidebar, and search all already existed from Phase 0; the
phase surfaced ~20 real defects instead — including a token-generation regression
that had silently removed every shadow in the codebase, and a CSS selector that had
been dead since Phase 1.3's class-prefixing pass. Expect the same pattern to be
worth probing for in Phase 4.

## Read these, in this order

1. **`MONARCH-CHAT-HANDOFF-08012026.md`** (same repo root) — the full technical
   handoff. Verified-fresh state table, complete Phase 3 bug list, outstanding
   items, and the Phase 4 pointer. Read this before prompting any build work.
2. **`MONARCH-BUILD-ROADMAP.md` → "Phase 4 — MVP Scaffold + Linkage Proof"** — the
   locked plan: steps 4.1–4.7, the dual-mode linkage pattern, and the five MVP
   `CLAUDE.md` guardrails. Also re-read the **locked decisions D1–D8** table; those
   are settled and shouldn't be relitigated without a stated reason.

## What's next

**Phase 4, starting at step 4.1 — scaffold `Monarch-MVP`.**

This is a **new repository**, not the design-system repo. Per decision D2 the two
stay permanently separate, each with its own GitHub remote and Vercel project, and
per D3 the dependency runs one direction only (MVP imports the DS, never the
reverse). Clone it as a **sibling folder** to the DS locally — the conditional Vite
alias in 4.2 depends on that adjacency.

The gate that matters is **4.4 — prove live propagation** (change a token in the DS,
confirm the running MVP hot-reloads with it). The roadmap marks it *"STOP. If this
fails, nothing after it matters."* Everything before it is setup; nothing after it
is meaningful until it passes.

## Division of labour — unchanged, and it applies identically in the new repo

- **Claude Code builds** — one component/step at a time, with the three-gate
  checkpoint discipline on the design system. (Note the roadmap's Phase 5 method
  note: gating loosens for MVP *screens*, which are compositions of already-verified
  parts — tight leash on the DS, looser on the MVP. Getting this backwards is the
  actual risk.)
- **This chat reviews and writes the prompts** — reads Claude Code's reports, decides
  scope, catches drift, and issues the next instruction.
- **Teku pushes, manually, via Sourcetree.** Claude Code never pushes, never opens
  PRs, never touches remotes. This holds in `Monarch-MVP` too and should be written
  into that repo's `CLAUDE.md` as rule 5 when 4.5 comes around.

## Two small things worth knowing up front

- **`README.md` in the DS repo is throwaway scaffolding** — a title line plus an HTML
  comment, created only to test the Vercel webhook. Phase 6.6 overwrites it. Don't
  treat it as documentation.
- **There is no automated instruction to read the newest handoff.** `CLAUDE.md`
  doesn't mention these files, so a fresh Claude Code session won't find this one on
  its own — it has to be pointed at it explicitly. Still a manual convention.
