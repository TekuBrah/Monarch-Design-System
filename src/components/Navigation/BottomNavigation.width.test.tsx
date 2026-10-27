import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createHash } from 'node:crypto'
import type { ReactElement } from 'react'
import { BottomNavigation } from './BottomNavigation'
import type { BottomNavItem, BottomNavigationProps } from './BottomNavigation'
import { readComponentCss, declaration } from '../../test/componentCss'

/* Gate 92 DS (v2.11.0), G59: one-line bar labels and per-item hug.

   WHY THE CSS IS READ FROM THE STYLESHEET. `vitest.config.ts` sets no
   `test.css`, so no stylesheet is applied in jsdom and every rect is zero. The
   label rule and the hug rule are therefore read out of BottomNavigation.css.
   The widths they produce were measured in headless Chromium and are recorded
   in CLAUDE.md (Gate 92 DS). */

const CSS = readComponentCss('src/components/Navigation/BottomNavigation.css')
const sha256 = (el: ReactElement) => createHash('sha256').update(renderToStaticMarkup(el)).digest('hex')
const HUG = 'mn-bottom-nav__item--hug'

// The /transfer pill the MVP renders, and the case study draws in 1266:14391.
const PILL: BottomNavItem[] = [
  { id: 'recipients', icon: 'people', label: 'Recipients', isSelected: true },
  { id: 'scan-qr', icon: 'qr_code_scanner', label: 'Scan QR' },
]
const withRecipients = (width: BottomNavItem['width']): BottomNavItem[] => [{ ...PILL[0], width }, PILL[1]]

const buttons = (props: BottomNavigationProps) => {
  const { container } = render(<BottomNavigation {...props} />)
  return [...container.querySelectorAll('button')]
}

describe('BottomNavigation: one-line labels (R92D-5)', () => {
  it('declares white-space: nowrap on the default label rule', () => {
    expect(declaration(CSS, '.mn-bottom-nav__label', 'white-space')).toBe('nowrap')
  })

  it('neither truncates nor clips a label', () => {
    const props = ['overflow', 'overflow-x', 'text-overflow']
    const set = CSS.filter(r => r.selectors.some(s => s.includes('mn-bottom-nav__label') || s.includes('mn-bottom-nav__item')))
      .flatMap(r => props.filter(p => r.decls.has(p)).map(p => `${r.selectors.join(', ')} { ${p} }`))
    expect(set).toEqual([])
  })
})

describe('BottomNavigation: per-item width (R92D-6, R92D-7)', () => {
  it.each([
    ['omitted', undefined],
    ['fixed', 'fixed'],
  ] as const)('renders no modifier and no new attribute on an item whose width is %s', (_, width) => {
    const [recipients, scan] = buttons({ items: withRecipients(width) })
    expect(recipients.className).toBe('mn-bottom-nav__item mn-bottom-nav__item--selected')
    expect(recipients.getAttributeNames()).toEqual(['type', 'class', 'aria-current'])
    expect(scan.className).toBe('mn-bottom-nav__item')
  })

  it.each([
    ['omitted', undefined],
    ['hug', 'hug'],
  ] as const)('puts the hug modifier on a hug item, and only on it, when barWidth is %s', (_, barWidth) => {
    const [recipients, scan] = buttons({ items: withRecipients('hug'), barWidth })
    expect(recipients.className).toBe(`mn-bottom-nav__item mn-bottom-nav__item--selected ${HUG}`)
    expect(scan.className).toBe('mn-bottom-nav__item')
  })

  it('sizes a hug item to its content: width auto after the 64px base rule, no floor, no ceiling', () => {
    const base = CSS.findIndex(r => r.context.length === 0 && r.selectors.includes('.mn-bottom-nav__item') && r.decls.get('width') === 'var(--brand-scale-1300)')
    const hug = CSS.findIndex(r => r.context.length === 0 && r.selectors.includes(`.${HUG}`))
    expect(base).toBeGreaterThanOrEqual(0)
    expect(hug).toBeGreaterThan(base)
    expect([...CSS[hug].decls.entries()]).toEqual([['width', 'auto']])
    const bounds = CSS.filter(r => r.selectors.some(s => s.includes('mn-bottom-nav__item')))
      .flatMap(r => ['min-width', 'max-width'].filter(p => r.decls.has(p)))
    expect(bounds).toEqual([])
  })

  it('leaves a hug item in a fill bar sized by fill: no modifier, and the v2.10.0 fill markup', () => {
    const [recipients] = buttons({ items: withRecipients('hug'), barWidth: 'fill' })
    expect(recipients.classList.contains(HUG)).toBe(false)
    expect(declaration(CSS, '.mn-bottom-nav__bar--fill .mn-bottom-nav__item', 'flex')).toBe('1 1 0')
    // = the v2.10.0 pin "matrix: barWidth fill, two items (MVP transfer)"
    expect(sha256(<BottomNavigation items={withRecipients('hug')} barWidth="fill" />)).toBe(
      'c07b9fdf12a9db6f8842622bce028dcda9d543f4620f3ff9d4e38ccb137567a9',
    )
  })
})

