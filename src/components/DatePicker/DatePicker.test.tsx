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

  // B2. The accessible name is asserted as a COMPUTED name, not as an
  // attribute — the whole point of mirroring Field's rule is which one wins.
  it('names the input via the visible label when `label` is given', () => {
    const { container } = render(<DatePicker label="Date (From)" />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAccessibleName('Date (From)')
    expect(input).not.toHaveAttribute('aria-label')
    // The <label htmlFor> must actually point at the input.
    const labelEl = container.querySelector('label.mn-datepicker__label')!
    expect(labelEl).toHaveAttribute('for', input.getAttribute('id'))
    expect(container.firstChild).toHaveClass('mn-datepicker--labeled')
  })

  it('falls back to ariaLabel when there is no visible label', () => {
    const input = render(<DatePicker ariaLabel="Start date" />).getByRole('combobox')
    expect(input).toHaveAccessibleName('Start date')
    expect(input).toHaveAttribute('aria-label', 'Start date')
  })

  // Both supplied: the visible label wins and ariaLabel is not emitted, so the
  // two can never fight over the name.
  it('prefers the visible label over ariaLabel when both are given', () => {
    const input = render(<DatePicker label="Date (To)" ariaLabel="Ignored" />).getByRole('combobox')
    expect(input).toHaveAccessibleName('Date (To)')
    expect(input).not.toHaveAttribute('aria-label')
  })

  // NO-CHANGE PROOF: omitting `label` must render exactly what it did before.
  it('renders no label element and no modifier when `label` is omitted', () => {
    const { container } = render(<DatePicker ariaLabel="Start date" />)
    expect(container.querySelector('.mn-datepicker__label')).toBeNull()
    expect(container.firstChild).not.toHaveClass('mn-datepicker--labeled')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<DatePicker ariaLabel="Start date" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations with a visible label', async () => {
    const { container } = render(<DatePicker label="Date (From)" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
