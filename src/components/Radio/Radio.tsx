import './Radio.css'

export interface RadioProps {
  label?: string
  isChecked?: boolean
  isInvalid?: boolean
  isRequired?: boolean
  isDisabled?: boolean
  onChange?: (checked: boolean) => void
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
        'mn-radio',
        isInvalid && 'mn-radio--invalid',
        isDisabled && 'mn-radio--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        className="mn-radio__input"
        checked={isChecked}
        disabled={isDisabled}
        required={isRequired}
        aria-required={isRequired || undefined}
        aria-invalid={isInvalid || undefined}
        onChange={e => onChange?.(e.target.checked)}
      />
      <span className="mn-radio__icon-wrap">
        <span className={`mn-radio__circle${isChecked ? ' mn-radio__circle--checked' : ''}${isInvalid ? ' mn-radio__circle--invalid' : ''}`}>
          {isChecked && <span className="mn-radio__dot" />}
        </span>
      </span>
      {label && (
        <span className="mn-radio__label type-body-sm">
          {label}
          {isRequired && (
            <span className="mn-radio__required type-body-caption-semibold">*</span>
          )}
        </span>
      )}
    </label>
  )
}
