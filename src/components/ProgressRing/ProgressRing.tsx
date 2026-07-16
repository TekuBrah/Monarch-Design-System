import React, { useId } from 'react'
import './ProgressRing.css'

export type ProgressRingSize = 'medium' | 'large'

export interface ProgressRingProps {
  /** Fill amount, 0–100. Drives the gauge arc and the default `%` caption. */
  value: number
  size?: ProgressRingSize
  /** Overrides the left caption number. Defaults to `${Math.round(value)}%`. */
  percentageLabel?: string
  /** Caption text after the bullet (e.g. "Left to Spend"). */
  caption?: string
  /** Big centre amount (e.g. "RM 0.00"). */
  amount?: string
  /** Pill total — rendered as "of {total}" in a custom pill (not the shared Badge —
   *  Figma's spec has different padding/radius, see ProgressRing.css). */
  total?: string
  id?: string
  className?: string
  /** Accessible name for the gauge. */
  ariaLabel?: string
}

// viewBox geometry. viewBox is 100×100; the SVG renders at `w`px, so a viewBox
// unit = w/100 px and an 8px stroke = 800/w viewBox units (computed per size —
// NOT vector-effect:non-scaling-stroke, which renders inconsistently inside a
// <mask> and previously fragmented the arc).
const R = 45
const START = 225 // arc start angle (φ measured clockwise from 12 o'clock) = 7:30, bottom-left
const SWEEP = 270 // 270° gauge, 90° gap centred at the bottom (6 o'clock)

// point on the circle at angle φ (clockwise from top)
const polar = (phi: number): [number, number] => {
  const r = (phi * Math.PI) / 180
  return [50 + R * Math.sin(r), 50 - R * Math.cos(r)]
}
// single clockwise arc-path from `fromPhi` to `toPhi`
const arcPath = (fromPhi: number, toPhi: number): string => {
  const [x1, y1] = polar(fromPhi)
  const [x2, y2] = polar(toPhi)
  const largeArc = toPhi - fromPhi > 180 ? 1 : 0
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`
}

// Per-size spec confirmed from Figma (235:5710 medium / 235:5712 large):
// the caption row and the pill both scale up from caption (12px) to body (16px),
// and the pill weight changes (medium semibold → large regular).
const SIZES: Record<
  ProgressRingSize,
  {
    w: number
    h: number
    amountType: string
    captionType: string // caption row base (size + regular)
    captionEmphType: string // the % and • (size + semibold)
    pillType: string // the "of {total}" pill text
  }
> = {
  medium: {
    w: 162,
    h: 140,
    amountType: 'type-header-h5',
    captionType: 'type-body-caption',
    captionEmphType: 'type-body-caption-semibold',
    pillType: 'type-body-caption-semibold',
  },
  large: {
    w: 220,
    h: 190,
    amountType: 'type-header-h4',
    captionType: 'type-body-m',
    captionEmphType: 'type-body-m-semibold',
    pillType: 'type-body-m',
  },
}

export function ProgressRing({
  value,
  size = 'medium',
  percentageLabel,
  caption = 'Left to Spend',
  amount = 'RM 0.00',
  total = 'RM 0.00',
  id,
  className,
  ariaLabel,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, value))
  const { w, h, amountType, captionType, captionEmphType, pillType } = SIZES[size]
  const maskId = `${useId()}-ring-fill`
  const pctText = percentageLabel ?? `${Math.round(pct)}%`
  const strokeW = 800 / w // viewBox units → 8px rendered stroke
  const trackD = arcPath(START, START + SWEEP)
  const fillD = arcPath(START, START + (SWEEP * pct) / 100)

  return (
    <div
      className={['progress-ring', `progress-ring--${size}`, className].filter(Boolean).join(' ')}
      id={id}
      style={{ width: w, height: h }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${pctText} ${caption}`}
    >
      <svg className="progress-ring__svg" width={w} height={w} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            {/* white reveals the gradient; only the value-portion of the arc is white */}
            <path d={fillD} fill="none" stroke="#fff" strokeWidth={strokeW} strokeLinecap="round" />
          </mask>
        </defs>

        {/* track */}
        <path
          d={trackD}
          fill="none"
          stroke="var(--mapped-surface-default-default)"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* gradient fill — conic blue→purple→red painted via foreignObject, masked to the value arc.
            Brand primitives by approval: a fixed data-viz gauge gradient with no mapped token.
            Omitted at 0% so the round line-cap doesn't render a stray dot. */}
        {pct > 0 && (
          <foreignObject x="0" y="0" width="100" height="100" mask={`url(#${maskId})`}>
            <div className="progress-ring__gradient" />
          </foreignObject>
        )}
      </svg>

      {/* centred on the arc's circle centre (0.5 × svg width), not the container's
          shorter box — otherwise the content sits too high in the open gauge */}
      <div className="progress-ring__content" style={{ '--ring-center-y': `${w / 2}px` } as React.CSSProperties}>
        <div className={`progress-ring__caption ${captionType}`}>
          <span className={`progress-ring__caption-pct ${captionEmphType}`}>{pctText}</span>
          <span className={`progress-ring__caption-dot ${captionEmphType}`} aria-hidden="true">•</span>
          <span>{caption}</span>
        </div>
        <div className={`progress-ring__amount ${amountType}`}>{amount}</div>
        <div className={`progress-ring__pill ${pillType}`}>
          <span>of</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  )
}
