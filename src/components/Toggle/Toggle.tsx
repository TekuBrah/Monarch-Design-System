import React from 'react'
import './Toggle.css'

export type ToggleSize = 'regular' | 'large'

export interface ToggleProps {
  size?: ToggleSize
  isChecked?: boolean
  isDisabled?: boolean
  onChange?: (checked: boolean) => void
  ariaLabel?: string
}

export function Toggle({
  size = 'regular',
  isChecked = false,
  isDisabled = false,
  onChange,
  ariaLabel,
}: ToggleProps) {
  return (
    <label className={`toggle toggle--${size}${isDisabled ? ' toggle--disabled' : ''}`}>
      <input
        type="checkbox"
        className="toggle__input"
        checked={isChecked}
        disabled={isDisabled}
        onChange={e => onChange?.(e.target.checked)}
        aria-label={ariaLabel}
        role="switch"
        aria-checked={isChecked}
      />
      <span className="toggle__track">
        <span className="toggle__dot" />
      </span>
    </label>
  )
}
