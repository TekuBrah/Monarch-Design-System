import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { LineChart } from './LineChart'

/**
 * TESTING BOUNDARY — stated, not left implicit. Same split as DonutChart.
 *
 * jsdom computes NO layout and NO SVG geometry, and does not apply the
 * component stylesheet. So this suite asserts what is real in jsdom: element
 * presence, chrome on/off, class plumbing from props, the emitted path `d`
 * (which IS deterministic string output, so scaling and the domain behaviour
 * are assertable), inline position percentages, and ARIA.
 *
 * Moved to Gate 3 (real browser, computed styles, both themes): resolved series
 * and chrome colours, the `chromeTone` token split, stroke rendering under
 * `preserveAspectRatio="none"`, and the size-agnostic layout in ListItem's slot.
 */

const SERIES = [10, 20, 15, 30]
const svgPath = (c: HTMLElement, cls: string) => c.querySelector(`path.${cls}`)?.getAttribute('d') ?? ''

describe('LineChart', () => {
  it('renders without crashing', () => {
    const { container } = render(<LineChart points={SERIES} />)
    expect(container.firstChild).toHaveClass('mn-line-chart')
  })

  it('plots one vertex per point, spanning the full width by default', () => {
    const { container } = render(<LineChart points={SERIES} />)
    const d = svgPath(container, 'mn-line-chart__line')
    expect(d.match(/[ML]/g)).toHaveLength(4)
    expect(d).toMatch(/^M 0\.000/)      // first point at x=0
    expect(d).toContain('L 100.000')     // last point at x=100
  })

  // The extent behaviour established from Flow 7: data may deliberately stop
  // short of the axis.
  it('stops short of the axis when a larger domain is given', () => {
    const { container } = render(<LineChart points={SERIES} domain={7} />)
    const d = svgPath(container, 'mn-line-chart__line')
    expect(d).toMatch(/^M 0\.000/)
    // 4 points across 7 slots → last vertex at 3/6 = 50%, not 100%.
    expect(d).toContain('50.000')
    expect(d).not.toContain('L 100.000')
  })

  it('inverts the y axis so a larger value sits higher', () => {
    const { container } = render(<LineChart points={[0, 100]} />)
    const d = svgPath(container, 'mn-line-chart__line')
    expect(d).toBe('M 0.000 100.000 L 100.000 0.000')
  })

  it('puts a flat series on the mid-line instead of dividing by zero', () => {
    const { container } = render(<LineChart points={[5, 5, 5]} />)
    expect(svgPath(container, 'mn-line-chart__line')).toBe(
      'M 0.000 50.000 L 50.000 50.000 L 100.000 50.000',
    )
  })

  it('closes the area down to the baseline', () => {
    const { container } = render(<LineChart points={SERIES} showArea />)
    expect(svgPath(container, 'mn-line-chart__area')).toMatch(/L 100\.000 100 L 0\.000 100 Z$/)
  })

  it('omits the area when asked', () => {
    const { container } = render(<LineChart points={SERIES} showArea={false} />)
    expect(container.querySelector('path.mn-line-chart__area')).toBeNull()
  })

  it('maps series colour and chrome tone to their own classes', () => {
    const { container } = render(<LineChart points={SERIES} color="green" chromeTone="onColor" />)
    expect(container.firstChild).toHaveClass('mn-line-chart--green')
    expect(container.firstChild).toHaveClass('mn-line-chart--chrome-onColor')
  })

  // Sparkline = the same component with all chrome off.
  it('renders no chrome by default', () => {
    const { container } = render(<LineChart points={SERIES} />)
    expect(container.querySelector('.mn-line-chart__gridline')).toBeNull()
    expect(container.querySelector('.mn-line-chart__axis')).toBeNull()
    expect(container.querySelector('.mn-line-chart__marker')).toBeNull()
  })

  it('renders gridlines and axis labels when asked', () => {
    const { container } = render(
      <LineChart points={SERIES} showGridlines showAxis xLabels={['01', '15', '31']} />,
    )
    expect(container.querySelectorAll('.mn-line-chart__gridline')).toHaveLength(2)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
  })

  it('positions the marker and its callout at the marked point', () => {
    const { container } = render(
      <LineChart points={[0, 100]} marker={{ index: 1, label: '+ RM 8,768.35' }} />,
    )
    const dot = container.querySelector('.mn-line-chart__marker') as HTMLElement
    expect(dot.style.left).toBe('100%')
    expect(dot.style.top).toBe('0%')
    expect(screen.getByText('+ RM 8,768.35')).toBeInTheDocument()
  })

  it('ignores a marker index outside the series', () => {
    const { container } = render(<LineChart points={SERIES} marker={{ index: 99 }} />)
    expect(container.querySelector('.mn-line-chart__marker')).toBeNull()
  })

  // The sparkline in ListItem passes no summary on purpose — the row already
  // announces the move via TrendIndicator.
  it('is aria-hidden when no summary is given', () => {
    const { container } = render(<LineChart points={SERIES} />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('becomes a labelled image when a summary is given', () => {
    render(<LineChart points={SERIES} summary="Net worth, Sep 01 to Sep 31" />)
    expect(screen.getByRole('img', { name: 'Net worth, Sep 01 to Sep 31' })).toBeInTheDocument()
  })

  it('has no axe violations, decorative or labelled', async () => {
    const a = render(<LineChart points={SERIES} />)
    expect(await axe(a.container)).toHaveNoViolations()
    const b = render(<LineChart points={SERIES} summary="Net worth trend" />)
    expect(await axe(b.container)).toHaveNoViolations()
  })
})
