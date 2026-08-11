import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { IconObject } from './IconObject'
import type { IconObjectColor, IconObjectShape, IconObjectSize } from './IconObject'

const COLORS: IconObjectColor[] = [
  'teal', 'green', 'yellow', 'orange', 'lime', 'cyan', 'blue',
  'gray', 'red', 'purple', 'slate', 'violet', 'ai',
]
const SHAPES: IconObjectShape[] = ['circle', 'square']
const SIZES: IconObjectSize[] = ['xs', 's', 'm', 'l', 'xl', 'xxl']

describe('IconObject', () => {
  it('renders without crashing', () => {
    const { container } = render(<IconObject />)
    expect(container.firstChild).toHaveClass('mn-icon-object')
  })

  it.each(COLORS)('renders the %s color', color => {
    const { container } = render(<IconObject color={color} />)
    expect(container.firstChild).toHaveClass(`mn-icon-object--${color}`)
  })

  it.each(SHAPES)('renders the %s shape', shape => {
    const { container } = render(<IconObject shape={shape} />)
    expect(container.firstChild).toHaveClass(`mn-icon-object--${shape}`)
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<IconObject size={size} />)
    expect(container.firstChild).toHaveClass(`mn-icon-object--${size}`)
  })

  it('renders its children', () => {
    render(<IconObject><span>Child</span></IconObject>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  // Decorative by default; it only becomes an image role once given a name.
  it('becomes a named img role only when ariaLabel is given', () => {
    const { unmount } = render(<IconObject />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    unmount()

    render(<IconObject ariaLabel="Wallet" />)
    expect(screen.getByRole('img', { name: 'Wallet' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<IconObject />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
