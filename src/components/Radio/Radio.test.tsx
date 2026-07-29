import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Radio } from './Radio'

// Radio exports no variant union — its axes are boolean state props.
describe('Radio', () => {
  it('renders without crashing', () => {
    render(<Radio label="Card" />)
    expect(screen.getByRole('radio', { name: 'Card' })).toBeInTheDocument()
  })

  it('reflects the checked state', () => {
    render(<Radio label="Card" isChecked />)
    expect(screen.getByRole('radio', { name: 'Card' })).toBeChecked()
  })

  // Step 1.2: native-backed — isDisabled reaches the real <input disabled>.
  it('natively disables the input when isDisabled is set', () => {
    render(<Radio label="Card" isDisabled />)
    expect(screen.getByRole('radio', { name: 'Card' })).toBeDisabled()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<Radio label="Card" isInvalid />)
    expect(screen.getByRole('radio', { name: 'Card' })).toHaveAttribute('aria-invalid', 'true')
  })

  // isRequired appends a visible "*" INSIDE the wrapping label, so the accessible
  // name becomes "Card*" — matched loosely here rather than exactly.
  it('sets aria-required when isRequired is set', () => {
    render(<Radio label="Card" isRequired />)
    expect(screen.getByRole('radio', { name: /Card/ })).toHaveAttribute('aria-required', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Radio label="Card" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
