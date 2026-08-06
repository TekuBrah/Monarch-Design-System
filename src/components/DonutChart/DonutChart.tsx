import { useId } from 'react'
import type { IconObjectColor } from '../IconObject'
import './DonutChart.css'

/**
 * The twelve categorical hues, derived from `IconObjectColor` so the two cannot
 * drift apart.
 *
 * `'ai'` is excluded deliberately: it is a three-stop gradient, not a flat hue,
 * and a segment painted with it would need a per-instance `<linearGradient>`.
 * Narrowing here rather than documenting the exclusion means passing `'ai'` is a
 * compile error instead of a segment that silently renders unpainted.
 */
export type ChartHue = Exclude<IconObjectColor, 'ai'>

/**
 * A single wedge. `value` is the RAW amount, never a percentage — shares are
 * derived from `sum(values)` inside the component.
 *
 * That is deliberate and structural. The flow inventory's rule is "derive every
 * total, percentage and delta from one source of truth"; Figma's own budget
 * donut carries percentages that sum to 100.01%. A component that accepted
 * percentages would faithfully reproduce that error.
 */
export interface DonutSegment {
  id: string
  label: string
  value: number
  /**
   * A DS colour NAME, never a value. Typed against `ChartHue` so the twelve
   * categorical hues are the only legal input and a hex cannot reach a caller's
   * data file.
   *
   * There is deliberately NO default and no built-in sequence — see the note on
   * `segments` below.
   */
  color: ChartHue
}

export interface DonutChartProps {
  /**
   * NO DEFAULT PALETTE, by decision. Every segment must state its own colour.
   *
   * Shipping a default 7-colour sequence would mean inventing a categorical
   * scale the design system does not have — the twelve `IconObject` hues were
   * chosen as icon-badge backgrounds, not as an adjacent-distinguishable series
   * ramp. Figma already assigns one hue per category; the caller passes that
   * assignment through.
   */
  segments: DonutSegment[]
  /**
   * Hole size as a fraction of the outer radius. `0` renders a pie.
   *
   * Default `0.648`, measured from Figma's budget `Pie Chart` (`0:379`): a
   * 129.695 hole on a 200 outer.
   */
  innerRadius?: number
  /** Big centre figure, e.g. "RM 7,500.00". */
  centreLabel?: string
  /** Small caption beneath it, e.g. "Total budget". */
  centreCaption?: string
  /**
   * Text alternative. WHEN OMITTED THE CHART RENDERS `aria-hidden`.
   *
   * That is the intended default, not an oversight. Figma pairs this donut with
   * `ChartLegendItem` rows that already state every label, share and amount as
   * real text — so the accessible artifact is the legend, and a composed
   * seven-segment label would announce the same data a second time, worse.
   * Supply `summary` only when the chart stands alone.
   */
  summary?: string
  className?: string
}

// --- arc geometry -----------------------------------------------------------
// NOTE: `polar` mirrors ProgressRing's helper of the same name. The duplication
// is a deliberate call, not an oversight — ProgressRing is a 270° single-value
// gauge that strokes a masked path, this fills multi-segment wedges, and
// extracting twelve shared lines would mean editing a shipped component that
// CardMonthlyBudget consumes for no behavioural gain. If you change the angle
// convention in one, check the other.
const CX = 50
const CY = 50
const R_OUTER = 50

/** Point on a circle at angle φ, measured clockwise from 12 o'clock. */
const polar = (phi: number, r: number): [number, number] => {
  const rad = (phi * Math.PI) / 180
  return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)]
}

/** Closed wedge path between two angles, from `rInner` to `rOuter`. */
function wedgePath(fromPhi: number, toPhi: number, rInner: number): string {
  const largeArc = toPhi - fromPhi > 180 ? 1 : 0
  const [ox1, oy1] = polar(fromPhi, R_OUTER)
  const [ox2, oy2] = polar(toPhi, R_OUTER)
  const f = (n: number) => n.toFixed(3)

  if (rInner <= 0) {
    // Pie: outer arc, straight back to the centre.
    return `M ${CX} ${CY} L ${f(ox1)} ${f(oy1)} A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${f(ox2)} ${f(oy2)} Z`
  }
  const [ix1, iy1] = polar(fromPhi, rInner)
  const [ix2, iy2] = polar(toPhi, rInner)
  return [
    `M ${f(ox1)} ${f(oy1)}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${f(ox2)} ${f(oy2)}`,
    `L ${f(ix2)} ${f(iy2)}`,
    `A ${f(rInner)} ${f(rInner)} 0 ${largeArc} 0 ${f(ix1)} ${f(iy1)}`,
    'Z',
  ].join(' ')
}

/**
 * Segmented donut / pie chart.
 *
 * DESIGNED ADDITION, not a faithful build. Figma's sources for this shape are
 * FLATTENED OUTPUT, not a spec: the budget `Pie Chart` (`0:379`) exports as one
 * `ellipse` plus six `boolean-operation` subtracts, and in the code export every
 * segment is an `<img>` — no fills are recoverable from it at all. Assistant03's
 * 100×100 donut is the same. The rendering below is authored; only the inner
 * radius and the per-category hue assignment were sourced (the latter from the
 * legend rows beneath the chart, not from the chart itself).
 *
 * NO ANIMATION — transitions have no backing tokens (the parked motion layer).
 * Static by design.
 *
 * SIZE-AGNOSTIC. The SVG fills its parent; the parent owns the box. Every size
 * Figma uses (201×200, 100×100) is off the `--brand-scale` ramp, so a `size`
 * prop would need tokens the library does not have. This deliberately differs
 * from ProgressRing, which hardcodes per-size px.
 */
export function DonutChart({
  segments,
  innerRadius = 0.648,
  centreLabel,
  centreCaption,
  summary,
  className,
}: DonutChartProps) {
  const titleId = useId()
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0)
  const rInner = Math.max(0, Math.min(0.95, innerRadius)) * R_OUTER

  // Angles derived from values, never taken as input.
  let cursor = 0
  const wedges = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const sweep = total > 0 ? (s.value / total) * 360 : 0
      const from = cursor
      cursor += sweep
      return { ...s, from, to: cursor, sweep }
    })

  const isFullCircle = wedges.length === 1 && wedges[0].sweep >= 359.999

  return (
    <div
      className={['mn-donut', className].filter(Boolean).join(' ')}
      role={summary ? 'img' : undefined}
      aria-label={summary}
      aria-hidden={summary ? undefined : true}
    >
      <svg
        className="mn-donut__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {isFullCircle ? (
          // A 360° arc has identical start and end points and renders as
          // nothing. One segment is a ring: a circle with a stroke thick enough
          // to leave the hole.
          <circle
            className={`mn-donut__segment mn-donut__segment--${wedges[0].color}`}
            cx={CX}
            cy={CY}
            r={(R_OUTER + rInner) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={R_OUTER - rInner}
          />
        ) : (
          wedges.map((w) => (
            <path
              key={w.id}
              className={`mn-donut__segment mn-donut__segment--${w.color}`}
              d={wedgePath(w.from, w.to, rInner)}
            />
          ))
        )}
      </svg>

      {(centreLabel || centreCaption) && (
        <div className="mn-donut__centre" id={titleId}>
          {centreLabel && (
            <span className="mn-donut__centre-label type-body-m-semibold">{centreLabel}</span>
          )}
          {centreCaption && (
            <span className="mn-donut__centre-caption type-body-caption">{centreCaption}</span>
          )}
        </div>
      )}
    </div>
  )
}
