import React from 'react'
import './Tab.css'

export interface TabProps {
  label?: string
  isSelected?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  previewState?: 'hover' | 'pressed' | 'focus'
  /** Only set when a real tabpanel exists to control; omit otherwise. */
  ariaControls?: string
  id?: string
  /** Roving tabindex — managed by the Tabs container. */
  tabIndex?: number
}

export function Tab({
  label = 'Tab',
  isSelected = false,
  onClick,
  previewState,
  ariaControls,
  id,
  tabIndex,
}: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={ariaControls}
      tabIndex={tabIndex}
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
