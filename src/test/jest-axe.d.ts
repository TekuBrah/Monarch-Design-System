// jest-axe ships no type definitions of its own, and @types/jest-axe opens with
// `/// <reference types="jest" />` — adopting it would pull Jest's whole ambient
// namespace into this vitest-only project. So the surface actually used here is
// declared by hand instead.
//
// This file is intentionally an AMBIENT script (no top-level import/export):
// `declare module 'jest-axe'` inside a module file would be read as an
// augmentation, which TypeScript rejects for an untyped module.
// The Vitest matcher augmentation lives separately in ./vitest.d.ts.
declare module 'jest-axe' {
  export interface AxeViolation {
    id: string
    impact?: string | null
    description: string
    help: string
    helpUrl: string
    nodes: unknown[]
  }

  export interface AxeResults {
    violations: AxeViolation[]
    passes: unknown[]
    incomplete: unknown[]
    inapplicable: unknown[]
  }

  export function axe(
    html: Element | string,
    options?: Record<string, unknown>,
  ): Promise<AxeResults>

  export function configureAxe(options?: Record<string, unknown>): typeof axe

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): {
      pass: boolean
      actual: unknown
      message(): string
    }
  }
}
