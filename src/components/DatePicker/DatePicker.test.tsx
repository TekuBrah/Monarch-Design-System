import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { DatePicker } from './DatePicker'
import type { DatePickerAppearance } from './DatePicker'

const APPEARANCES: DatePickerAppearance[] = ['standard', 'subtle']

// Deliberately NOT covered (smoke scope): opening/closing the calendar and any
// date-picking logic. Flagged as a candidate for deeper testing later.
describe('DatePicker', () => {
  it('renders without crashing', () => {
    render(<DatePicker ariaLabel="Start date" />)
    expect(screen.getByRole('combobox', { name: 'Start date' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<DatePicker ariaLabel="Start date" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-datepicker--${appearance}`)
  })

  // Step 1.2 classified DatePicker as HYBRID: the inner input carries the real
  // disabled attribute, while the outer control <div> relies on a manual
  // `if (isDisabled) return` JS guard.
  it('natively disables its input, and its outer click guard does not crash', () => {
    const { container } = render(<DatePicker ariaLabel="Start date" isDisabled />)
    expect(screen.getByRole('combobox', { name: 'Start date' })).toBeDisabled()

    const control = container.querySelector('.mn-datepicker__control')
    expect(control).not.toBeNull()
    expect(() => fireEvent.click(control!)).not.toThrow()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<DatePicker ariaLabel="Start date" isInvalid />)
    expect(screen.getByRole('combobox', { name: 'Start date' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<DatePicker ariaLabel="Start date" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
