import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Slider } from './Slider'

// Slider exports no variant union. Keyboard/drag interaction is deliberately
// out of smoke scope — flagged as a candidate for deeper testing later.
describe('Slider', () => {
  it('renders without crashing', () => {
    render(<Slider value={40} ariaLabel="Budget" />)
    expect(screen.getByRole('slider', { name: 'Budget' })).toBeInTheDocument()
  })

  it('exposes its value through the aria-value attributes', () => {
    render(<Slider value={40} min={0} max={100} ariaLabel="Budget" />)
    const thumb = screen.getByRole('slider', { name: 'Budget' })
    expect(thumb).toHaveAttribute('aria-valuenow', '40')
    expect(thumb).toHaveAttribute('aria-valuemin', '0')
    expect(thumb).toHaveAttribute('aria-valuemax', '100')
  })

  // Step 1.2 classified Slider as FULLY SIMULATED: no native disableable element
  // exists anywhere, so disabled state is expressed via aria-disabled plus a
  // tabIndex of -1 (backed by pointer-events:none and JS guards in the source).
  it('expresses disabled state via aria-disabled and tabIndex -1', () => {
    render(<Slider value={40} ariaLabel="Budget" isDisabled />)
    const thumb = screen.getByRole('slider', { name: 'Budget' })
    expect(thumb).toHaveAttribute('aria-disabled', 'true')
    expect(thumb).toHaveAttribute('tabindex', '-1')
  })

  it('is focusable with tabIndex 0 when enabled', () => {
    render(<Slider value={40} ariaLabel="Budget" />)
    expect(screen.getByRole('slider', { name: 'Budget' })).toHaveAttribute('tabindex', '0')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Slider value={40} ariaLabel="Budget" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
