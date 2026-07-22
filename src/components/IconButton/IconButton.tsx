import React from 'react'
import '../Button/Button.css'
import './IconButton.css'
import type { ButtonVariant } from '../Button'

export type { ButtonVariant as IconButtonVariant }
export type IconButtonSize = 's' | 'm' | 'l'

export interface IconButtonProps {
  variant?: ButtonVariant
  size?: IconButtonSize
  icon?: React.ReactNode
  ariaLabel?: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

// Consumes the same variant token maps as Button (Button.css) — icon-only,
// so it adds square padding via .btn--icon-* instead of the text sizes.
export function IconButton({
  variant = 'primary',
  size = 'm',
  icon,
  ariaLabel,
  disabled = false,
  onClick,
  previewState,
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      data-preview={previewState}
      className={`btn btn--${variant} btn--icon-${size}`}
    >
      {icon}
    </button>
  )
}
