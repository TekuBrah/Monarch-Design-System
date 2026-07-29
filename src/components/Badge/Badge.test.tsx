import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Badge } from './Badge'
import type { BadgeAppearance, BadgeType } from './Badge'

const APPEARANCES: BadgeAppearance[] = [
  'default', 'primary', 'inverted', 'important', 'added', 'removed', 'dark',
]
const TYPES: BadgeType[] = ['default', 'dot']

// Deviation from the Button pattern: Badge has no ARIA role and no root class
// (it is one of the documented inline-style components), so assertions go
// through its rendered text instead of getByRole/toHaveClass.
describe('Badge', () => {
  it('renders without crashing', () => {
    render(<Badge label="25" />)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  // Badge styles appearance through inline background (no modifier classes), so
  // assert the prop actually reaches the DOM. Deliberately checks "a background
  // is set" rather than exact token names — exact tokens are the docs' contract,
  // and hardcoding them here would make a token rename fail this smoke test for
  // a non-defect reason.
  it.each(APPEARANCES)('renders the %s appearance with a background applied', appearance => {
    const { container } = render(<Badge appearance={appearance} label="25" />)
    expect((container.firstChild as HTMLElement).style.background).not.toBe('')
  })

  it('renders visibly different backgrounds for different appearances', () => {
    const a = render(<Badge appearance="primary" label="25" />)
    const primaryBg = (a.container.firstChild as HTMLElement).style.background
    a.unmount()

    const b = render(<Badge appearance="important" label="25" />)
    const importantBg = (b.container.firstChild as HTMLElement).style.background

    expect(primaryBg).not.toBe(importantBg)
  })

  it.each(TYPES)('renders type %s', type => {
    const { container } = render(<Badge type={type} label="25" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the dot type as a decorative, aria-hidden element with no label text', () => {
    const { container } = render(<Badge type="dot" label="25" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByText('25')).not.toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Badge label="25" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
