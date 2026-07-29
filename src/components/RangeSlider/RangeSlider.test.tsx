import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { RangeSlider } from './RangeSlider'

// RangeSlider exports no variant union. Thumb dragging, keyboard stepping and
// the two-way Field sync are deliberately out of smoke scope — flagged as a
// candidate for deeper testing later (it is the most stateful component here).
describe('RangeSlider', () => {
  it('renders without crashing, with one thumb per bound', () => {
    render(<RangeSlider minValue={20} maxValue={80} />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  it('names each thumb independently', () => {
    render(<RangeSlider minValue={20} maxValue={80} />)
    expect(screen.getByRole('slider', { name: 'Minimum' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Maximum' })).toBeInTheDocument()
  })

  it('exposes each thumb value through aria-valuenow', () => {
    render(<RangeSlider minValue={20} maxValue={80} />)
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('aria-valuenow', '20')
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveAttribute('aria-valuenow', '80')
  })

  // Step 1.2 classified RangeSlider as FULLY SIMULATED: no native disableable
  // element exists anywhere, so disabled state is expressed via aria-disabled
  // plus a tabIndex of -1 on both thumbs.
  it('expresses disabled state via aria-disabled and tabIndex -1 on both thumbs', () => {
    render(<RangeSlider minValue={20} maxValue={80} isDisabled />)
    for (const thumb of screen.getAllByRole('slider')) {
      expect(thumb).toHaveAttribute('aria-disabled', 'true')
      expect(thumb).toHaveAttribute('tabindex', '-1')
    }
  })

  it('renders its paired Field inputs when showInputs is set', () => {
    render(<RangeSlider minValue={20} maxValue={80} showInputs />)
    expect(screen.getByRole('textbox', { name: 'Minimum' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Maximum' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<RangeSlider minValue={20} maxValue={80} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
