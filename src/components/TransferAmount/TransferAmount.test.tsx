import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { TransferAmount } from './TransferAmount'
import type { TransferAmountItem, TransferAmountType } from './TransferAmount'
import { readComponentCss, declaration } from '../../test/componentCss'

/* Gate 91 (v2.10.0, G55) — TransferAmount mirrors Figma `<Transfer amount>`
   (191:12003). Layout and colour tokens are read from TransferAmount.css
   (jsdom applies no stylesheet). */

const TYPES: TransferAmountType[] = ['currency', 'crypto']
const ROWS = { single: 1, multiple: 4 } as const
const RULES = readComponentCss('src/components/TransferAmount/TransferAmount.css')

// The case study's line (1266:14392): "Your new balance" / "RM 25,428.59".
const BALANCE: TransferAmountItem = { title: 'Your new balance', amount: 'RM 25,428.59' }
const CRYPTO: TransferAmountItem = { title: 'Network fee', amount: '0.0004 ETH', amountDetails: '≈ RM 5.20' }
const many = (n: number, details?: string): TransferAmountItem[] =>
  Array.from({ length: n }, (_, i) => ({ title: `Title ${i + 1}`, amount: `RM ${i + 1}.00`, amountDetails: details }))

describe('TransferAmount', () => {
  // The 2×2 Figma matrix: Rows (Single, Multiple = 4) × Type.
  describe.each(TYPES)('type %s', type => {
    it.each(Object.entries(ROWS))('renders the %s variant as %i rows', (_, n) => {
      const { container } = render(<TransferAmount type={type} items={many(n, 'details')} />)
      const root = container.firstElementChild!
      expect(root.tagName).toBe('DL')
      expect(root.className).toBe(`mn-transfer-amount mn-transfer-amount--${type}`)
      expect(root.querySelectorAll(':scope > .mn-transfer-amount__row')).toHaveLength(n)
    })

    it('has no axe violations with four rows', async () => {
      const { container } = render(<TransferAmount type={type} items={many(4, 'details')} />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  it('renders N rows for N items, not only Figma\'s 1 and 4', () => {
    const { container } = render(<TransferAmount type="currency" items={many(7)} />)
    expect(container.querySelectorAll('.mn-transfer-amount__row')).toHaveLength(7)
  })

  it('groups each row as a div holding one dt then one dd', () => {
    const { container } = render(<TransferAmount type="currency" items={[BALANCE]} />)
    const row = container.querySelector('.mn-transfer-amount__row')!
    expect(row.tagName).toBe('DIV')
    expect([...row.children].map(c => c.tagName)).toEqual(['DT', 'DD'])
    expect(row.children[0].textContent).toBe('Your new balance')
    expect(row.children[1].textContent).toBe('RM 25,428.59')
  })

  it('exposes title and amount as a term and its definition', () => {
    render(<TransferAmount type="currency" items={[BALANCE]} />)
    expect(screen.getByRole('term')).toHaveTextContent('Your new balance')
    expect(screen.getByRole('definition')).toHaveTextContent('RM 25,428.59')
  })

  it('sets the title, amount and details in their Figma type styles', () => {
    const { container } = render(<TransferAmount type="crypto" items={[CRYPTO]} />)
    expect(container.querySelector('.mn-transfer-amount__title')).toHaveClass('type-body-caption')
    expect(container.querySelector('.mn-transfer-amount__amount')).toHaveClass('type-body-sm-semibold')
    expect(container.querySelector('.mn-transfer-amount__details')).toHaveClass('type-body-sm-semibold')
    expect(container.querySelector('.mn-transfer-amount__separator')).toHaveClass('type-body-caption')
  })

  it('renders crypto details, then the separator, then the amount', () => {
    const { container } = render(<TransferAmount type="crypto" items={[CRYPTO]} />)
    const dd = container.querySelector('dd')!
    expect([...dd.children].map(c => c.className.split(' ')[0])).toEqual([
      'mn-transfer-amount__details',
      'mn-transfer-amount__separator',
      'mn-transfer-amount__amount',
    ])
    expect(dd.children[0].textContent).toBe('≈ RM 5.20')
    expect(dd.children[2].textContent).toBe('0.0004 ETH')
  })

  it('uses U+2022 as the separator and hides it from assistive technology', () => {
    const { container } = render(<TransferAmount type="crypto" items={[CRYPTO]} />)
    const sep = container.querySelector('.mn-transfer-amount__separator')!
    expect([...sep.textContent!].map(c => c.codePointAt(0))).toEqual([0x2022])
    expect(sep).toHaveAttribute('aria-hidden', 'true')
  })

  it('omits the details and the separator in crypto when no details are given', () => {
    const { container } = render(<TransferAmount type="crypto" items={[BALANCE]} />)
    expect(container.querySelector('.mn-transfer-amount__details')).toBeNull()
    expect(container.querySelector('.mn-transfer-amount__separator')).toBeNull()
    expect(container.querySelector('dd')!.children).toHaveLength(1)
  })

  it('never renders details or the separator in currency, even when given', () => {
    const { container } = render(<TransferAmount type="currency" items={[CRYPTO]} />)
    expect(container.querySelector('.mn-transfer-amount__details')).toBeNull()
    expect(container.querySelector('.mn-transfer-amount__separator')).toBeNull()
  })

  it('renders an empty list for no items', () => {
    const { container } = render(<TransferAmount type="currency" items={[]} />)
    expect(container.firstElementChild!.children).toHaveLength(0)
  })

  it('stacks rows with a Scale/200 gap and resets the dl and dd UA margins', () => {
    expect(declaration(RULES, '.mn-transfer-amount', 'flex-direction')).toBe('column')
    expect(declaration(RULES, '.mn-transfer-amount', 'gap')).toBe('var(--brand-scale-200)')
    expect(declaration(RULES, '.mn-transfer-amount', 'margin')).toBe('0')
    expect(declaration(RULES, '.mn-transfer-amount__value', 'margin')).toBe('0')
  })

  it('spaces a row by 4px (--brand-scale-100) and the crypto value by Scale/50', () => {
    expect(declaration(RULES, '.mn-transfer-amount__row', 'gap')).toBe('var(--brand-scale-100)')
    expect(declaration(RULES, '.mn-transfer-amount__value', 'gap')).toBe('var(--brand-scale-50)')
  })

  it('hugs currency rows to the start and spreads crypto rows apart', () => {
    expect(declaration(RULES, '.mn-transfer-amount--currency', 'align-items')).toBe('flex-start')
    expect(declaration(RULES, '.mn-transfer-amount--crypto .mn-transfer-amount__row', 'justify-content')).toBe('space-between')
    expect(declaration(RULES, '.mn-transfer-amount__row', 'justify-content')).toBeUndefined()
  })

  it('keeps titles and amounts on one line, as Figma\'s auto-width text is', () => {
    expect(declaration(RULES, '.mn-transfer-amount__title', 'white-space')).toBe('nowrap')
    expect(declaration(RULES, '.mn-transfer-amount__value', 'white-space')).toBe('nowrap')
  })

  it.each([
    ['.mn-transfer-amount__title', '--mapped-text-subtle-default'],
    ['.mn-transfer-amount__amount', '--mapped-text-default-default'],
    ['.mn-transfer-amount__details', '--mapped-text-subtle-default'],
    ['.mn-transfer-amount__separator', '--mapped-text-subtle-default'],
  ])('colours %s with %s', (selector, token) => {
    expect(declaration(RULES, selector, 'color')).toBe(`var(${token})`)
  })
})
