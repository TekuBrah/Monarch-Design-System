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
  /** `'fixed'` (default) keeps the Figma component box: `width: 240px`.
   *  `'fill'` takes the field to 100% of its container, so a consumer can size
   *  it from the column instead of overriding DS rules from the app. Same
   *  shape as `CardBalance.sizing` / `CardFeaturesAndEducation.sizing`.
   *
   *  `isCompact` OUTRANKS this: compact is a square icon-only box, and
   *  `.mn-field--compact { width: auto }` is declared AFTER `--fill` at equal
   *  specificity, so `isCompact sizing="fill"` stays square. See Field.css. */
  sizing?: 'fixed' | 'fill'
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
  sizing = 'fixed',
}: FieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  const className = [
    'mn-field',
    `mn-field--${appearance}`,
    label && !isCompact && 'mn-field--labeled',
    isCompact && 'mn-field--compact',
    isDisabled && 'mn-field--disabled',
    isInvalid && 'mn-field--invalid',
    previewState && `mn-field--${previewState}`,
    sizing === 'fill' && 'mn-field--fill',
  ]
    .filter(Boolean)
    .join(' ')

  // Compact: square, icon-only. No text input or label per Figma source.
  // role="img" + aria-label on the outer box gives it a real accessible name —
  // the icon itself stays aria-hidden so it isn't announced twice.
  if (isCompact) {
    return (
      <div
        className={className}
        data-preview={previewState}
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
      >
        <span className="mn-field__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      </div>
    )
  }

  return (
    <div className={className} data-preview={previewState}>
      <div className="mn-field__main">
        {leadingIcon && <span className="mn-field__icon">{leadingIcon}</span>}
        <div className="mn-field__stack">
          {label && (
            <label htmlFor={inputId} className="mn-field__label type-body-caption">
              {label}
              {isRequired && <span className="mn-field__required"> *</span>}
            </label>
          )}
          <input
            id={inputId}
            name={name}
            type={type}
            className="mn-field__input type-body-m"
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
      {trailingIcon && <span className="mn-field__icon">{trailingIcon}</span>}
    </div>
  )
}
