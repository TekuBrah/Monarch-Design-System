import React, { useRef, useEffect } from 'react'
import './Checkbox.css'

export type CheckboxSize = 'medium' | 'large'

export interface CheckboxProps {
  label?: string
  size?: CheckboxSize
  isChecked?: boolean
  isIndeterminate?: boolean
  isInvalid?: boolean
  isRequired?: boolean
  isDisabled?: boolean
  onChange?: (checked: boolean) => void
  id?: string
}

export function Checkbox({
  label = 'Label',
  size = 'medium',
  isChecked = false,
  isIndeterminate = false,
  isInvalid = false,
  isRequired = false,
  isDisabled = false,
  onChange,
  id,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate && !isChecked
    }
  }, [isIndeterminate, isChecked])

  const isMarked = isChecked || isIndeterminate

  return (
    <label
      className={[
        'checkbox',
        `checkbox--${size}`,
        isInvalid && 'checkbox--invalid',
        isDisabled && 'checkbox--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        className="checkbox__input"
        checked={isChecked}
        disabled={isDisabled}
        required={isRequired}
        aria-required={isRequired || undefined}
        aria-invalid={isInvalid || undefined}
        aria-checked={isIndeterminate ? 'mixed' : isChecked}
        onChange={e => onChange?.(e.target.checked)}
      />
      <span className="checkbox__box-wrap">
        <span className={`checkbox__box${isMarked ? ' checkbox__box--marked' : ''}${isInvalid ? ' checkbox__box--invalid' : ''}`}>
          {isChecked && !isIndeterminate && (
            <svg className="checkbox__check" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isIndeterminate && (
            <svg className="checkbox__check" viewBox="0 0 10 2" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="9" y2="1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </span>
      {label && (
        <span className="checkbox__label type-body-sm">
          {label}
          {isRequired && (
            <span className="checkbox__required type-body-caption-semibold">*</span>
          )}
        </span>
      )}
    </label>
  )
}
