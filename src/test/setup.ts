import '@testing-library/jest-dom/vitest'
import { afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Testing Library only auto-registers its afterEach cleanup when Vitest globals
// are enabled. We run with `globals: false`, so unmount explicitly — otherwise
// rendered trees leak between tests and `getByRole` hits duplicate matches.
afterEach(() => {
  cleanup()
})
