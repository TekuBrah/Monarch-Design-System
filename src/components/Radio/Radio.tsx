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
  /** Gate 97 (G66, R97-2). `'inline'` (default) is the v2.12.0 radio: the
   *  control first, then a `type-body-sm` label. `'row'` is the Network Fee
   *  row (Figma `1063:13768` / `1063:13778`, 343 × 56): [`label` above
   *  `description`] … [`trailingLabel`] [16px] [the control], with the whole
   *  row inside ONE `<label>`, so the row is the native hit target and the
   *  radio's name is the row's text. Group rows by `name` inside a consumer
   *  `role="radiogroup"` (or `fieldset`) to get native arrow-key movement. */
  layout?: 'inline' | 'row'
  /** `row` only: the line under the label (`type-body-m`, default text).
   *  Ignored in `inline`. */
  description?: string
  /** `row` only: the value before the control (`type-body-m`, default text).
   *  Ignored in `inline`. */
  trailingLabel?: string
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
  layout = 'inline',
  description,
  trailingLabel,
}: RadioProps) {
  const isRow = layout === 'row'
  const input = (
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
  )
  const control = (
    <span className="mn-radio__icon-wrap">
      <span className={`mn-radio__circle${isChecked ? ' mn-radio__circle--checked' : ''}${isInvalid ? ' mn-radio__circle--invalid' : ''}`}>
        {isChecked && <span className="mn-radio__dot" />}
      </span>
    </span>
  )
  const required = isRequired && (
    <span className="mn-radio__required type-body-caption-semibold">*</span>
  )

  if (isRow) {
    // The `{' '}` text nodes sit between flex items, so they never render, but
    // they keep a space between the parts of the accessible name in every
    // name computation ("Regular 60+ Min RM 4.60"), not only layout-aware ones.
    return (
      <label
        className={[
          'mn-radio',
          'mn-radio--row',
          isInvalid && 'mn-radio--invalid',
          isDisabled && 'mn-radio--disabled',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="mn-radio__text">
          {label && (
            <span className="mn-radio__row-label type-body-caption">
              {label}
              {required}
            </span>
          )}
          {label && description && ' '}
          {description && <span className="mn-radio__description type-body-m">{description}</span>}
        </span>
        {trailingLabel && ' '}
        {trailingLabel && <span className="mn-radio__trailing type-body-m">{trailingLabel}</span>}
        {input}
        {control}
      </label>
    )
  }

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
      {input}
      {control}
      {label && (
        <span className="mn-radio__label type-body-sm">
          {label}
          {required}
        </span>
      )}
    </label>
  )
}
