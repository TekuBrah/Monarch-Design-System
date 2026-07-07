---
name: monarch-component
description: Build a Monarch Design System component from a Figma selection. Use when asked to build, add, or update any component from Figma. Enforces token-only styling, fail-loud checks, docs, and showcase entry.
---

# Monarch component build

Procedure for building any Monarch component. The user names a component and has it selected in the Figma desktop app. Full rule details live in CLAUDE.md — this file is the procedural checklist, not the rulebook.

## 1. Read first — never skip
- Confirm the connected Figma desktop file is the Monarch design system file before reading the selection. If a different file is open, STOP and say so.
- Read via the **figma-desktop** MCP server (local, http://127.0.0.1:3845/mcp) from the CURRENT SELECTION. Do NOT use the remote Figma server.
- REPORT before building: every variant/property with values, all states (default/hover/pressed/focus/disabled), and any NESTED component instances.
- If it nests a component not yet in src/components/, STOP and say so — build the child first. Never re-implement a child's markup. Check the actual folder list on disk (`ls src/components/`), not session memory — a wrong answer here either falsely blocks the build or causes a re-implementation of something that already exists.
- **STOP here.** Wait for confirmation before writing code.

## 2. Build
- React + TypeScript. One folder: src/components/<Name>/<Name>.tsx + index.ts. Typed props per variant.
- TOKENS ONLY — never hardcode color/spacing/radius/shadow/type:
  - surface/text/border/color -> var(--mapped-*). Interactive states (hover/pressed/selected/focus) use --mapped-* ONLY — --alias-* never dark-flips.
  - Figma value with no matching token (missing opacity/tint, or an off-ramp px value)? STOP and ask — follow CLAUDE.md's token-source gap protocol. Never self-approve a color-mix() or a literal.
  - spacing/radius/border-width -> var(--spacing-*) / var(--brand-scale-*)
  - shadow -> var(--shadow-*);  type -> the .type-* classes
- States via pseudo-classes: :hover -> -hover token, :active -> -pressed, :disabled -> disabled token, :focus-visible -> token-based ring.
- Figma doesn't define a state for this component (no hover, no focus, etc.)? Never add one silently — flag and ask, per CLAUDE.md.
- Swappable content = ReactNode slots. Icon/Avatar/Logo compose ElementWrapper internally. Icons + custom icons use currentColor; logos KEEP their own colors (never tokenize logo color).
- Follow CLAUDE.md's API conventions (label prop not children, previewState 'pressed', onChange passes the new value, stable keys) and accessibility baseline (roles/aria, isRequired -> required + aria-required, keyboard per the ARIA pattern, no dangling aria-controls/aria-describedby). A11y is part of done, not optional.

## 3. Validate — FAIL LOUD
- If any value has no matching token, a slug collides, or a ref doesn't resolve: STOP and name it. Never invent a fallback or hardcode without explicit approval per the gap protocol.
- Grep the component's CSS for `--alias-`. Report zero matches — any hit must be fixed before moving on.
- Report the exact variant->token mapping as implemented.
- **STOP here.** Wait for approval before touching docs or App.tsx.

## 4. Document
Append a "## <Name>" section to docs/component-tokens.md matching existing entries: props table, variant×state -> token table, geometry table, and "Known Figma inconsistencies" (record source quirks faithfully; mark confirmed vs inferred).

## 5. Showcase
Add a <Name> section under the Components tab in src/App.tsx using the EXACT wrapper pattern in CLAUDE.md's "Showcase section pattern" — never invent new section styling. Every variant/state, a row per state. Keep the global light/dark toggle working.

## 6. Verify
Check computed styles (`getComputedStyle`) in BOTH light and dark mode — not the screenshot tool, which is unreliable. Confirm zero console errors. Confirm current build/component state from disk/git (ls, git log), not session memory.

## 7. Finish
STOP. Give the `npm run dev` command. Do NOT push — the user pushes manually via Sourcetree. Report variants found + the exact token mapping used.

Reference CLAUDE.md for full rule details (token-source gap protocol, alias/dark-flip discipline, API conventions, accessibility baseline, showcase pattern, checkpoint discipline) and src/components/ for the house pattern.
