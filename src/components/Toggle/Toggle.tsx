import './Toggle.css'

export type ToggleSize = 'm' | 'l'

export interface ToggleProps {
  size?: ToggleSize
  isChecked?: boolean
  isDisabled?: boolean
  onChange?: (checked: boolean) => void
  ariaLabel?: string
}

export function Toggle({
  size = 'm',
  isChecked = false,
  isDisabled = false,
  onChange,
  ariaLabel,
}: ToggleProps) {
  return (
    <label className={`mn-toggle mn-toggle--${size}${isDisabled ? ' mn-toggle--disabled' : ''}`}>
      <input
        type="checkbox"
        className="mn-toggle__input"
        checked={isChecked}
        disabled={isDisabled}
        onChange={e => onChange?.(e.target.checked)}
        aria-label={ariaLabel}
        role="switch"
        aria-checked={isChecked}
      />
      <span className="mn-toggle__track">
        <span className="mn-toggle__dot" />
      </span>
    </label>
  )
}
