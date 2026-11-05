import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Logo } from './Logo'
import type { LogoName, LogoSize } from './Logo'
import { readComponentCss, declaration } from '../../test/componentCss'

const SIZES: LogoSize[] = ['xs', 's', 'm', 'l']

// Deviation, flagged: LogoName is an exported union, but it is an asset CATALOG
// (30+ brand/company/crypto marks), not a variant axis. Iterating all of them
// would be an asset-inventory test, not a smoke test, so one representative
// name is used and LogoSize is iterated in full instead.
const NAME: LogoName = 'monarch_logo_style_thick'

describe('Logo', () => {
  it('renders without crashing', () => {
    const { container } = render(<Logo name={NAME} />)
    expect(container.firstChild).toHaveClass('mn-logo')
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<Logo name={NAME} size={size} />)
    expect(container.firstChild).toHaveClass(`mn-logo--${size}`)
  })

  it('renders nothing for an unknown logo name', () => {
    // Cast is deliberate: exercising the runtime guard for a name outside the union.
    const { container } = render(<Logo name={'not_a_real_logo' as LogoName} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Logo name={NAME} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

/* Gate 97 (v2.13.0), G61 / R97-5 — `size="fill"`, a HEIGHT fill. Figma draws
   the amount chip's mark in a 20px `<element>` slot whose content fills it;
   with `fill` the slot (ElementWrapper size="m") decides the height. */
describe('Logo size="fill" (Gate 97)', () => {
  const CSS = readComponentCss('src/components/Logo/Logo.css')

  it('renders the fill modifier', () => {
    const { container } = render(<Logo name="ethereum" size="fill" />)
    expect(container.firstChild).toHaveClass('mn-logo', 'mn-logo--fill')
  })

  it('declares exactly height: 100% for fill, and nothing else', () => {
    const rules = CSS.filter(r => r.selectors.includes('.mn-logo--fill'))
    expect(rules).toHaveLength(1)
    expect([...rules[0].decls.entries()]).toEqual([['height', '100%']])
  })

  it('keeps the aspect ratio: the svg takes the height and an auto width', () => {
    expect(declaration(CSS, '.mn-logo > svg', 'height')).toBe('100%')
    expect(declaration(CSS, '.mn-logo > svg', 'width')).toBe('auto')
  })

  it('leaves the four fixed sizes as they were', () => {
    expect(declaration(CSS, '.mn-logo--xs', 'height')).toBe('14px')
    expect(declaration(CSS, '.mn-logo--s', 'height')).toBe('var(--brand-scale-800)')
    expect(declaration(CSS, '.mn-logo--m', 'height')).toBe('var(--brand-scale-1000)')
    expect(declaration(CSS, '.mn-logo--l', 'height')).toBe('var(--brand-scale-1200)')
  })
})
