import React, { useId, useRef, useState } from 'react'
import { Icon } from '../Icon'
import './SelectTransfer.css'

export type SelectTransferAppearance = 'standard' | 'subtle' | 'attention'

export interface SelectTransferProps {
  appearance?: SelectTransferAppearance
  /** Caption label above the amount. */
  label?: string
  /** Amount placeholder. */
  placeholder?: string
  /** Amount value. */
  value?: string
  onAmountChange?: (value: string) => void
  // ── Currency picker (right side) ──
  currencyLabel?: string
  /** Flag/currency mark — wrap in ElementWrapper size="m" (20px). */
  currencyFlag?: React.ReactNode
  onCurrencyClick?: () => void
  /** Currency options dropdown — app-provided slot, shown when isCurrencyOpen. */
  currencyMenuSlot?: React.ReactNode
  isCurrencyOpen?: boolean
  // ── Amount menu ──
  /** Amount options dropdown — app-provided slot, shown when isOpen. */
  menuSlot?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  // ── State ──
  isSelected?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover' | 'focus'
}

export function SelectTransfer({
  appearance = 'standard',
  label,
  placeholder,
  value,
  onAmountChange,
  currencyLabel,
  currencyFlag,
  onCurrencyClick,
  currencyMenuSlot,
  isCurrencyOpen = false,
  menuSlot,
  isOpen,
  onOpenChange,
  isSelected = false,
  isDisabled = false,
  isInvalid = false,
  id,
  ariaLabel,
  previewState,
}: SelectTransferProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const menuId = `${inputId}-menu`
  const curMenuId = `${inputId}-currency-menu`
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))

  const isAttention = appearance === 'attention'
  const amountTypeClass = isAttention ? 'type-header-h5' : 'type-body-lg'
  const labelTypeClass = isAttention ? 'type-body-caption-semibold' : 'type-body-caption'

  const showMenu = open && !!menuSlot
  const showCurrencyMenu = isCurrencyOpen && !!currencyMenuSlot

  const className = [
    'stf',
    `stf--${appearance}`,
    isSelected && 'stf--selected',
    isDisabled && 'stf--disabled',
    isInvalid && 'stf--invalid',
    isCurrencyOpen && 'stf--currency-open',
    previewState && `stf--${previewState}`,
  ]
    .filter(Boolean)
    .join(' ')

  const amountInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="text"
      inputMode="decimal"
      className={`stf__amount ${amountTypeClass}`}
      value={value}
      placeholder={placeholder}
      disabled={isDisabled}
      size={isAttention ? Math.max((value || placeholder || '').length, 3) : undefined}
      role="combobox"
      aria-expanded={open}
      aria-controls={showMenu ? menuId : undefined}
      aria-autocomplete="list"
      aria-invalid={isInvalid || undefined}
      aria-label={label ? undefined : ariaLabel}
      onChange={e => onAmountChange?.(e.target.value)}
    />
  )

  const currencyPicker = (
    <div className="stf__currency">
      <div className="stf__ccy-group">
        {currencyFlag && <span className="stf__flag">{currencyFlag}</span>}
        {currencyLabel && <span className="stf__ccy type-body-m-semibold">{currencyLabel}</span>}
      </div>
      <button
        type="button"
        className="stf__chevron"
        tabIndex={-1}
        aria-haspopup="listbox"
        aria-expanded={isCurrencyOpen}
        aria-controls={showCurrencyMenu ? curMenuId : undefined}
        aria-label="Choose currency"
        disabled={isDisabled}
        onClick={e => { e.stopPropagation(); onCurrencyClick?.() }}
      >
        <Icon name="icon_chevron_expand_more" size="m" />
      </button>
    </div>
  )

  return (
    <div className={className} data-preview={previewState}>
      <div
        className="stf__control"
        onClick={() => {
          if (isDisabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        {isAttention ? (
          <span className="stf__stack">
            {label && (
              <label htmlFor={inputId} className={`stf__label ${labelTypeClass}`}>
                {label}
              </label>
            )}
            <span className="stf__amount-row">
              {amountInput}
              <span className="stf__divider" aria-hidden="true" />
              {currencyPicker}
            </span>
          </span>
        ) : (
          <>
            <div className="stf__main">
              <span className="stf__stack">
                {label && (
                  <label htmlFor={inputId} className={`stf__label ${labelTypeClass}`}>
                    {label}
                  </label>
                )}
                {amountInput}
              </span>
            </div>
            {currencyPicker}
          </>
        )}
      </div>
      {showMenu && (
        <div id={menuId} className="stf__menu">
          {menuSlot}
        </div>
      )}
      {showCurrencyMenu && (
        <div id={curMenuId} className="stf__menu stf__menu--currency">
          {currencyMenuSlot}
        </div>
      )}
    </div>
  )
}
