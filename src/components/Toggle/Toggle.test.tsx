import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Toggle } from './Toggle'
import type { ToggleSize } from './Toggle'

const SIZES: ToggleSize[] = ['m', 'l']

// Toggle renders no visible text — its accessible name comes from ariaLabel,
// so every query supplies one.
describe('Toggle', () => {
  it('renders without crashing, as a switch', () => {
    render(<Toggle ariaLabel="Dark mode" />)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument()
  })

  // Size lives on the wrapping <label> root; the queryable element is the input.
  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<Toggle ariaLabel="Dark mode" size={size} />)
    expect(container.firstChild).toHaveClass(`mn-toggle--${size}`)
  })

  it('reflects the checked state through aria-checked', () => {
    render(<Toggle ariaLabel="Dark mode" isChecked />)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'true')
  })

  // Step 1.2: native-backed — isDisabled reaches the real <input disabled>.
  it('natively disables the input when isDisabled is set', () => {
    render(<Toggle ariaLabel="Dark mode" isDisabled />)
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeDisabled()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Toggle ariaLabel="Dark mode" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