// ── Existing renders, unchanged ─────────────────────────────────────────────
// sha256 of renderToStaticMarkup, from the v2.10.0 pins the Gate 92 §1 session
// captured from the v2.10.0 build (pins-markup-v2.10.0.json, in the hand-over).
// Gate 92 confirmed before its first edit that vitest renders all 49 of those
// cases to the same markup as dist/index.js. None of these items sets `width`.
const noop = () => {}
const TEST_ITEMS: BottomNavItem[] = [
  { id: 'home', icon: 'home', label: 'Home', isSelected: true },
  { id: 'wallet', icon: 'icon_wallet', label: 'Wallet' },
  { id: 'more', icon: 'more_horiz', label: 'More' },
]
const showcaseItems = (sel: string): BottomNavItem[] => [
  { id: 'home', icon: 'icon_home', label: 'Home', isSelected: sel === 'home' },
  { id: 'transfer', icon: 'icon_transfer', label: 'Transfer', isSelected: sel === 'transfer' },
  { id: 'finance', icon: 'icon_finance', label: 'Finance', isSelected: sel === 'finance' },
  { id: 'more', icon: 'icon_more', label: 'More', isSelected: sel === 'more' },
]
const mvpMainItems: BottomNavItem[] = [
  { id: 'home', icon: 'icon_home', label: 'Home', isSelected: true },
  { id: 'transfer', icon: 'icon_transfer', label: 'Transfer', isSelected: false },
  { id: 'finance', icon: 'icon_finance', label: 'Finance', isSelected: false },
  { id: 'more', icon: 'icon_more', label: 'More', isSelected: false },
]
const LONG: BottomNavItem[] = [
  { id: 'a', icon: 'icon_home', label: 'Recipients', isSelected: true },
  { id: 'b', icon: 'icon_transfer', label: 'Scan QR' },
  { id: 'c', icon: 'icon_finance', label: 'Transactions' },
]

const V2_10_0: [string, ReactElement, string][] = [
  ['test: default', <BottomNavigation items={TEST_ITEMS} />, '974e603e711ee47ca1d645bc09e1e9d3f62e19162534e42888e48ed67bffdfc1'],
  ['showcase: default 375, home', <BottomNavigation items={showcaseItems('home')} onSelect={noop} />, '99c3abaac5df6b32a1dd1dc3a90f0cba068b68ca981a4e410d525ec2fdcfb5d0'],
  ['showcase: fill, transfer', <BottomNavigation barWidth="fill" items={showcaseItems('transfer')} onSelect={noop} />, '055db3b964c4695e14da81a234e7040a92f0649b1be282ac10db493099ba9d0d'],
  ['mvp: main bar fill, pathname /', <BottomNavigation items={mvpMainItems} barWidth="fill" onSelect={noop} />, '3176b01946abe44933bccf7092c81771eab58f44c79374a5b01821a5c1a01df8'],
  ['mvp: /transfer hug', <BottomNavigation items={PILL} barWidth="hug" onSelect={noop} />, '1fbe8dca9cbc3ff1f242c5882ed50b3bb25c8a2f0d8fd897117fb239da3f9cd1'],
  ['matrix: barWidth omitted, long labels', <BottomNavigation items={LONG} />, 'c02b590d29fa4ad1e14b8b0067db8a7f4c45ea742a913fb66d6893acb7b49112'],
  ['matrix: barWidth fill, two items', <BottomNavigation items={PILL} barWidth="fill" />, 'c07b9fdf12a9db6f8842622bce028dcda9d543f4620f3ff9d4e38ccb137567a9'],
]

describe('BottomNavigation: existing renders keep their v2.10.0 markup (R92D-5)', () => {
  it.each(V2_10_0)('%s', (_, el, expected) => {
    expect(sha256(el)).toBe(expected)
  })
})
