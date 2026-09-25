import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DonutChart } from './DonutChart'
import type { DonutSegment } from './DonutChart'
import { environment, readGlobals, resolveValue } from '../../test/tokenCss'

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

// ---------------------------------------------------------------------------
// Gate 70 — the ring keeps its hole (MVP G42), and wedges paint at /500.
//
// jsdom applies no stylesheet, so the paint a segment ends up with is derived
// here from DonutChart.css: every rule whose selector is one compound of
// classes the element carries, the highest class count winning and ties going
// to source order. A CSS rule beats an SVG presentation attribute, so the
// attribute counts only when no rule sets the property — that ordering is the
// whole of G42. The browser measurement is the other half (CLAUDE.md, Gate 70).
// ---------------------------------------------------------------------------

const DONUT_CSS = readFileSync(resolve(process.cwd(), 'src/components/DonutChart/DonutChart.css'), 'utf8')
const BADGE_CSS = readFileSync(resolve(process.cwd(), 'src/components/IconObject/IconObject.css'), 'utf8')
const LIGHT = environment(readGlobals(), 'light')
const DARK = environment(readGlobals(), 'dark')

interface Rule { classes: string[]; decls: Map<string, string>; order: number }

function rulesOf(css: string): Rule[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((m, order) => {
    const decls = new Map(
      m[2].split(';').map(d => d.trim()).filter(Boolean)
        .map(d => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()] as [string, string]),
    )
    return m[1].split(',').map(s => s.trim())
      .filter(s => /^(\.[\w-]+)+$/.test(s))
      .map(s => ({ classes: s.split('.').filter(Boolean), decls, order }))
  })
}

const DONUT_RULES = rulesOf(DONUT_CSS)

/** The value `prop` takes on `el`: the winning stylesheet rule, else its attribute. */
function painted(el: Element, prop: string): string | null {
  let best: { spec: number; order: number; value: string } | undefined
  for (const r of DONUT_RULES) {
    const value = r.decls.get(prop)
    if (value === undefined || !r.classes.every(c => el.classList.contains(c))) continue
    if (!best || r.classes.length > best.spec || (r.classes.length === best.spec && r.order >= best.order)) {
      best = { spec: r.classes.length, order: r.order, value }
    }
  }
  return best ? best.value : el.getAttribute(prop)
}

/** `currentColor` resolved through the element's own `color` rule. */
function paintColour(el: Element, prop: 'fill' | 'stroke'): string | null {
  const v = painted(el, prop)
  return v === 'currentColor' ? painted(el, 'color') : v
}

/** The twelve flat hues, read from IconObject's badge rules — `ai` is a gradient and has none. */
const BADGE_HUES = rulesOf(BADGE_CSS).flatMap(r => {
  const hue = /^mn-icon-object--([a-z]+)$/.exec(r.classes.length === 1 ? r.classes[0] : '')?.[1]
  const bg = r.decls.get('background')
  return hue && bg === `var(--brand-${hue}-400)` ? [hue] : []
})

const ONE: DonutSegment[] = [{ id: 'ent', label: 'Entertainment', value: 700, color: 'blue' }]

describe('DonutChart — Gate 70', () => {
  it('paints the single-segment ring with no fill, so the hole stays empty', () => {
    const { container } = render(<DonutChart segments={ONE} />)
    const ring = container.querySelector('circle')!
    expect(ring).not.toBeNull()
    expect(painted(ring, 'fill')).toBe('none')
  })

  it('strokes the single-segment ring in its hue at /500', () => {
    const { container } = render(<DonutChart segments={ONE} />)
    const ring = container.querySelector('circle')!
    expect(painted(ring, 'stroke')).toBe('currentColor')
    expect(paintColour(ring, 'stroke')).toBe('var(--brand-blue-500)')
  })

  it('leaves the ring a hole of innerRadius with the centre label over it', () => {
    const { container } = render(
      <DonutChart segments={ONE} centreLabel="RM 700.00" centreCaption="Spent" />,
    )
    const ring = container.querySelector('circle')!
    const r = Number(ring.getAttribute('r'))
    const sw = Number(ring.getAttribute('stroke-width'))
    // The stroke spans r ± sw/2; its inner edge is the hole. 0.648 × 50 = 32.4.
    expect(r - sw / 2).toBeCloseTo(32.4, 6)
    expect(r + sw / 2).toBeCloseTo(50, 6)
    // The label is a sibling of the SVG, centred on the chart — inside the hole.
    const centre = screen.getByText('RM 700.00').closest('.mn-donut__centre')!
    expect(centre.parentElement).toBe(container.firstChild)
    const rule = DONUT_RULES.find(x => x.classes.join('.') === 'mn-donut__centre')!
    expect([rule.decls.get('position'), rule.decls.get('top'), rule.decls.get('left'), rule.decls.get('transform')])
      .toEqual(['absolute', '50%', '50%', 'translate(-50%, -50%)'])
  })

  it('keeps multi-segment wedges filled, at /500', () => {
    const { container } = render(<DonutChart segments={BUDGET} />)
    const wedges = [...paths(container)]
    expect(wedges).toHaveLength(7)
    for (const [i, w] of wedges.entries()) {
      expect(w.classList.contains('mn-donut__segment--ring')).toBe(false)
      expect(painted(w, 'fill')).toBe('currentColor')
      expect(paintColour(w, 'fill')).toBe(`var(--brand-${BUDGET[i].color}-500)`)
    }
  })

  it('maps every hue to /500 for wedges while badges stay /400, identical in both themes', () => {
    expect(BADGE_HUES).toHaveLength(12)
    for (const hue of BADGE_HUES) {
      const rule = DONUT_RULES.find(x => x.classes.length === 1 && x.classes[0] === `mn-donut__segment--${hue}`)
      expect(rule?.decls.get('color')).toBe(`var(--brand-${hue}-500)`)
      const light = resolveValue(`var(--brand-${hue}-500)`, LIGHT)
      expect(light).toMatch(/^#[0-9a-f]{6}$/i)
      expect(resolveValue(`var(--brand-${hue}-500)`, DARK)).toBe(light)
    }
    // No hue class exists in the donut that the badges do not also have.
    const donutHues = DONUT_RULES.flatMap(x => {
      const m = /^mn-donut__segment--([a-z]+)$/.exec(x.classes.length === 1 ? x.classes[0] : '')
      return m && x.decls.has('color') ? [m[1]] : []
    })
    expect(donutHues.sort()).toEqual([...BADGE_HUES].sort())
  })
})
