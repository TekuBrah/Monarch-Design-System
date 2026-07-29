import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { TimePicker } from './TimePicker'
import type { TimePickerAppearance } from './TimePicker'

const APPEARANCES: TimePickerAppearance[] = ['standard', 'subtle']

// Deliberately NOT covered (smoke scope): opening/closing the time list and any
// time-selection logic. Flagged as a candidate for deeper testing later.
describe('TimePicker', () => {
  it('renders without crashing', () => {
    render(<TimePicker ariaLabel="Start time" />)
    expect(screen.getByRole('combobox', { name: 'Start time' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<TimePicker ariaLabel="Start time" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-timepicker--${appearance}`)
  })

  // Step 1.2 classified TimePicker as HYBRID: the inner input carries the real
  // disabled attribute, while the outer control <div> relies on a manual
  // `if (isDisabled) return` JS guard.
  it('natively disables its input, and its outer click guard does not crash', () => {
    const { container } = render(<TimePicker ariaLabel="Start time" isDisabled />)
    expect(screen.getByRole('combobox', { name: 'Start time' })).toBeDisabled()

    const control = container.querySelector('.mn-timepicker__control')
    expect(control).not.toBeNull()
    expect(() => fireEvent.click(control!)).not.toThrow()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<TimePicker ariaLabel="Start time" isInvalid />)
    expect(screen.getByRole('combobox', { name: 'Start time' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<TimePicker ariaLabel="Start time" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
