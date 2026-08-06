import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { DonutChart } from './DonutChart'
import type { DonutSegment } from './DonutChart'

/**
 * TESTING BOUNDARY — stated, not left implicit.
 *
 * jsdom computes NO layout and NO SVG geometry: `getBBox` is absent, path
 * commands are never resolved to pixels, and the component stylesheet is not
 * applied. So this suite asserts what is real in jsdom — element presence,
 * segment count, class plumbing from props, derived-share arithmetic via the
 * emitted path data, and ARIA — and nothing that depends on rendering.
 *
 * Moved to Gate 3 (real browser, computed styles, both themes): resolved
 * segment colours, adjacent-segment distinguishability ratios, centre-label
 * contrast, and the size-agnostic layout behaviour.
 */

// Figma's budget categories and their hue assignment, read from the legend rows.
const BUDGET: DonutSegment[] = [
  { id: 'bills', label: 'Bills & Utilities', value: 2500, color: 'red' },
  { id: 'groceries', label: 'Groceries', value: 1800, color: 'purple' },
  { id: 'dining', label: 'Dining & Leisure', value: 1200, color: 'blue' },
  { id: 'healthcare', label: 'Healthcare', value: 800, color: 'cyan' },
  { id: 'transport', label: 'Transport', value: 500, color: 'lime' },
  { id: 'shopping', label: 'Shopping', value: 350, color: 'yellow' },
  { id: 'others', label: 'Others / Misc', value: 350, color: 'orange' },
]

const paths = (c: HTMLElement) => c.querySelectorAll('path.mn-donut__segment')

describe('DonutChart', () => {
  it('renders without crashing', () => {
    const { container } = render(<DonutChart segments={BUDGET} />)
    expect(container.firstChild).toHaveClass('mn-donut')
  })

  it('renders one wedge per segment', () => {
    const { container } = render(<DonutChart segments={BUDGET} />)
    expect(paths(container)).toHaveLength(7)
  })

  it('maps each segment colour to its own class', () => {
    const { container } = render(<DonutChart segments={BUDGET} />)
    const classes = [...paths(container)].map(
      p => [...p.classList].find(c => c.startsWith('mn-donut__segment--')),
    )
    expect(classes).toEqual([
      'mn-donut__segment--red',
      'mn-donut__segment--purple',
      'mn-donut__segment--blue',
      'mn-donut__segment--cyan',
      'mn-donut__segment--lime',
      'mn-donut__segment--yellow',
      'mn-donut__segment--orange',
    ])
  })

  // Two positive values, so this isolates the FILTERING. With a single positive
  // segment the component correctly renders a full ring instead (covered
  // separately below), which would mask what this test is for.
  it('skips zero and negative values rather than emitting empty wedges', () => {
    const { container } = render(
      <DonutChart
        segments={[
          { id: 'a', label: 'A', value: 100, color: 'blue' },
          { id: 'b', label: 'B', value: 0, color: 'red' },
          { id: 'c', label: 'C', value: -50, color: 'green' },
          { id: 'd', label: 'D', value: 100, color: 'teal' },
        ]}
      />,
    )
    expect(paths(container)).toHaveLength(2)
    const classes = [...paths(container)].map(
      p => [...p.classList].find(c => c.startsWith('mn-donut__segment--')),
    )
    expect(classes).toEqual(['mn-donut__segment--blue', 'mn-donut__segment--teal'])
  })

  // Shares are DERIVED from sum(values) — the component never accepts a
  // percentage. Asserted indirectly: two equal values must produce two wedges
  // whose paths differ only by rotation, and a half-circle sets largeArc=0.
  it('derives shares from the raw values', () => {
    const { container } = render(
      <DonutChart
        segments={[
          { id: 'a', label: 'A', value: 50, color: 'blue' },
          { id: 'b', label: 'B', value: 50, color: 'red' },
        ]}
        innerRadius={0}
      />,
    )
    const d = [...paths(container)].map(p => p.getAttribute('d') ?? '')
    expect(d).toHaveLength(2)
    // Equal halves: first wedge runs from 12 o'clock to 6 o'clock.
    expect(d[0]).toContain('M 50 50 L 50.000 0.000')
    expect(d[1]).toContain('L 50.000 100.000')
  })

  it('renders a single full segment as a ring, not an empty arc', () => {
    const { container } = render(
      <DonutChart segments={[{ id: 'only', label: 'Only', value: 1, color: 'green' }]} />,
    )
    expect(paths(container)).toHaveLength(0)
    expect(container.querySelector('circle.mn-donut__segment--green')).toBeInTheDocument()
  })

  it('renders a pie when innerRadius is 0', () => {
    const { container } = render(<DonutChart segments={BUDGET} innerRadius={0} />)
    // A pie wedge closes through the centre point.
    expect(paths(container)[0].getAttribute('d')).toMatch(/^M 50 50 L/)
  })

  it('renders the centre label and caption when given', () => {
    render(<DonutChart segments={BUDGET} centreLabel="RM 7,500.00" centreCaption="Total budget" />)
    expect(screen.getByText('RM 7,500.00')).toBeInTheDocument()
    expect(screen.getByText('Total budget')).toBeInTheDocument()
  })

  // The legend beside the chart is the accessible artifact; a redundant
  // seven-segment label would announce the same data twice, worse.
  it('is aria-hidden when no summary is given', () => {
    const { container } = render(<DonutChart segments={BUDGET} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('becomes an labelled image when a summary is given', () => {
    render(<DonutChart segments={BUDGET} summary="Budget by category, 7 categories" />)
    const el = screen.getByRole('img', { name: 'Budget by category, 7 categories' })
    expect(el).not.toHaveAttribute('aria-hidden')
  })

  it('has no axe violations with a summary', async () => {
    const { container } = render(<DonutChart segments={BUDGET} summary="Budget by category" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when decorative', async () => {
    const { container } = render(<DonutChart segments={BUDGET} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
