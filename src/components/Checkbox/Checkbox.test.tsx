import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Checkbox } from './Checkbox'
import type { CheckboxSize } from './Checkbox'

const SIZES: CheckboxSize[] = ['m', 'l']

describe('Checkbox', () => {
  it('renders without crashing', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument()
  })

  // Size lives on the wrapping <label> root; the queryable element is the input.
  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<Checkbox label="Accept terms" size={size} />)
    expect(container.firstChild).toHaveClass(`mn-checkbox--${size}`)
  })

  it('reports the indeterminate state as aria-checked="mixed"', () => {
    render(<Checkbox label="Accept terms" isIndeterminate />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toHaveAttribute('aria-checked', 'mixed')
  })

  // Step 1.2: native-backed — isDisabled reaches the real <input disabled>.
  it('natively disables the input when isDisabled is set', () => {
    render(<Checkbox label="Accept terms" isDisabled />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeDisabled()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<Checkbox label="Accept terms" isInvalid />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toHaveAttribute('aria-invalid', 'true')
  })

  // isRequired appends a visible "*" INSIDE the wrapping label, so the accessible
  // name becomes "Accept terms*" — matched loosely here rather than exactly.
  it('sets aria-required when isRequired is set', () => {
    render(<Checkbox label="Accept terms" isRequired />)
    expect(screen.getByRole('checkbox', { name: /Accept terms/ })).toHaveAttribute('aria-required', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Checkbox label="Accept terms" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
