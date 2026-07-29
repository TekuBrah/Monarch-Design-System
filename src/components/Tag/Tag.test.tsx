import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Tag } from './Tag'
import type { TagAppearance, TagSize } from './Tag'

const APPEARANCES: TagAppearance[] = ['default', 'overlay']
const SIZES: TagSize[] = ['m', 's']

describe('Tag', () => {
  it('renders without crashing', () => {
    render(<Tag label="Groceries" />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    render(<Tag label="Groceries" appearance={appearance} />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toHaveClass(`mn-tag--${appearance}`)
  })

  it.each(SIZES)('renders size %s', size => {
    render(<Tag label="Groceries" size={size} />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toHaveClass(`mn-tag--${size}`)
  })

  it('applies the selected modifier when isSelected is set', () => {
    render(<Tag label="Groceries" isSelected />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toHaveClass('mn-tag--selected')
  })

  // Per Step 1.2: Tag's root IS a native <button>, so isDisabled passes straight
  // through to the real disabled attribute.
  it('renders a natively disabled button when isDisabled is set', () => {
    render(<Tag label="Groceries" isDisabled />)
    expect(screen.getByRole('button', { name: 'Groceries' })).toBeDisabled()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Tag label="Groceries" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
