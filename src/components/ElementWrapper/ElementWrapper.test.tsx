import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ElementWrapper } from './ElementWrapper'
import type { ElementWrapperSize } from './ElementWrapper'

const SIZES: ElementWrapperSize[] = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']

// Size is asserted through the modifier class. These assertions previously read
// `el.style.width` — which only worked because the component styled itself with
// an inline style={{}} object, the very CLAUDE.md violation carried-forward item
// I6 removed. They tested the implementation, not the behaviour; jsdom does not
// apply stylesheet rules to `.style`, so they could not survive the fix.
// Resolved dimensions are verified by computed style in the browser instead.
describe('ElementWrapper', () => {
  it('renders without crashing, wrapping its children', () => {
    render(<ElementWrapper><span>Child</span></ElementWrapper>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it.each(SIZES)('renders size %s as a modifier class', size => {
    const { container } = render(<ElementWrapper size={size} />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('mn-element-wrapper')
    expect(el).toHaveClass(`mn-element-wrapper--${size}`)
    // No inline styling survives — that is the point of the fix.
    expect(el.getAttribute('style')).toBeNull()
  })

  it('renders a distinct modifier for different sizes', () => {
    const a = render(<ElementWrapper size="xs" />)
    const xs = (a.container.firstChild as HTMLElement).className
    a.unmount()

    const b = render(<ElementWrapper size="xxxl" />)
    const xxxl = (b.container.firstChild as HTMLElement).className

    expect(xs).not.toBe(xxxl)
  })

  it('defaults to size l', () => {
    const { container } = render(<ElementWrapper />)
    expect(container.firstChild).toHaveClass('mn-element-wrapper--l')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ElementWrapper><span>Child</span></ElementWrapper>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
