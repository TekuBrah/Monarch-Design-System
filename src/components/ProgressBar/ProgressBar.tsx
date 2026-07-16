import React from 'react'
import './ProgressBar.css'

export type ProgressBarSize = 's' | 'm'

export interface ProgressBarProps {
  /** Fill amount, 0–100. Drives the bar width and the default `%` label. */
  value: number
  size?: ProgressBarSize
  /** Show the label row above the bar (percentage + current/total). Default true. */
  showLabels?: boolean
  /** Overrides the left `%` label. Defaults to `${Math.round(value)}%`. */
  percentageLabel?: string
  /** Right-side readout — e.g. current `3` of total `10`. */
  current?: string
  total?: string
  id?: string
  className?: string
  /** Accessible name for the bar (the visual labels aren't wired as the name). */
  ariaLabel?: string
}

export function ProgressBar({
  value,
  size = 's',
  showLabels = true,
  percentageLabel,
  current,
  total,
  id,
  className,
  ariaLabel,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value))
  const labelType = size === 'm' ? 'type-body-m' : 'type-body-caption'
  const pctType = size === 'm' ? 'type-body-m-medium' : 'type-body-caption'
  const hasReadout = current != null || total != null

  return (
    <div className={['progress-bar', `progress-bar--${size}`, className].filter(Boolean).join(' ')} id={id}>
      {showLabels && (
        <div className="progress-bar__labels">
          <span className={`progress-bar__pct ${pctType}`}>
            {percentageLabel ?? `${Math.round(pct)}%`}
          </span>
          {hasReadout && (
            <span className={`progress-bar__readout ${labelType}`}>
              <span className="progress-bar__current">{current}</span>
              <span className="progress-bar__slash" aria-hidden="true">/</span>
              <span className="progress-bar__total">{total}</span>
            </span>
          )}
        </div>
      )}
      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
