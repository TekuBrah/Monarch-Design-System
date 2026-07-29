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

  it.each(SIZES)('renders size %s with a dimension applied', size => {
    const { container } = render(<Icon name="add" size={size} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.width).not.toBe('')
    expect(wrapper.style.height).toBe(wrapper.style.width)
  })

  it('renders visibly different dimensions for different sizes', () => {
    const a = render(<Icon name="add" size="xs" />)
    const xs = (a.container.firstChild as HTMLElement).style.width
    a.unmount()

    const b = render(<Icon name="add" size="l" />)
    const l = (b.container.firstChild as HTMLElement).style.width

    expect(xs).not.toBe(l)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Icon name="add" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
