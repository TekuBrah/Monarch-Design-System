import React from 'react'
import './Radio.css'

export interface RadioProps {
  label?: string
  isChecked?: boolean
  isInvalid?: boolean
  isRequired?: boolean
  isDisabled?: boolean
  onChange?: () => void
  name?: string
  value?: string
  id?: string
}

export function Radio({
  label = 'Label',
  isChecked = false,
  isInvalid = false,
  isRequired = false,
  isDisabled = false,
  onChange,
  name,
  value,
  id,
}: RadioProps) {
  return (
    <label
      className={[
        'radio',
        isInvalid && 'radio--invalid',
        isDisabled && 'radio--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        className="radio__input"
        checked={isChecked}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        onChange={() => onChange?.()}
      />
      <span className="radio__icon-wrap">
        <span className={`radio__circle${isChecked ? ' radio__circle--checked' : ''}${isInvalid ? ' radio__circle--invalid' : ''}`}>
          {isChecked && <span className="radio__dot" />}
        </span>
      </span>
      {label && (
        <span className="radio__label type-body-sm">
          {label}
          {isRequired && (
            <span className="radio__required type-body-caption-semibold">*</span>
          )}
        </span>
      )}
    </label>
  )
}
