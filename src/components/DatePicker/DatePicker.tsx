import React, { useId, useRef, useState } from 'react'
import { Icon } from '../Icon'
import './DatePicker.css'

export type DatePickerAppearance = 'standard' | 'subtle'

export interface DatePickerProps {
  appearance?: DatePickerAppearance
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Clears the value — wired to the trailing clear icon shown once filled. */
  onClear?: () => void
  /** Calendar dropdown, rendered below when open. App-provided — Figma's own
   * calendar grid is not a reusable slot component yet (deferred, same as
   * Menu/Option was for the Select family). */
  calendarSlot?: React.ReactNode
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

export function DatePicker({
  appearance = 'standard',
  placeholder = 'mm/dd/yyyy',
  value,
  defaultValue,
  onChange,
  onClear,
  calendarSlot,
  isOpen,
  onOpenChange,
  isDisabled = false,
  isInvalid = false,
  id,
  name,
  ariaLabel,
  previewState,
}: DatePickerProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const menuId = `${inputId}-calendar`
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '')
  const currentValue = value ?? uncontrolledValue
  const hasValue = currentValue.length > 0
  const [isFocused, setIsFocused] = useState(false)
  const showCalendar = open && !!calendarSlot

  // Confirmed per-variant from Figma: the trailing icon is the clear (cancel)
  // button only when there's a value AND the field isn't focused (Filled /
  // Invalid). It reverts to the calendar icon while focused, even with a
  // value present (Hydrate) — this combination isn't guessable from adjacent
  // states and was read directly.
  const showClearIcon = (hasValue && !isFocused) || isInvalid

  const className = [
    'datepicker',
    `datepicker--${appearance}`,
    isDisabled && 'datepicker--disabled',
    isInvalid && 'datepicker--invalid',
    previewState && `datepicker--${previewState}`,
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
        className="datepicker__control"
        onClick={() => {
          if (isDisabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        <span className="datepicker__stack">
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="text"
            className="datepicker__input type-body-m"
            value={currentValue}
            placeholder={placeholder}
            disabled={isDisabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={showCalendar ? menuId : undefined}
            aria-invalid={isInvalid || undefined}
            aria-label={ariaLabel}
            onChange={e => {
              if (value === undefined) setUncontrolledValue(e.target.value)
              onChange?.(e.target.value)
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={e => {
              if (isDisabled) return
              if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
                e.preventDefault()
                setOpen(true)
              } else if (open && e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
              }
            }}
          />
        </span>
        {showClearIcon ? (
          <button
            type="button"
            className="datepicker__icon datepicker__icon--clear"
            tabIndex={-1}
            aria-label="Clear date"
            disabled={isDisabled}
            onClick={e => {
              e.stopPropagation()
              handleClear()
            }}
          >
            <Icon name="cancel" size="m" />
          </button>
        ) : (
          <span className="datepicker__icon" aria-hidden="true">
            <Icon name="calendar_month" size="m" />
          </span>
        )}
      </div>
      {showCalendar && (
        <div id={menuId} className="datepicker__menu" role="dialog" aria-label="Choose date">
          {calendarSlot}
        </div>
      )}
    </div>
  )
}
