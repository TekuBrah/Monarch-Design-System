import React, { useId, useRef, useState } from 'react'
import { Icon } from '../Icon'
import './TimePicker.css'

export type TimePickerAppearance = 'standard' | 'subtle'

export interface TimePickerProps {
  appearance?: TimePickerAppearance
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Clears the value — wired to the trailing clear icon shown once filled. */
  onClear?: () => void
  /** Time options dropdown, rendered below when open. App-provided — Figma
   * marks its own list as a replaceable example slot, same as Select. */
  timesSlot?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  name?: string
  /** Accessible name — this component has no visible label. */
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover' | 'focus'
}

export function TimePicker({
  appearance = 'standard',
  placeholder = '1:00 PM',
  value,
  defaultValue,
  onChange,
  onClear,
  timesSlot,
  isOpen,
  onOpenChange,
  isDisabled = false,
  isInvalid = false,
  id,
  name,
  ariaLabel,
  previewState,
}: TimePickerProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const menuId = `${inputId}-times`
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
  const currentValue = value ?? uncontrolledValue
  const hasValue = currentValue.length > 0
  const [isFocused, setIsFocused] = useState(false)
  const showTimes = open && !!timesSlot

  // Confirmed per-variant from Figma: the clear icon is visible only when
  // there's a value AND the field isn't focused (Filled/Invalid). Unlike
  // DatePicker, Hydrate (focused + has a value) keeps the icon hidden too —
  // simpler rule here, no isInvalid override needed.
  const showClearIcon = hasValue && !isFocused

  const className = [
    'timepicker',
    `timepicker--${appearance}`,
    isDisabled && 'timepicker--disabled',
    isInvalid && 'timepicker--invalid',
    previewState && `timepicker--${previewState}`,
  ]
    .filter(Boolean)
    .join(' ')

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      setUncontrolledValue('')
      onChange?.('')
    }
    inputRef.current?.focus()
  }

  return (
    <div className={className} data-preview={previewState}>
      <div
        className="timepicker__control"
        onClick={() => {
          if (isDisabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        <span className="timepicker__stack">
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="text"
            className="timepicker__input type-body-m"
            value={currentValue}
            placeholder={placeholder}
            disabled={isDisabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={showTimes ? menuId : undefined}
            aria-invalid={isInvalid || undefined}
            aria-label={ariaLabel}
            onChange={e => {
              if (value === undefined) setUncontrolledValue(e.target.value)
              onChange?.(e.target.value)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </span>
        <span className="timepicker__icon" style={{ opacity: showClearIcon ? 1 : 0 }}>
          <button
            type="button"
            className="timepicker__clear"
            tabIndex={-1}
            aria-label="Clear time"
            aria-hidden={!showClearIcon}
            disabled={isDisabled || !showClearIcon}
            onClick={e => {
              e.stopPropagation()
              handleClear()
            }}
          >
            <Icon name="remove_circle" size="m" />
          </button>
        </span>
      </div>
      {showTimes && (
        <div id={menuId} className="timepicker__menu">
          {timesSlot}
        </div>
      )}
    </div>
  )
}
