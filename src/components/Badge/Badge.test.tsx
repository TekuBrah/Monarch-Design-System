import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Badge } from './Badge'
import type { BadgeAppearance, BadgeType } from './Badge'

const APPEARANCES: BadgeAppearance[] = [
  'default', 'primary', 'inverted', 'important', 'added', 'removed', 'dark',
]
const TYPES: BadgeType[] = ['default', 'dot']

// Badge has no ARIA role, so text/class assertions stand in for getByRole.
// As of v1.6.0 it DOES have a root class and a companion Badge.css — it was
// previously styled through two inline style={{}} objects, and these assertions
// were rewritten from `.style.background` to the modifier class when those moved.
describe('Badge', () => {
  it('renders without crashing', () => {
    render(<Badge label="25" />)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  // Assert the prop actually reaches the DOM as a modifier class. Deliberately
  // checks "the appearance is expressed" rather than resolved colour — the token
  // mapping is the docs' contract, and jsdom does not resolve var() chains, so a
  // colour assertion here would be meaningless as well as brittle.
  it.each(APPEARANCES)('renders the %s appearance with a modifier class', appearance => {
    const { container } = render(<Badge appearance={appearance} label="25" />)
    expect(container.firstChild).toHaveClass(`mn-badge--${appearance}`)
  })

  it('renders visibly different appearances with different modifier classes', () => {
    const a = render(<Badge appearance="primary" label="25" />)
    const primaryClass = (a.container.firstChild as HTMLElement).className
    a.unmount()

    const b = render(<Badge appearance="important" label="25" />)
    const importantClass = (b.container.firstChild as HTMLElement).className

    expect(primaryClass).not.toBe(importantClass)
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
