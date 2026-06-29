---
name: monarch-component
description: Build a Monarch Design System component from a Figma selection. Use when asked to build, add, or update any component from Figma. Enforces token-only styling, fail-loud checks, docs, and showcase entry.
---

# Monarch component build

Procedure for building any Monarch component. The user names a component and has it selected in the Figma desktop app.

## 1. Read first — never skip
- Read via the **figma-desktop** MCP server (local, http://127.0.0.1:3845/mcp) from the CURRENT SELECTION. Do NOT use the remote Figma server.
- REPORT before building: every variant/property with values, all states (default/hover/pressed/focus/disabled), and any NESTED component instances.
- If it nests a component not yet in src/components/, STOP and say so — build the child first. Never re-implement a child's markup.

## 2. Build
- React + TypeScript. One folder: src/components/<Name>/<Name>.tsx + index.ts. Typed props per variant.
- TOKENS ONLY — never hardcode color/spacing/radius/shadow/type:
  - surface/text/border/color -> var(--mapped-*) (prefer mapped for light/dark; only fall back to --alias-*/--brand-* if no mapped token exists, and note it)
  - spacing/radius/border-width -> var(--spacing-*) / var(--brand-scale-*)
  - shadow -> var(--shadow-*);  type -> the .type-* classes
- States via pseudo-classes: :hover -> -hover token, :active -> -pressed, :disabled -> disabled token, :focus-visible -> token-based ring.
- Swappable content = ReactNode slots. Icon/Avatar/Logo compose ElementWrapper internally. Icons + custom icons use currentColor; logos KEEP their own colors (never tokenize logo color).

## 3. Validate — FAIL LOUD
If any value has no matching token, or a slug collides, or a ref doesn't resolve: STOP and name it. Never invent a fallback or hardcode.

## 4. Document
Append a "## <Name>" section to docs/component-tokens.md matching existing entries: props table, variant×state -> token table, geometry table, and "Known Figma inconsistencies" (record source quirks faithfully; mark confirmed vs inferred).

## 5. Showcase
Add a <Name> section under the Components tab in src/App.tsx — every variant/state, a row per state. Keep the global light/dark toggle working.

## 6. Finish
STOP. Give the `npm run dev` command. Do NOT push — the user pushes manually via Sourcetree. Report variants found + the exact token mapping used.

Reference CLAUDE.md for project rules and src/components/ for the house pattern.
