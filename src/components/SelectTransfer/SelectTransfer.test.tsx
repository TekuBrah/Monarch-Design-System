import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { SelectTransfer } from './SelectTransfer'
import type { SelectTransferAppearance } from './SelectTransfer'

const APPEARANCES: SelectTransferAppearance[] = ['standard', 'subtle', 'attention']

describe('SelectTransfer', () => {
  it('renders without crashing', () => {
    render(<SelectTransfer ariaLabel="Amount" />)
    expect(screen.getByRole('combobox', { name: 'Amount' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<SelectTransfer ariaLabel="Amount" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-select-transfer--${appearance}`)
  })

  // Step 1.2 classified SelectTransfer as HYBRID: the inner amount input and
  // currency button carry the real disabled attribute, while the outer control
  // <div> relies on a manual `if (isDisabled) return` JS guard.
  it('natively disables its inner controls, and its outer click guard does not crash', () => {
    const { container } = render(
      <SelectTransfer ariaLabel="Amount" currencyLabel="MYR" isDisabled />,
    )
    expect(screen.getByRole('combobox', { name: 'Amount' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Choose currency' })).toBeDisabled()

    const control = container.querySelector('.mn-select-transfer__control')
    expect(control).not.toBeNull()
    expect(() => fireEvent.click(control!)).not.toThrow()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<SelectTransfer ariaLabel="Amount" isInvalid />)
    expect(screen.getByRole('combobox', { name: 'Amount' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<SelectTransfer ariaLabel="Amount" currencyLabel="MYR" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // G19 (Gate 73). Same shape as Select.sizing (G15). Asserted by class, never
  // by pixels: jsdom applies no stylesheet, and any container at or under 320px
  // renders both modes identically anyway.
  describe('sizing', () => {
    it('omits the transfer fill modifier by default', () => {
      const { container } = render(<SelectTransfer ariaLabel="Amount" />)
      expect(container.firstChild).toHaveClass('mn-select-transfer')
      expect(container.firstChild).not.toHaveClass('mn-select-transfer--fill')
    })

    it('applies the transfer fill modifier when sizing is fill', () => {
      const { container } = render(<SelectTransfer ariaLabel="Amount" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-select-transfer--fill')
    })

    it("treats an explicit transfer 'fixed' as identical to omitting the prop", () => {
      const a = render(<SelectTransfer ariaLabel="Amount" sizing="fixed" />)
      const explicit = (a.container.firstChild as HTMLElement).className
      a.unmount()
      const b = render(<SelectTransfer ariaLabel="Amount" />)
      expect(explicit).toBe((b.container.firstChild as HTMLElement).className)
    })

    it.each(APPEARANCES)('composes transfer fill alongside the %s appearance', appearance => {
      const { container } = render(
        <SelectTransfer ariaLabel="Amount" appearance={appearance} sizing="fill" />,
      )
      expect(container.firstChild).toHaveClass(`mn-select-transfer--${appearance}`)
      expect(container.firstChild).toHaveClass('mn-select-transfer--fill')
    })
  })
})
