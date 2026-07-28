import { useRef, useEffect } from 'react'
import './Checkbox.css'

export type CheckboxSize = 'm' | 'l'

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
  size = 'm',
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
        'mn-checkbox',
        `mn-checkbox--${size}`,
        isInvalid && 'mn-checkbox--invalid',
        isDisabled && 'mn-checkbox--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        className="mn-checkbox__input"
        checked={isChecked}
        disabled={isDisabled}
        required={isRequired}
        aria-required={isRequired || undefined}
        aria-invalid={isInvalid || undefined}
        aria-checked={isIndeterminate ? 'mixed' : isChecked}
        onChange={e => onChange?.(e.target.checked)}
      />
      <span className="mn-checkbox__box-wrap">
        <span className={`mn-checkbox__box${isMarked ? ' mn-checkbox__box--marked' : ''}${isInvalid ? ' mn-checkbox__box--invalid' : ''}`}>
          {isChecked && !isIndeterminate && (
            <svg className="mn-checkbox__check" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {isIndeterminate && (
            <svg className="mn-checkbox__check" viewBox="0 0 10 2" fill="none" aria-hidden="true">
              <line x1="1" y1="1" x2="9" y2="1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </span>
      {label && (
        <span className="mn-checkbox__label type-body-sm">
          {label}
          {isRequired && (
            <span className="mn-checkbox__required type-body-caption-semibold">*</span>
          )}
        </span>
      )}
    </label>
  )
}
