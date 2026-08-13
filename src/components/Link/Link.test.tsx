import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Link } from './Link'
import type { LinkAppearance, LinkSize } from './Link'

const APPEARANCES: LinkAppearance[] = ['default', 'subtle', 'inverse']

// size → typography class on the inner text span. Note s renders LARGER than m
// (14px vs 12px) — the documented Figma size inversion, preserved deliberately,
// so this mapping is read from Link.tsx rather than inferred from the names.
const SIZE_TYPE_CLASS: Record<LinkSize, string> = {
  s: 'type-body-sm',
  m: 'type-body-caption',
}
const SIZES = Object.keys(SIZE_TYPE_CLASS) as LinkSize[]

describe('Link', () => {
  it('renders without crashing', () => {
    render(<Link label="Open" />)
    expect(screen.getByRole('link', { name: 'Open' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    render(<Link label="Open" appearance={appearance} />)
    expect(screen.getByRole('link', { name: 'Open' })).toHaveClass(`mn-link--${appearance}`)
  })

  it.each(SIZES)('renders size %s with its typography class', size => {
    render(<Link label="Open" size={size} />)
    expect(screen.getByText('Open')).toHaveClass(SIZE_TYPE_CLASS[size])
  })

  it('marks the current page when isCurrent is set', () => {
    render(<Link label="Open" isCurrent />)
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('aria-current', 'page')
  })

  it('applies rel="noopener noreferrer" when targeting a new tab', () => {
    render(<Link label="Open" target="_blank" />)
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('rel', 'noopener noreferrer')
  })

  // size × weight, the full 2x2. `m` is weight-INVARIANT by source, not by
  // omission: Figma models the 12px link only as body/caption (400/12) —
  // casestudy_02 node 1344:9986 — so there is no semibold caption to map.
  // `s` + semibold is the section-header "See all" (body/sm-semibold, 600/14).
  it.each([
    ['s', 'regular', 'type-body-sm'],
    ['s', 'semibold', 'type-body-sm-semibold'],
    ['m', 'regular', 'type-body-caption'],
    ['m', 'semibold', 'type-body-caption'],
  ] as const)('size %s + weight %s renders %s', (size, weight, cls) => {
    render(<Link label="Open" size={size} weight={weight} />)
    expect(screen.getByText('Open')).toHaveClass(cls)
  })

  it('defaults to regular — omitting weight matches weight="regular"', () => {
    const { unmount } = render(<Link label="Open" size="s" />)
    const unset = screen.getByText('Open').className
    unmount()

    render(<Link label="Open" size="s" weight="regular" />)
    expect(screen.getByText('Open').className).toBe(unset)
    expect(unset).toBe('type-body-sm')
  })

  it('keeps size m weight-invariant across both weights', () => {
    const { unmount } = render(<Link label="Open" size="m" weight="regular" />)
    const regular = screen.getByText('Open').className
    unmount()

    render(<Link label="Open" size="m" weight="semibold" />)
    expect(screen.getByText('Open').className).toBe(regular)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Link label="Open" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
