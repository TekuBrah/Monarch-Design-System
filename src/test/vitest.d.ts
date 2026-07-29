import 'vitest'

// jest-axe ships no types of its own, and @types/jest-axe augments Jest's
// matchers (and pulls in the jest namespace), not Vitest's. Declare the one
// matcher we actually use against Vitest's extension point instead, so the
// project stays vitest-only and free of @types/jest.
interface CustomMatchers<R = unknown> {
  toHaveNoViolations(): R
}

declare module 'vitest' {
  interface Matchers<T = unknown> extends CustomMatchers<T> {}
}
