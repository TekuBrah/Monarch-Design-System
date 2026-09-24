import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { CardMonthlyBudget } from './CardMonthlyBudget'
import type { CardMonthlyBudgetState } from './CardMonthlyBudget'

const STATES: CardMonthlyBudgetState[] = ['default', 'addNew']

// React's useId output (ProgressRing's mask id) depends on render order within
// the file, so it is normalised before hashing.
const normalisedHash = (html: string) =>
  createHash('sha256').update(html.replace(/_r_[0-9a-z]+_/g, '_r_ID_')).digest('hex')

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
    const html = render(el).container.innerHTML.replace(' aria-label="Details for Monthly Budget"', '')
    expect(normalisedHash(html)).toBe(hash)
  })

  it('has no axe violations with a title and fill sizing', async () => {
    const { container } = render(<CardMonthlyBudget title="Entertainment" sizing="fill" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
