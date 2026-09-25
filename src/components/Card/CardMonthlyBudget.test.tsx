import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CardMonthlyBudget } from './CardMonthlyBudget'
import type { CardMonthlyBudgetState } from './CardMonthlyBudget'

const STATES: CardMonthlyBudgetState[] = ['default', 'addNew']

// React's useId output (ProgressRing's mask id) depends on render order within
// the file, so it is normalised before hashing.
const normalisedHash = (html: string) =>
  createHash('sha256').update(html.replace(/_r_[0-9a-z]+_/g, '_r_ID_')).digest('hex')

// Gate 68 (correction): the card's medium ring now rests at Figma's h6 where
// v2.4.1 and v2.5.0 rendered h5. Mapping that one class back is the ONLY
// normalisation the pre-Gate-68 hashes below allow; a card with no ring
// (addNew) is unaffected by it.
const asPreGate68 = (html: string) =>
  html.replace('mn-progress-ring__amount type-header-h6"', 'mn-progress-ring__amount type-header-h5"')

describe('CardMonthlyBudget', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardMonthlyBudget />)
    expect(container.firstChild).toHaveClass('mn-card-monthly-budget')
  })

  it.each(STATES)('renders the %s state', state => {
    const { container } = render(<CardMonthlyBudget state={state} />)
    expect(container.firstChild).toHaveClass('mn-card-monthly-budget')
  })

  // `default` shows the ring + summary; `addNew` swaps the whole body for a
  // single "Add New Budget" button plus its own modifier class.
  it('renders the addNew state as an action button with its modifier class', () => {
    const { container } = render(<CardMonthlyBudget state="addNew" />)
    expect(container.firstChild).toHaveClass('mn-card-monthly-budget--add-new')
    expect(screen.getByRole('button', { name: /Add New Budget/ })).toBeInTheDocument()
  })

  it('renders the nested ProgressRing in its default state', () => {
    render(<CardMonthlyBudget />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardMonthlyBudget />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── Gate 66 · G35 — title ───────────────────────────────────────────
  describe('title (G35)', () => {
    it("defaults to the previously hard-coded 'Monthly Budget'", () => {
      const { container } = render(<CardMonthlyBudget />)
      expect(container.querySelector('.mn-card-monthly-budget__header-title')).toHaveTextContent(/^Monthly Budget$/)
    })

    it('renders an overriding title in place of the default', () => {
      const { container } = render(<CardMonthlyBudget title="Entertainment" />)
      const titleEl = container.querySelector('.mn-card-monthly-budget__header-title')
      expect(titleEl).toHaveTextContent(/^Entertainment$/)
      // Same element, same classes: the text style and colour binding do not
      // move when the text does.
      expect(titleEl).toHaveClass('type-body-caption-semibold')
      expect(screen.queryByText('Monthly Budget')).not.toBeInTheDocument()
    })
  })

  // ── Gate 66 · G36 — sizing ──────────────────────────────────────────
  // Mirrors CardBalance's sizing suite: same prop shape, same assertions.
  describe('sizing (G36)', () => {
    it('omitted, emits no fill modifier', () => {
      const { container } = render(<CardMonthlyBudget className="x" />)
      expect(container.firstChild).toHaveAttribute('class', 'mn-card-monthly-budget x')
    })

    it("explicit 'fixed' is identical to omitting the prop", () => {
      const a = render(<CardMonthlyBudget />).container.innerHTML
      const b = render(<CardMonthlyBudget sizing="fixed" />).container.innerHTML
      expect(normalisedHash(b)).toBe(normalisedHash(a))
    })

    it("'fill' adds the fill modifier", () => {
      const { container } = render(<CardMonthlyBudget sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-card-monthly-budget--fill')
    })

    it('orders the fill modifier after the state modifier and before className', () => {
      const { container } = render(<CardMonthlyBudget state="addNew" sizing="fill" className="x" />)
      expect(container.firstChild).toHaveAttribute(
        'class',
        'mn-card-monthly-budget mn-card-monthly-budget--add-new mn-card-monthly-budget--fill x',
      )
    })
  })

  // ── Gate 66 · G38 — Details accessible name ─────────────────────────
  describe('Details accessible name (G38)', () => {
    it("is 'Details for Monthly Budget' by default, visible text unchanged", () => {
      render(<CardMonthlyBudget />)
      const btn = screen.getByRole('button', { name: 'Details for Monthly Budget' })
      expect(btn).toHaveTextContent(/^Details$/)
    })

    it('includes the title, so two cards expose two distinct names', () => {
      render(
        <>
          <CardMonthlyBudget />
          <CardMonthlyBudget title="Entertainment" />
        </>,
      )
      expect(screen.getByRole('button', { name: 'Details for Monthly Budget' })).toBeInTheDocument()
      const ent = screen.getByRole('button', { name: 'Details for Entertainment' })
      // WCAG 2.5.3: the accessible name starts with the visible label.
      expect(ent.getAttribute('aria-label')!.startsWith(ent.textContent!)).toBe(true)
    })
  })

  // ── Gate 66 · default path unchanged from v2.4.1 ────────────────────
  // Hashes captured from the v2.4.1 tree (820736e) before any edit. The only
  // permitted difference is G38's aria-label, which is removed before hashing —
  // it changes the accessible name, not a rendered pixel.
  it.each([
    ['plain', <CardMonthlyBudget />, '9111ae4aa364d457cc0cc1398a428c69e2a20877037893d0a447bbc2f144a4b1'],
    [
      'every value prop',
      <CardMonthlyBudget period="30 Aug - 20 Sept" percentage={35} amountLeft="RM 350" totalAmount="RM 1,000" availableAmount="RM 350" spentAmount="RM 650" onDetailsClick={() => {}} className="x" />,
      '2af8e1abf65a6c860f661bec50a10db2cf18a0c16cbc86453681605c4c9efbb2',
    ],
    ['addNew', <CardMonthlyBudget state="addNew" />, '74fdd95107ce37b81acbe0ce1ecdf21612400d8964586b138b6fe7acb2ec1269'],
  ] as const)('renders the %s default identically to v2.4.1 (bar the Details aria-label)', (_n, el, hash) => {
    const html = asPreGate68(render(el).container.innerHTML.replace(' aria-label="Details for Monthly Budget"', ''))
    expect(normalisedHash(html)).toBe(hash)
  })

  it('has no axe violations with a title and fill sizing', async () => {
    const { container } = render(<CardMonthlyBudget title="Entertainment" sizing="fill" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Gate 68 — compact summary on narrow cards, by container query.
// ---------------------------------------------------------------------------

const CARD_CSS = readFileSync(resolve(process.cwd(), 'src/components/Card/CardMonthlyBudget.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)

/** The one @container block: its condition and its inner rules. */
function containerBlock() {
  const start = CARD_CSS.indexOf('@container')
  expect(start).toBeGreaterThan(-1)
  const open = CARD_CSS.indexOf('{', start)
  let depth = 0
  let end = open
  for (; end < CARD_CSS.length; end++) {
    if (CARD_CSS[end] === '{') depth++
    if (CARD_CSS[end] === '}' && --depth === 0) break
  }
  const rules = [...CARD_CSS.slice(open + 1, end).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({
    selector: m[1].trim(),
    body: m[2],
  }))
  return { prelude: CARD_CSS.slice(start, open).trim(), rules }
}

describe('CardMonthlyBudget compact summary (Gate 68)', () => {
  // Wide spacing holds "RM 4,444.44" (6258 font units, Poppins 600) at 16px
  // only when text room = card - 32 pad - 162 ring - 24 gap - 32 badge - 8 gap
  // >= 100.128px, i.e. card >= 358.128px. The query takes the next whole pixel,
  // 359, and a container query measures the CONTENT box: 359 - 2 x 16 = 327.
  it('switches at the derived card width, measured on the content box', () => {
    const cardThreshold = Math.ceil(32 + 162 + 24 + 32 + 8 + (6258 * 16) / 1000)
    expect(cardThreshold).toBe(359)
    expect(containerBlock().prelude).toBe(`@container mn-card-monthly-budget (width < ${cardThreshold - 2 * 16}px)`)
    expect(CARD_CSS).toMatch(/\.mn-card-monthly-budget\s*\{[^}]*container:\s*mn-card-monthly-budget\s*\/\s*inline-size/)
  })

  // Strict `<`: a 359px card (327px content) is NOT compact; 358.99px is.
  it('applies compact below the threshold and not at or above it', () => {
    const [, bound] = containerBlock().prelude.match(/width < ([\d.]+)px/)!
    const compact = (card: number) => card - 32 < Number(bound)
    expect([343, 358, 358.99].map(compact)).toEqual([true, true, true])
    expect([359, 360, 398].map(compact)).toEqual([false, false, false])
  })

  // One selector reaches both SummaryItems, so Available and Spent cannot
  // disagree in size; its values are body-sm-semibold's own tokens.
  it('gives both amounts one size, from body-sm-semibold tokens, and tightens the gap', () => {
    const { rules } = containerBlock()
    const amount = rules.find(r => r.selector === '.mn-card-monthly-budget__summary .mn-summary-item__amount')!
    expect(amount.body).toMatch(/font-size:\s*var\(--responsive-font-copy-body-sm-text-size\)/)
    expect(amount.body).toMatch(/line-height:\s*var\(--responsive-font-copy-body-sm-line-height\)/)
    expect(rules.find(r => r.selector === '.mn-card-monthly-budget__body')!.body).toMatch(/gap:\s*var\(--brand-scale-400\)/)

    const { container } = render(<CardMonthlyBudget availableAmount="RM 4,140.33" spentAmount="-RM 1,234.56" />)
    const classes = [...container.querySelectorAll('.mn-summary-item__amount')].map(el => el.className)
    expect(classes).toHaveLength(2)
    expect(new Set(classes).size).toBe(1)
  })

  // Hashes captured from the untouched v2.5.0 tree before the first Gate 68
  // edit. Compact is pure CSS, so no card markup may change; every ring amount
  // here fits the resting step, whose class alone follows Figma (asPreGate68).
  it.each([
    ['default props', {}, '61e81b225a215c85d462c07c2288a4f6abaabdf09b10dba0cf5d10cab7f79f45'],
    ['Figma RM 700', { percentage: 40, amountLeft: 'RM 700', totalAmount: 'RM 1,000', availableAmount: 'RM 700', spentAmount: 'RM 300' }, '3a91d60ce01963d619f1b7aee4ebaa4fac11183906c21b7201352810dada63b6'],
    ['long summary', { percentage: 12, amountLeft: 'RM 876.24', totalAmount: 'RM 5,000.00', availableAmount: 'RM 4,140.33', spentAmount: '-RM 1,234.56' }, '0bac315dbe653dc85fb316b2ff71c3b8ea3f4dfcba6fbb4d1abbb21384419482'],
    ['fill', { sizing: 'fill', amountLeft: 'RM 876.24', availableAmount: 'RM 4,140.33', spentAmount: 'RM 859.67' }, '681969fb9e98203c54f8de584028967cf093464d4857bea1697bc153acf7af18'],
  ] as const)('renders the %s card as v2.5.0 did but for the ring resting class', (_n, props, hash) => {
    const html = asPreGate68(render(<CardMonthlyBudget {...props} />).container.innerHTML)
    expect(normalisedHash(html)).toBe(hash)
  })
})
