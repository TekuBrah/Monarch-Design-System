import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Select } from './Select'
import type { SelectAppearance } from './Select'

const APPEARANCES: SelectAppearance[] = ['standard', 'subtle']

describe('Select', () => {
  it('renders without crashing', () => {
    render(<Select ariaLabel="Account" />)
    expect(screen.getByRole('combobox', { name: 'Account' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<Select ariaLabel="Account" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-select--${appearance}`)
  })

  // Step 1.2 classified Select as HYBRID: the inner input/chevron carry the real
  // disabled attribute, while the outer control <div> relies on a manual
  // `if (isDisabled) return` JS guard. Both halves are asserted.
  it('natively disables its inner controls, and its outer click guard does not crash', () => {
    const { container } = render(<Select ariaLabel="Account" isDisabled />)
    expect(screen.getByRole('combobox', { name: 'Account' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Open options' })).toBeDisabled()

    const control = container.querySelector('.mn-select__control')
    expect(control).not.toBeNull()
    expect(() => fireEvent.click(control!)).not.toThrow()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<Select ariaLabel="Account" isInvalid />)
    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Select ariaLabel="Account" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
