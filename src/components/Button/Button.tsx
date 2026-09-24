import React from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 's' | 'm' | 'l'
/** `'error'` is a destructive action ("Delete receipt", "Delete budget").
 *  Figma models it as neither a variant value nor a property: it is a Tertiary
 *  instance whose label is overridden to `text/error/default` and its icon to
 *  `icon/error/default`. So it is a separate prop rather than a fourth
 *  `ButtonVariant`, following `InlineMessage`'s `tone`. */
export type ButtonTone = 'default' | 'error'

export interface ButtonProps {
  variant?: ButtonVariant
  /** Only takes effect on `variant="tertiary"` — the only combination Figma
   *  draws. On primary/secondary it is ignored and the button renders as
   *  `'default'`. */
  tone?: ButtonTone
  size?: ButtonSize
  label?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  isDisabled?: boolean
  onClick?: () => void
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

export function Button({
  variant = 'primary',
  tone = 'default',
  size = 'm',
  label = 'Button',
  leadingIcon,
  trailingIcon,
  isDisabled = false,
  onClick,
  previewState,
}: ButtonProps) {
  const toneClass = tone === 'error' && variant === 'tertiary' ? ' mn-btn--error' : ''
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      data-preview={previewState}
      className={`mn-btn mn-btn--${variant} mn-btn--${size}${toneClass}`}
    >
      {leadingIcon}
      <span className="type-body-sm-semibold">{label}</span>
      {trailingIcon}
    </button>
  )
}
