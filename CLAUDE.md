# CLAUDE.md

## Project
Personal design-system codebase — reusable foundation for future apps/sites.
NOT a product. Goal: a stable, typed component library built on Figma design tokens.

## Stack
Vite + React + TypeScript.

## Token pipeline (source → generated)
- SOURCE OF TRUTH: `design-tokens/*.json` (Token Studio exports:
  Brand, Alias, Mapped, Responsive, plus $themes.json + $metadata.json).
- GENERATED OUTPUTS (never hand-edit):
  - `src/tokens/*.ts`  — one typed file per collection + index.ts
  - `src/styles/globals.css` — CSS custom properties:
    light values on `:root`, dark on `[data-theme="dark"]`.
- Keep Token Studio alias chains intact (primitive → alias → semantic).
  Build the cascade as var() references — never flatten to hardcoded hex.

## Structure
design-tokens/ (raw JSON) · src/tokens/ · src/styles/ · src/components/<Name>/
src/main.tsx (entry) · src/App.tsx (showcase page)

## Commands
- `npm run dev` — local dev server (preview components live)

## Working conventions
- Incremental. One layer/component at a time. Verify before proceeding.
- Verify the Brand primitive layer BEFORE building Alias/Mapped/Responsive.
- Do not generate many files unseen — show output, I review, then continue.
- Components consume tokens (CSS vars). No hardcoded colors/spacing.
- Components are built one at a time, later, on top of the token foundation.