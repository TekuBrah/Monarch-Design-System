import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Blanket } from './Blanket'

// Deviation from the Button pattern: Blanket is a bare scrim <div> with no role,
// no text and no variants, so there is nothing to query by and no union to
// iterate. Asserting the root class is the only meaningful smoke check.
// Its real behaviour (click-to-dismiss) is interaction, deliberately out of
// smoke scope — flagged as a candidate for deeper testing later.
describe('Blanket', () => {
  it('renders without crashing', () => {
    const { container } = render(<Blanket />)
    expect(container.firstChild).toHaveClass('mn-blanket')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Blanket />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
