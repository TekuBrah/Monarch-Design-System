import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Field } from './Field'
import type { FieldAppearance } from './Field'

const APPEARANCES: FieldAppearance[] = ['standard', 'subtle']

describe('Field', () => {
  it('renders without crashing', () => {
    render(<Field ariaLabel="Search" />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<Field ariaLabel="Search" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-field--${appearance}`)
  })

  it('associates a visible label with the input', () => {
    render(<Field label="Amount" />)
    expect(screen.getByRole('textbox', { name: /Amount/ })).toBeInTheDocument()
  })

  // Deviation, flagged: isCompact is an icon-only square that renders NO input
  // at all (per Field.tsx), so it is queried as role="img" rather than textbox.
  it('renders the compact variant as a labelled image box with no textbox', () => {
    render(<Field isCompact ariaLabel="Search" />)
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  // Step 1.2: native-backed — isDisabled reaches the real <input disabled>.
  it('natively disables the input when isDisabled is set', () => {
    render(<Field ariaLabel="Search" isDisabled />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeDisabled()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<Field ariaLabel="Search" isInvalid />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-required when isRequired is set', () => {
    render(<Field ariaLabel="Search" isRequired />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveAttribute('aria-required', 'true')
  })

  // === sizing (gap B2) =================================================
  // Verified by DECLARATION, not by pixels: jsdom applies no stylesheet, and
  // even in a browser any container at or under 240px renders both modes
  // identically. What proves the prop took effect is the modifier applying.
  describe('sizing', () => {
    it('emits no sizing modifier when the prop is omitted', () => {
      const { container } = render(<Field ariaLabel="Search" />)
      expect(container.firstChild).not.toHaveClass('mn-field--fill')
    })

    it("explicit 'fixed' equals omission — no modifier", () => {
      const { container } = render(<Field ariaLabel="Search" sizing="fixed" />)
      expect(container.firstChild).not.toHaveClass('mn-field--fill')
    })

    it("'fill' applies the fill modifier", () => {
      const { container } = render(<Field ariaLabel="Search" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-field--fill')
    })

    it("'fill' preserves the base and appearance classes", () => {
      const { container } = render(<Field ariaLabel="Search" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-field', 'mn-field--standard', 'mn-field--fill')
    })

    // The compact branch returns EARLY from a different JSX tree, so the
    // modifier reaching it at all is what the CSS source-order rule depends on
    // — .mn-field--compact { width: auto } is declared after --fill and wins.
    it('still emits the fill modifier on the compact branch, where CSS order makes it inert', () => {
      const { container } = render(<Field isCompact ariaLabel="Search" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-field--compact', 'mn-field--fill')
    })

    it('compact without sizing carries no fill modifier', () => {
      const { container } = render(<Field isCompact ariaLabel="Search" />)
      expect(container.firstChild).toHaveClass('mn-field--compact')
      expect(container.firstChild).not.toHaveClass('mn-field--fill')
    })

    it('has no axe violations with sizing="fill"', async () => {
      const { container } = render(<Field ariaLabel="Search" sizing="fill" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Field ariaLabel="Search" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
