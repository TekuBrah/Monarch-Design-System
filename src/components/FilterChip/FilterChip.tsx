import React from 'react'
import './FilterChip.css'

export interface FilterChipProps {
  label?: string
  isSelected?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

export function FilterChip({
  label = 'Chip',
  isSelected = false,
  iconLeft,
  iconRight,
  onClick,
  previewState,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      data-preview={previewState}
      data-icon-left={!!iconLeft}
      data-icon-right={!!iconRight}
      className={['filter-chip', isSelected && 'filter-chip--selected'].filter(Boolean).join(' ')}
    >
      {iconLeft && <span className="filter-chip__icon">{iconLeft}</span>}
      <span className="filter-chip__label type-body-caption-semibold">{label}</span>
      {iconRight && <span className="filter-chip__icon">{iconRight}</span>}
    </button>
  )
}
