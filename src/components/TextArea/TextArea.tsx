import React, { useId } from 'react'
import './TextArea.css'

export type TextAreaAppearance = 'standard' | 'subtle'

export interface TextAreaProps {
  appearance?: TextAreaAppearance
  /** Visible floating label above the text. Maps to Figma `Label=True`. */
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  name?: string
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover' | 'focus'
}

export function TextArea({
  appearance = 'standard',
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  isInvalid = false,
  id,
  name,
  ariaLabel,
  previewState,
}: TextAreaProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  const className = [
    'textarea',
    `textarea--${appearance}`,
    isDisabled && 'textarea--disabled',
    isInvalid && 'textarea--invalid',
    previewState && `textarea--${previewState}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} data-preview={previewState}>
      {label && (
        <label htmlFor={inputId} className="textarea__label type-body-caption">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        className="textarea__input type-body-m"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        aria-label={label ? undefined : ariaLabel}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  )
}
