import React from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 's' | 'm' | 'l'

export interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  label?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

export function Button({
  variant = 'primary',
  size = 'm',
  label = 'Button',
  leadingIcon,
  trailingIcon,
  disabled = false,
  onClick,
  previewState,
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-preview={previewState}
      className={`btn btn--${variant} btn--${size}`}
    >
      {leadingIcon}
      <span className="type-body-sm-semibold">{label}</span>
      {trailingIcon}
    </button>
  )
}
