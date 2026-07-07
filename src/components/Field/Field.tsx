import React, { useId } from 'react'
import './Field.css'

export type FieldAppearance = 'standard' | 'subtle'

export interface FieldProps {
  appearance?: FieldAppearance
  /** Visible floating label inside the field. Maps to Figma `Label=True`. */
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** Figma `Is compact` — square, icon-only field (no text/label). */
  isCompact?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  isRequired?: boolean
  id?: string
  name?: string
  type?: string
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover' | 'focus'
}

export function Field({
  appearance = 'standard',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  leadingIcon,
  trailingIcon,
  isCompact = false,
  isDisabled = false,
  isInvalid = false,
  isRequired = false,
  id,
  name,
  type = 'text',
  ariaLabel,
  previewState,
}: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  const className = [
    'field',
    `field--${appearance}`,
    label && !isCompact && 'field--labeled',
    isCompact && 'field--compact',
    isDisabled && 'field--disabled',
    isInvalid && 'field--invalid',
    previewState && `field--${previewState}`,
  ]
    .filter(Boolean)
    .join(' ')

  // Compact: square, icon-only. No text input or label per Figma source.
  if (isCompact) {
    return (
      <div className={className} data-preview={previewState}>
        <span className="field__icon" aria-hidden={ariaLabel ? undefined : true}>
          {leadingIcon}
        </span>
      </div>
    )
  }

  return (
    <div className={className} data-preview={previewState}>
      <div className="field__main">
        {leadingIcon && <span className="field__icon">{leadingIcon}</span>}
        <div className="field__stack">
          {label && (
            <label htmlFor={inputId} className="field__label type-body-caption">
              {label}
              {isRequired && <span className="field__required"> *</span>}
            </label>
          )}
          <input
            id={inputId}
            name={name}
            type={type}
            className="field__input type-body-m"
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={isDisabled}
            required={isRequired}
            aria-required={isRequired || undefined}
            aria-invalid={isInvalid || undefined}
            aria-label={label ? undefined : ariaLabel}
            onChange={e => onChange?.(e.target.value)}
          />
        </div>
      </div>
      {trailingIcon && <span className="field__icon">{trailingIcon}</span>}
    </div>
  )
}
