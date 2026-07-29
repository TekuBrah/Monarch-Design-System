import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { IconButton } from './IconButton'
import type { IconButtonSize, IconButtonVariant } from './IconButton'

const VARIANTS: IconButtonVariant[] = ['primary', 'secondary', 'tertiary']
const SIZES: IconButtonSize[] = ['s', 'm', 'l']

describe('IconButton', () => {
  it('renders without crashing', () => {
    render(<IconButton ariaLabel="Add" />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    render(<IconButton variant={variant} ariaLabel="Add" />)
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass(`mn-btn--${variant}`)
  })

  // IconButton composes Button's .mn-btn system rather than owning a root class,
  // so size maps to .mn-btn--icon-* (confirmed in Step 1.3's prefixing plan).
  it.each(SIZES)('renders size %s', size => {
    render(<IconButton size={size} ariaLabel="Add" />)
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass(`mn-btn--icon-${size}`)
  })

  // Per Step 1.2: IconButton's root IS a native <button>, so isDisabled passes
  // straight through to the real disabled attribute.
  it('renders a natively disabled button when isDisabled is set', () => {
    render(<IconButton ariaLabel="Add" isDisabled />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<IconButton ariaLabel="Add" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
