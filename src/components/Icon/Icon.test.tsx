import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Icon } from './Icon'
import type { IconName, IconSize } from './Icon'

const SIZES: IconSize[] = ['xs', 's', 'm', 'l']

// Deviation, flagged: IconName is a 101-entry asset REGISTRY, not a variant
// axis. Enumerating it would be inventory testing, not smoke — so a
// representative sample is used and IconSize is iterated in full instead
// (same reasoning as Logo's LogoName exclusion in Batch 1).
const SAMPLE_NAMES: IconName[] = ['add', 'close', 'check', 'edit', 'refresh', 'search']

// Icon renders a decorative, aria-hidden <svg> inside an unclassed
// ElementWrapper <span> — it has no role, no accessible text and no className,
// so assertions go through the DOM shape and inline sizing.
describe('Icon', () => {
  it('renders without crashing, as a decorative aria-hidden svg', () => {
    const { container } = render(<Icon name="add" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it.each(SAMPLE_NAMES)('renders the %s icon', name => {
    const { container } = render(<Icon name={name} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  // Icon composes ElementWrapper, so size is asserted through the wrapper's
  // modifier class. These previously read `wrapper.style.width`, which only
  // worked because ElementWrapper styled itself with an inline style={{}}
  // object — the CLAUDE.md violation removed by carried-forward item I6.
  // Icon's own size names map 1:1 onto ElementWrapper's (xs/s/m/l).
  it.each(SIZES)('renders size %s through ElementWrapper', size => {
    const { container } = render(<Icon name="add" size={size} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('mn-element-wrapper')
    expect(wrapper).toHaveClass(`mn-element-wrapper--${size}`)
    expect(wrapper.getAttribute('style')).toBeNull()
  })

  it('renders a distinct wrapper size for different sizes', () => {
    const a = render(<Icon name="add" size="xs" />)
    const xs = (a.container.firstChild as HTMLElement).className
    a.unmount()

    const b = render(<Icon name="add" size="l" />)
    const l = (b.container.firstChild as HTMLElement).className

    expect(xs).not.toBe(l)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Icon name="add" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
