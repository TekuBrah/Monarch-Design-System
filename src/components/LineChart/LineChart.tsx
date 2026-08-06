import type { CSSProperties } from 'react'
import type { ChartHue } from '../DonutChart'
import './LineChart.css'

/**
 * Series colour. The twelve hues paint line `-400` / area `-100`.
 *
 * `'onColor'` is the coloured-card case (Flow 7's Total Networth card draws a
 * white line on blue). It renders NO area — see `showArea`.
 */
export type LineChartColor = ChartHue | 'onColor'

/**
 * Chrome tier. Chrome is interface, not data, so unlike the series it uses the
 * mapped tier and dark-flips.
 *
 * An API decision, not a Figma variant: the only source that exists draws this
 * chart on a coloured card, but the component also has to serve a sparkline in
 * a list row on the page surface. Hardcoding either host assumption into a
 * primitive is the thing to avoid, so the host declares it.
 */
export type LineChartChromeTone = 'default' | 'onColor'

export interface LineChartMarker {
  /** Index into `points` to mark. */
  index: number
  /** Callout text above the marker, e.g. "+ RM 8,768.35". */
  label?: string
}

export interface LineChartProps {
  /** Ordered values. Shares no data shape with DonutChart, deliberately. */
  points: number[]
  color?: LineChartColor
  /**
   * Total x slots. Defaults to `points.length` — "data fills the width".
   *
   * Pass a larger number when the data deliberately stops short of the axis.
   * Flow 7 does exactly that: gridlines and labels span a full month (01–31)
   * while the line ends at the 15th, with the marker and callout at that point.
   * Established from the source, not assumed — the area and line are both
   * `w-[176px]` inside a 343px frame whose gridlines are `w-[343px]`.
   */
  domain?: number
  /** Rendered along the bottom when `showAxis`. */
  xLabels?: string[]
  marker?: LineChartMarker
  /** Area beneath the line. Ignored when `color="onColor"` — see LineChart.css. */
  showArea?: boolean
  showGridlines?: boolean
  showAxis?: boolean
  chromeTone?: LineChartChromeTone
  /**
   * Text alternative. WHEN OMITTED THE CHART RENDERS `aria-hidden`.
   *
   * The sparkline case passes nothing on purpose: in `ListItem` the row already
   * announces the move through `TrendIndicator`, so labelling the chart would
   * state the same fact twice — the same redundancy stripped out of
   * TrendIndicator's own announcement.
   */
  summary?: string
  className?: string
}

/**
 * Line / area chart, and — with all chrome switched off — the sparkline.
 *
 * DESIGNED ADDITION, not a faithful build. Both Figma sources are FLATTENED
 * OUTPUT: Flow 7's chart is two `<img>` vectors (`Vector 1` area, `Vector 2`
 * line) and the crypto sparkline is a single `<vector>` named "Rectangle 5"
 * shared byte-identically by all three rows. No series values, no point count
 * and no curve are recoverable from either. The rendering below is authored;
 * only the extent behaviour and the chrome colours were sourced.
 *
 * NO ANIMATION — transitions have no backing tokens (the parked motion layer).
 *
 * SIZE-AGNOSTIC. The parent owns the box, same as DonutChart.
 *
 * WHY CHROME IS HTML AND ONLY THE SERIES IS SVG: the plot is stretched with
 * `preserveAspectRatio="none"` so it fills any box, which would distort a
 * stroked gridline or a circular marker. Rendering those as positioned HTML
 * keeps them geometrically exact at every size — and mirrors the source, where
 * Figma's own gridlines and marker are divs, not graphics.
 */
export function LineChart({
  points,
  color = 'blue',
  domain,
  xLabels,
  marker,
  showArea = true,
  showGridlines = false,
  showAxis = false,
  chromeTone = 'default',
  summary,
  className,
}: LineChartProps) {
  const slots = Math.max(domain ?? points.length, points.length, 2)
  const min = points.length ? Math.min(...points) : 0
  const max = points.length ? Math.max(...points) : 0
  const span = max - min

  // x/y in a 0–100 space. A flat series sits on the mid-line rather than
  // dividing by zero.
  const xAt = (i: number) => (i / (slots - 1)) * 100
  const yAt = (v: number) => (span === 0 ? 50 : 100 - ((v - min) / span) * 100)

  const coords = points.map((v, i) => [xAt(i), yAt(v)] as const)
  const f = (n: number) => n.toFixed(3)
  const linePath = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${f(x)} ${f(y)}`).join(' ')
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${f(coords[coords.length - 1][0])} 100 L ${f(coords[0][0])} 100 Z`
      : ''

  const markerPoint =
    marker && marker.index >= 0 && marker.index < points.length
      ? { x: xAt(marker.index), y: yAt(points[marker.index]) }
      : null

  // Inline styles here are ONLY per-instance computed positions — the
  // legitimate exception in CLAUDE.md's no-inline-styles rule. Every colour,
  // size and radius is in LineChart.css so the audit grep can see it.
  const pos = (x: number, y?: number): CSSProperties =>
    y === undefined ? { left: `${x}%` } : { left: `${x}%`, top: `${y}%` }

  const classes = [
    'mn-line-chart',
    `mn-line-chart--${color}`,
    `mn-line-chart--chrome-${chromeTone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      role={summary ? 'img' : undefined}
      aria-label={summary}
      aria-hidden={summary ? undefined : true}
    >
      <div className="mn-line-chart__plot">
        {showGridlines && (
          <>
            <span className="mn-line-chart__gridline mn-line-chart__gridline--top" />
            <span className="mn-line-chart__gridline mn-line-chart__gridline--bottom" />
          </>
        )}

        <svg
          className="mn-line-chart__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {showArea && areaPath && <path className="mn-line-chart__area" d={areaPath} />}
          {linePath && (
            <path
              className="mn-line-chart__line"
              d={linePath}
              fill="none"
              // The plot is stretched, so the stroke must not be.
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {markerPoint && (
          <>
            <span className="mn-line-chart__marker-rule" style={pos(markerPoint.x)} />
            <span
              className="mn-line-chart__marker"
              style={pos(markerPoint.x, markerPoint.y)}
            />
            {marker?.label && (
              <span className="mn-line-chart__callout type-body-caption" style={pos(markerPoint.x)}>
                {marker.label}
              </span>
            )}
          </>
        )}
      </div>

      {showAxis && xLabels && xLabels.length > 0 && (
        <div className="mn-line-chart__axis">
          {xLabels.map((label) => (
            <span key={label} className="mn-line-chart__axis-label type-body-caption">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
