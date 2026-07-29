import React from 'react'
import './Tag.css'

export type TagAppearance = 'default' | 'overlay'
export type TagSize = 'm' | 's'

export interface TagProps {
  label?: string
  appearance?: TagAppearance
  size?: TagSize
  isSelected?: boolean
  isDisabled?: boolean
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  onClick?: () => void
}

export function Tag({
  label = 'Tag',
  appearance = 'default',
  size = 'm',
  isSelected = false,
  isDisabled = false,
  iconBefore,
  iconAfter,
  onClick,
}: TagProps) {
  return (
    <button
      type="button"
      className={[
        'mn-tag',
        `mn-tag--${appearance}`,
        `mn-tag--${size}`,
        isSelected && 'mn-tag--selected',
        isDisabled && 'mn-tag--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      onClick={onClick}
    >
      {iconBefore && <span className="mn-tag__icon">{iconBefore}</span>}
      <span className={`mn-tag__label ${size === 'm' ? 'type-body-sm' : 'type-body-caption'}`}>
        {label}
      </span>
      {iconAfter && <span className="mn-tag__icon">{iconAfter}</span>}
    </button>
  )
}
