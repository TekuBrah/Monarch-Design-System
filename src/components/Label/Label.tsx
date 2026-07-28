import React from 'react'
import './Label.css'

export type LabelSize = 'm' | 's'

export interface LabelProps {
  label?: string
  size?: LabelSize
  isRequired?: boolean
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
}

export function Label({
  label = 'Label',
  size = 's',
  isRequired = false,
  iconBefore,
  iconAfter,
}: LabelProps) {
  const isM = size === 'm'
  return (
    <div className="mn-label">
      {iconBefore && (
        <span className="mn-label__icon">{iconBefore}</span>
      )}
      <span className={`mn-label__text ${isM ? 'type-body-m-semibold' : 'type-body-sm-semibold'}`}>
        {label}
        {isRequired && (
          <span className={`mn-label__required ${isM ? 'type-body-m-semibold' : 'type-body-caption-semibold'}`}>
            *
          </span>
        )}
      </span>
      {iconAfter && (
        <span className="mn-label__icon">{iconAfter}</span>
      )}
    </div>
  )
}
