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

  // sizing (Gate 45, gap G15) — mirrors the CardBalance.sizing suite added at
  // Gate 32 deliberately: the prop's whole rationale is that Select now shares
  // one shape with Field and the two Cards, so its tests should be comparable
  // to theirs rather than inventing a second form.
  //
  // ASSERTED BY DECLARATION, NOT BY PIXELS, and that is the standing rule for
  // this prop rather than a limitation here. CLAUDE.md records why: any
  // container at or under the component's own width renders both modes
  // identically and proves nothing. (In this suite it could not be pixels
  // anyway — vitest.config.ts sets no test.css option, so no stylesheet is
  // ever applied in jsdom.)
  describe('sizing', () => {
    it('omits the fill modifier by default', () => {
      const { container } = render(<Select ariaLabel="Account" />)
      expect(container.firstChild).toHaveClass('mn-select')
      expect(container.firstChild).not.toHaveClass('mn-select--fill')
    })

    it('applies the fill modifier when sizing is fill', () => {
      const { container } = render(<Select ariaLabel="Account" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-select--fill')
    })

    it("treats an explicit 'fixed' as identical to omitting the prop", () => {
      const a = render(<Select ariaLabel="Account" sizing="fixed" />)
      const explicit = (a.container.firstChild as HTMLElement).className
      a.unmount()

      const b = render(<Select ariaLabel="Account" />)
      const omitted = (b.container.firstChild as HTMLElement).className

      expect(explicit).toBe(omitted)
    })

    // The modifier must not displace or reorder the variant modifier that
    // shares the class string — Select composes appearance into the same list.
    it.each(APPEARANCES)('composes fill alongside the %s appearance', appearance => {
      const { container } = render(
        <Select ariaLabel="Account" appearance={appearance} sizing="fill" />,
      )
      expect(container.firstChild).toHaveClass('mn-select')
      expect(container.firstChild).toHaveClass(`mn-select--${appearance}`)
      expect(container.firstChild).toHaveClass('mn-select--fill')
    })

    it('leaves the combobox role and accessible name untouched', () => {
      render(<Select ariaLabel="Account" sizing="fill" />)
      expect(screen.getByRole('combobox', { name: 'Account' })).toBeInTheDocument()
    })

    it('has no axe violations when filling', async () => {
      const { container } = render(<Select ariaLabel="Account" sizing="fill" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
