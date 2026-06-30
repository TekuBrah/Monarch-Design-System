import React from 'react'
import './Tab.css'

export interface TabProps {
  label?: string
  isSelected?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  previewState?: 'hover' | 'press' | 'focus'
  ariaControls?: string
  id?: string
}

export function Tab({
  label = 'Tab',
  isSelected = false,
  onClick,
  previewState,
  ariaControls,
  id,
}: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={ariaControls}
      className={[
        'tab',
        isSelected && 'tab--selected',
        previewState && `tab--${previewState}`,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <span className="tab__label type-body-caption-semibold">{label}</span>
    </button>
  )
}
