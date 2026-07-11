import React, { useId, useState, useRef } from 'react'
import { Icon } from '../Icon'
import './Select.css'

export type SelectAppearance = 'standard' | 'subtle'

export interface SelectProps {
  appearance?: SelectAppearance
  /** Floating caption label inside the trigger. */
  label?: string
  placeholder?: string
  /** Current text — the search query while typing, or the chosen value's label. */
  value?: string
  /** Fires as the user types (searchable combobox) — the app filters its menu. */
  onSearchChange?: (value: string) => void
  /** Allow typing to filter. Default true (this is a searchable select). */
  searchable?: boolean
  /** Controlled open state; omit for uncontrolled. */
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Dropdown content, rendered below when open. App-provided (Figma: replaceable slot). */
  menuSlot?: React.ReactNode
  /** Optional leading element — wrap decorative content (Logo/flag) in ElementWrapper. */
  leadingSlot?: React.ReactNode
  /** Figma `Selected` state — persistent blue border + glow ring after a choice. */
  isSelected?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  name?: string
  /** Accessible name when no visible `label`. */
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover' | 'focus'
}

export function Select({
  appearance = 'standard',
  label,
  placeholder,
  value,
  onSearchChange,
  searchable = true,
  isOpen,
  onOpenChange,
  menuSlot,
  leadingSlot,
  isSelected = false,
  isDisabled = false,
  isInvalid = false,
  id,
  name,
  ariaLabel,
  previewState,
}: SelectProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const menuId = `${inputId}-menu`
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const showMenu = open && !!menuSlot

  const className = [
    'select',
    `select--${appearance}`,
    isSelected && 'select--selected',
    isDisabled && 'select--disabled',
    isInvalid && 'select--invalid',
    previewState && `select--${previewState}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} data-preview={previewState}>
      <div
        className="select__control"
        onClick={() => {
          if (isDisabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        {leadingSlot && <span className="select__lead">{leadingSlot}</span>}
        <span className="select__stack">
          {label && (
            <label htmlFor={inputId} className="select__label type-body-caption">
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="text"
            className="select__input type-body-m"
            value={value}
            placeholder={placeholder}
            readOnly={!searchable}
            disabled={isDisabled}
            role="combobox"
            aria-expanded={open}
            aria-controls={showMenu ? menuId : undefined}
            aria-autocomplete={searchable ? 'list' : undefined}
            aria-invalid={isInvalid || undefined}
            aria-label={label ? undefined : ariaLabel}
            onChange={e => onSearchChange?.(e.target.value)}
          />
        </span>
        <button
          type="button"
          className="select__chevron"
          tabIndex={-1}
          aria-label={open ? 'Close options' : 'Open options'}
          disabled={isDisabled}
          onClick={e => {
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          <Icon name="icon_chevron_expand_more" size="m" />
        </button>
      </div>
      {showMenu && (
        <div id={menuId} className="select__menu">
          {menuSlot}
        </div>
      )}
    </div>
  )
}
