import React from 'react'
import './Label.css'

export type LabelSize = 'M' | 'S'

export interface LabelProps {
  label?: string
  size?: LabelSize
  isRequired?: boolean
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
}

export function Label({
  label = 'Label',
  size = 'S',
  isRequired = false,
  iconBefore,
  iconAfter,
}: LabelProps) {
  const isM = size === 'M'
  return (
    <div className="label">
      {iconBefore && (
        <span className="label__icon">{iconBefore}</span>
      )}
      <span className={`label__text ${isM ? 'type-body-m-semibold' : 'type-body-sm-semibold'}`}>
        {label}
        {isRequired && (
          <span className={`label__required ${isM ? 'type-body-m-semibold' : 'type-body-caption-semibold'}`}>
            *
          </span>
        )}
      </span>
      {iconAfter && (
        <span className="label__icon">{iconAfter}</span>
      )}
    </div>
  )
}
