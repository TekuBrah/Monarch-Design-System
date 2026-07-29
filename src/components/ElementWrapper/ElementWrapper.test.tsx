import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ElementWrapper } from './ElementWrapper'
import type { ElementWrapperSize } from './ElementWrapper'

const SIZES: ElementWrapperSize[] = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']

// Deviation, flagged: ElementWrapper renders a bare <span> with NO className at
// all — it is a pure sizing primitive driven entirely by inline styles. So size
// is asserted through the inline width/height token rather than a modifier class.
describe('ElementWrapper', () => {
  it('renders without crashing, wrapping its children', () => {
    render(<ElementWrapper><span>Child</span></ElementWrapper>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it.each(SIZES)('renders size %s with a width and height applied', size => {
    const { container } = render(<ElementWrapper size={size} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).not.toBe('')
    expect(el.style.height).toBe(el.style.width)
  })

  it('renders visibly different dimensions for different sizes', () => {
    const a = render(<ElementWrapper size="xs" />)
    const xs = (a.container.firstChild as HTMLElement).style.width
    a.unmount()

    const b = render(<ElementWrapper size="xxxl" />)
    const xxxl = (b.container.firstChild as HTMLElement).style.width

    expect(xs).not.toBe(xxxl)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ElementWrapper><span>Child</span></ElementWrapper>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
