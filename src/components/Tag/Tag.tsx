import React from 'react'
import './Tag.css'

export type TagAppearance = 'default' | 'overlay'
export type TagSize = 'M' | 'S'

export interface TagProps {
  label?: string
  appearance?: TagAppearance
  size?: TagSize
  isSelected?: boolean
  isDisabled?: boolean
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export function Tag({
  label = 'Tag',
  appearance = 'default',
  size = 'M',
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
        'tag',
        `tag--${appearance}`,
        `tag--${size.toLowerCase()}`,
        isSelected && 'tag--selected',
        isDisabled && 'tag--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      onClick={onClick}
    >
      {iconBefore && <span className="tag__icon">{iconBefore}</span>}
      <span className={`tag__label ${size === 'M' ? 'type-body-sm' : 'type-body-caption'}`}>
        {label}
      </span>
      {iconAfter && <span className="tag__icon">{iconAfter}</span>}
    </button>
  )
}
