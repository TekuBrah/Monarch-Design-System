import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CardDataDisplay } from './CardDataDisplay'

const props = { info: 'Total spend', content: 'RM 850.00' }

// The markup v2.6.0 rendered for `props`, captured before Gate 73's first edit.
// Both new props are optional; omitting them must reproduce this exactly.
const V260_MARKUP =
  '<div class="mn-card-data-display">' +
  '<span class="mn-card-data-display__info type-body-caption-semibold">Total spend</span>' +
  '<span class="mn-card-data-display__content type-body-m-semibold">RM 850.00</span>' +
  '</div>'

// jsdom applies no stylesheet, so the sizing contract is read from the CSS.
const CSS = readFileSync(resolve(process.cwd(), 'src/components/Card/CardDataDisplay.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
)
// The declarations of the rule whose selector is exactly `selector`.
const declsOf = (selector: string) => {
  const at = CSS.indexOf(`${selector} {`)
  const body = at < 0 ? '' : CSS.slice(CSS.indexOf('{', at) + 1, CSS.indexOf('}', at))
  return Object.fromEntries(
    body
      .split(';')
      .map(d => d.trim())
      .filter(Boolean)
      .map(d => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  )
}

// No variant union, no interaction — presentational only.
describe('CardDataDisplay', () => {
  it('renders without crashing', () => {
    const { container } = render(<CardDataDisplay {...props} />)
    expect(container.firstChild).toHaveClass('mn-card-data-display')
  })

  it('renders its info and content', () => {
    render(<CardDataDisplay {...props} />)
    expect(screen.getByText('Total spend')).toBeInTheDocument()
    expect(screen.getByText('RM 850.00')).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<CardDataDisplay {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── G5 (Gate 73): orientation and sizing ─────────────────────────────────
  it('renders the v2.6.0 markup exactly when orientation and sizing are omitted', () => {
    const { container } = render(<CardDataDisplay {...props} />)
    expect(container.innerHTML).toBe(V260_MARKUP)
  })

  it("treats explicit 'vertical' and 'fixed' as identical to omitting them", () => {
    const { container } = render(<CardDataDisplay {...props} orientation="vertical" sizing="fixed" />)
    expect(container.innerHTML).toBe(V260_MARKUP)
  })

  it('sets the horizontal label at the value type step', () => {
    const { container } = render(<CardDataDisplay {...props} orientation="horizontal" />)
    expect(container.firstChild).toHaveClass('mn-card-data-display--horizontal')
    expect(screen.getByText('Total spend')).toHaveClass('mn-card-data-display__info', 'type-body-m-semibold')
    expect(screen.getByText('Total spend')).not.toHaveClass('type-body-caption-semibold')
  })

  it('applies the data display fill modifier when sizing is fill', () => {
    const { container } = render(<CardDataDisplay {...props} sizing="fill" />)
    expect(container.firstChild).toHaveClass('mn-card-data-display--fill')
  })

  it('composes horizontal and fill before className', () => {
    const { container } = render(
      <CardDataDisplay {...props} orientation="horizontal" sizing="fill" className="app-row" />,
    )
    expect((container.firstChild as HTMLElement).className).toBe(
      'mn-card-data-display mn-card-data-display--horizontal mn-card-data-display--fill app-row',
    )
  })

  it('releases the width and the 300px cap under fill but keeps the 128px floor', () => {
    const base = declsOf('.mn-card-data-display')
    const fill = declsOf('.mn-card-data-display--fill')
    expect(base['max-width']).toBe('300px')
    expect(base['min-width']).toBe('128px')
    expect(fill).toEqual({ width: 'auto', 'max-width': 'none', flex: '1 1 0' })
    // Declared after the base rule at equal specificity, so it wins by order.
    expect(CSS.indexOf('.mn-card-data-display--fill')).toBeGreaterThan(CSS.indexOf('.mn-card-data-display {'))
  })

  it('has no axe violations horizontal and filling', async () => {
    const { container } = render(<CardDataDisplay {...props} orientation="horizontal" sizing="fill" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
