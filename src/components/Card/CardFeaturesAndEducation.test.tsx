import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { CardFeaturesAndEducation } from './CardFeaturesAndEducation'
import type { CardFeaturesVariant } from './CardFeaturesAndEducation'

const VARIANTS: CardFeaturesVariant[] = ['blue', 'orange', 'green', 'purple', 'outline']
const props = { icon: <span />, title: 'Learn investing' }

describe('CardFeaturesAndEducation', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardFeaturesAndEducation {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-features')
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    const { container } = render(<CardFeaturesAndEducation {...props} variant={variant} />)
    expect(container.firstChild).toHaveClass(`mn-card-features--${variant}`)
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<CardFeaturesAndEducation {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Learn investing/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<CardFeaturesAndEducation {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Learn investing/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardFeaturesAndEducation {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // Gate 40. `sizing` shipped in v1.5.0 — this component ESTABLISHED the prop —
  // and carried zero tests until now, while CardBalance's copy of the same prop
  // was covered at Gate 32 (v1.11.0). These mirror that suite deliberately: the
  // prop's whole reason for existing is that the two components share one shape
  // (CLAUDE.md, "THE `sizing` PROP"), so the tests should be comparable too.
  //
  // jsdom applies no stylesheet (vitest.config.ts sets no `test.css`), so these
  // assert the class CONTRACT — which modifier lands on the root — not geometry.
  // CLAUDE.md is explicit that pixels are the WRONG check here anyway: this
  // component's `fill` was invisible at 375px because three tiles at their cap
  // plus two gaps summed to the content width by coincidence
  // (3 x 109 + 2 x 8 = 343 = 375 - 32). The declaration is the evidence.
  describe('sizing', () => {
    // NO-CHANGE PROOF: omitting the prop must compose the exact class string it
    // composed before the prop existed — not merely "contains mn-card-features".
    it('composes an unchanged class string when omitted', () => {
      const { container } = render(<CardFeaturesAndEducation {...props} />)
      expect(container.firstElementChild).toHaveAttribute(
        'class',
        'mn-card-features mn-card-features--blue',
      )
    })

    it('composes an unchanged class string with className when omitted', () => {
      const { container } = render(<CardFeaturesAndEducation {...props} className="extra" />)
      expect(container.firstElementChild).toHaveAttribute(
        'class',
        'mn-card-features mn-card-features--blue extra',
      )
    })

    it("treats an explicit 'fixed' as identical to omitting the prop", () => {
      const omitted = render(<CardFeaturesAndEducation {...props} />).container.innerHTML
      const explicit = render(
        <CardFeaturesAndEducation {...props} sizing="fixed" />,
      ).container.innerHTML
      expect(explicit).toBe(omitted)
    })

    it("adds the fill modifier only for 'fill'", () => {
      const { container } = render(<CardFeaturesAndEducation {...props} sizing="fill" />)
      expect(container.firstElementChild).toHaveClass('mn-card-features--fill')
    })

    // The modifier must land BEFORE the consumer's className, so a consumer
    // class declared later in its own sheet can still override the modifier.
    it('orders the modifier before className', () => {
      const { container } = render(
        <CardFeaturesAndEducation {...props} sizing="fill" className="extra" />,
      )
      expect(container.firstElementChild).toHaveAttribute(
        'class',
        'mn-card-features mn-card-features--blue mn-card-features--fill extra',
      )
    })

    // The prop is orthogonal to the div/button fork — it must reach both.
    it('applies to the button render too', () => {
      const { container } = render(
        <CardFeaturesAndEducation {...props} sizing="fill" onClick={() => {}} />,
      )
      expect(container.firstElementChild?.nodeName).toBe('BUTTON')
      expect(container.firstElementChild).toHaveClass('mn-card-features--fill')
    })

    // The prop is also orthogonal to `variant` — unlike CardBalance, this
    // component composes a variant modifier into the same class string, so
    // `fill` has a neighbour it must not displace or reorder.
    it.each(VARIANTS)('composes fill alongside the %s variant', variant => {
      const { container } = render(
        <CardFeaturesAndEducation {...props} variant={variant} sizing="fill" />,
      )
      expect(container.firstElementChild).toHaveAttribute(
        'class',
        `mn-card-features mn-card-features--${variant} mn-card-features--fill`,
      )
    })

    it('has no axe violations when filling', async () => {
      const { container } = render(<CardFeaturesAndEducation {...props} sizing="fill" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
