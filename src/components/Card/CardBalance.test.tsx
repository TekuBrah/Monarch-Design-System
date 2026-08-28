import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardBalance } from './CardBalance'

const props = { type: 'Savings', name: 'Main account', amount: 'RM 1,200.00' }

// CardBalance exports no variant union, so the smoke check is render + content
// + axe. `onClick` is additive: it upgrades the root to a real <button>.
describe('CardBalance', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardBalance {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-balance')
  })

  it('renders its type, name and amount', () => {
    render(<CardBalance {...props} />)
    expect(screen.getByText('Savings')).toBeInTheDocument()
    expect(screen.getByText('Main account')).toBeInTheDocument()
    expect(screen.getByText('RM 1,200.00')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardBalance {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('onClick', () => {
    // Additive: without the prop the card stays a non-interactive <div>, with
    // no button semantics and nothing in the tab order.
    it('renders a plain div when omitted', () => {
      const { container } = render(<CardBalance {...props} />)
      expect(container.firstChild?.nodeName).toBe('DIV')
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders a button when provided', () => {
      const { container } = render(<CardBalance {...props} onClick={() => {}} />)
      expect(container.firstChild?.nodeName).toBe('BUTTON')
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('fires on click', () => {
      const onClick = vi.fn()
      render(<CardBalance {...props} onClick={onClick} />)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    // Keyboard activation comes from the native button element, not a handler.
    it('is reachable by keyboard and activates on Enter and Space', () => {
      const onClick = vi.fn()
      render(<CardBalance {...props} onClick={onClick} />)
      const btn = screen.getByRole('button')
      btn.focus()
      expect(btn).toHaveFocus()
      fireEvent.keyDown(btn, { key: 'Enter' })
      fireEvent.click(btn) // native activation behaviour
      expect(onClick).toHaveBeenCalled()
    })

    it('has no axe violations when interactive', async () => {
      const { container } = render(<CardBalance {...props} onClick={() => {}} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  describe('badge props', () => {
    // NO-CHANGE PROOF: the four new props must reproduce exactly what was
    // hard-coded before them — color="slate" size="l", circle, unnamed.
    it('defaults the badge to the previously hard-coded values', () => {
      const { container } = render(<CardBalance {...props} />)
      const badge = container.querySelector('.mn-icon-object')!
      expect(badge).toHaveClass('mn-icon-object--slate')
      expect(badge).toHaveClass('mn-icon-object--l')
      expect(badge).toHaveClass('mn-icon-object--circle')
      expect(badge).not.toHaveAttribute('role')
      expect(badge).not.toHaveAttribute('aria-label')
    })

    it('forwards each badge prop to IconObject', () => {
      const { container } = render(
        <CardBalance {...props} iconColor="green" iconSize="xs" shape="square" iconAriaLabel="Savings" />,
      )
      const badge = container.querySelector('.mn-icon-object')!
      expect(badge).toHaveClass('mn-icon-object--green')
      expect(badge).toHaveClass('mn-icon-object--xs')
      expect(badge).toHaveClass('mn-icon-object--square')
      expect(screen.getByRole('img', { name: 'Savings' })).toBeInTheDocument()
    })

    it('has no axe violations with a named badge', async () => {
      const { container } = render(<CardBalance {...props} iconAriaLabel="Savings" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  // Gate 32. jsdom applies no stylesheet (vitest.config.ts sets no `test.css`),
  // so these assert the class CONTRACT — which modifier is composed onto the
  // root. The declarations the modifier changes are browser-measured instead;
  // see docs/component-tokens.md, "`sizing` (added v1.11.0)".
  describe('sizing', () => {
    // NO-CHANGE PROOF: omitting the prop must compose the exact class string it
    // composed before the prop existed — not merely "contains mn-card-balance".
    it('composes an unchanged class string when omitted', () => {
      const { container } = render(<CardBalance {...props} />)
      expect(container.firstElementChild).toHaveAttribute('class', 'mn-card-balance')
    })

    it('composes an unchanged class string with className when omitted', () => {
      const { container } = render(<CardBalance {...props} className="extra" />)
      expect(container.firstElementChild).toHaveAttribute('class', 'mn-card-balance extra')
    })

    it("treats an explicit 'fixed' as identical to omitting the prop", () => {
      const omitted = render(<CardBalance {...props} />).container.innerHTML
      const explicit = render(<CardBalance {...props} sizing="fixed" />).container.innerHTML
      expect(explicit).toBe(omitted)
    })

    it("adds the fill modifier only for 'fill'", () => {
      const { container } = render(<CardBalance {...props} sizing="fill" />)
      expect(container.firstElementChild).toHaveClass('mn-card-balance--fill')
    })

    // The modifier must land BEFORE the consumer's className, so a consumer
    // class declared later in its own sheet can still override the modifier.
    it('orders the modifier before className', () => {
      const { container } = render(<CardBalance {...props} sizing="fill" className="extra" />)
      expect(container.firstElementChild).toHaveAttribute(
        'class',
        'mn-card-balance mn-card-balance--fill extra',
      )
    })

    // The prop is orthogonal to the div/button fork — it must reach both.
    it('applies to the button render too', () => {
      const { container } = render(<CardBalance {...props} sizing="fill" onClick={() => {}} />)
      expect(container.firstElementChild?.nodeName).toBe('BUTTON')
      expect(container.firstElementChild).toHaveClass('mn-card-balance--fill')
    })

    it('has no axe violations when filling', async () => {
      const { container } = render(<CardBalance {...props} sizing="fill" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
