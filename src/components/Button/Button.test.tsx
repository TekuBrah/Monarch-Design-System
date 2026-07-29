import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Button } from './Button'
import type { ButtonVariant } from './Button'

// Read from Button.tsx, not assumed: ButtonVariant = 'primary' | 'secondary' | 'tertiary'.
// Typed as ButtonVariant[] so adding/removing a variant in the source fails
// the typecheck here rather than silently leaving a variant untested.
const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary']

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button label="Save" />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    render(<Button variant={variant} label="Save" />)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(`mn-btn--${variant}`)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Button label="Save" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
