import React from 'react'
import './ToggleChip.css'

export interface ToggleChipProps {
  label?: string
  isSelected?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  onClick?: () => void
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

export function ToggleChip({
  label = 'Chip',
  isSelected = false,
  iconLeft,
  iconRight,
  onClick,
  previewState,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      data-preview={previewState}
      data-icon-left={!!iconLeft}
      data-icon-right={!!iconRight}
      className={['mn-toggle-chip', isSelected && 'mn-toggle-chip--selected'].filter(Boolean).join(' ')}
    >
      {iconLeft && <span className="mn-toggle-chip__icon">{iconLeft}</span>}
      <span className="mn-toggle-chip__label type-body-caption-semibold">{label}</span>
      {iconRight && <span className="mn-toggle-chip__icon">{iconRight}</span>}
    </button>
  )
}
