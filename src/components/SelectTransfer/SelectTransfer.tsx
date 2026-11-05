import React, { useId, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { useFormFieldContext } from '../FormField/FormFieldContext'
import './SelectTransfer.css'

export type SelectTransferAppearance = 'standard' | 'subtle' | 'attention'

export interface SelectTransferProps {
  appearance?: SelectTransferAppearance
  /** Caption label above the amount. */
  label?: string
  /** Gate 97 (G64, R97-1): a secondary readout shown in the label slot above
   *  the amount, e.g. the token quantity the amount converts to ("0.313 ETH").
   *  It DESCRIBES the value, it does not name it: rendered as a `<span id>`
   *  (never a `<label>`) whose id is appended to the input's
   *  `aria-describedby`, after a FormField's error and helper ids. It renders
   *  inside or outside a FormField. Outside one, when `label` is also passed,
   *  the caption takes the slot and `label` names the input through
   *  `aria-label`. No live region: typing does not re-announce it. */
  caption?: string
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
  /** Width behaviour. `'fixed'` (default) keeps the 320px Figma demo box;
   *  `'fill'` takes the control to 100% of its container. Same prop and value
   *  names, and the same `width: 100%` release, as `Select.sizing` (G15).
   *  Closes gap G19 for this component. */
  sizing?: 'fixed' | 'fill'
}

export function SelectTransfer({
  appearance = 'standard',
  label,
  caption,
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
  sizing = 'fixed',
}: SelectTransferProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const menuId = `${inputId}-menu`
  const curMenuId = `${inputId}-currency-menu`
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  // Gate 91: inside a FormField (R91D-7) the wrapper's label names the amount
  // input and its messages describe it, so the caption `label` is not rendered
  // (Figma's case study turns it off, `Label#41:8` false). `combobox` supports
  // `aria-invalid`, so the error line sets it. Outside a FormField this is
  // `null` and the markup is v2.9.0's (R91D-8, hash-pinned).
  const formField = useFormFieldContext()
  const showLabel = !!label && !formField
  // Gate 97 (R97-1): with no `caption` every expression below reduces to its
  // v2.12.0 value, so every existing render path is unchanged (hash-pinned).
  const captionId = caption ? `${inputId}-caption` : undefined
  const describedBy = caption
    ? [formField?.describedBy, captionId].filter(Boolean).join(' ')
    : formField?.describedBy
  const inputAriaLabel = caption
    ? (formField ? undefined : label || ariaLabel)
    : (label || formField ? undefined : ariaLabel)

  const isAttention = appearance === 'attention'
  const amountTypeClass = isAttention ? 'type-header-h5' : 'type-body-lg'
  const labelTypeClass = isAttention ? 'type-body-caption-semibold' : 'type-body-caption'

  const showMenu = open && !!menuSlot
  const showCurrencyMenu = isCurrencyOpen && !!currencyMenuSlot

  const className = [
    'mn-select-transfer',
    `mn-select-transfer--${appearance}`,
    isSelected && 'mn-select-transfer--selected',
    isDisabled && 'mn-select-transfer--disabled',
    isInvalid && 'mn-select-transfer--invalid',
    isCurrencyOpen && 'mn-select-transfer--currency-open',
    previewState && `mn-select-transfer--${previewState}`,
    sizing === 'fill' && 'mn-select-transfer--fill',
  ]
    .filter(Boolean)
    .join(' ')

  const amountInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="text"
      inputMode="decimal"
      className={`mn-select-transfer__amount ${amountTypeClass}`}
      value={value}
      placeholder={placeholder}
      disabled={isDisabled}
      size={isAttention ? Math.max((value || placeholder || '').length, 3) : undefined}
      role="combobox"
      aria-expanded={open}
      aria-controls={showMenu ? menuId : undefined}
      aria-autocomplete="list"
      aria-invalid={isInvalid || formField?.hasError || undefined}
      aria-label={inputAriaLabel}
      aria-labelledby={formField?.labelId}
      aria-describedby={describedBy}
      onChange={e => onAmountChange?.(e.target.value)}
    />
  )

  // The label slot (Figma `191:13389`): the caption when given, in the same
  // position with the same per-appearance type class, else the v2.12.0 label.
  const labelSlot = caption ? (
    <span id={captionId} className={`mn-select-transfer__label mn-select-transfer__caption ${labelTypeClass}`}>
      {caption}
    </span>
  ) : (
    showLabel && (
      <label htmlFor={inputId} className={`mn-select-transfer__label ${labelTypeClass}`}>
        {label}
      </label>
    )
  )

  const currencyPicker = (
    <div className="mn-select-transfer__currency">
      <div className="mn-select-transfer__ccy-group">
        {currencyFlag && <span className="mn-select-transfer__flag">{currencyFlag}</span>}
        {currencyLabel && <span className="mn-select-transfer__ccy type-body-m-semibold">{currencyLabel}</span>}
      </div>
      <button
        type="button"
        className="mn-select-transfer__chevron"
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
        className="mn-select-transfer__control"
        onClick={() => {
          if (isDisabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        {isAttention ? (
          <span className="mn-select-transfer__stack">
            {labelSlot}
            <span className="mn-select-transfer__amount-row">
              {amountInput}
              <span className="mn-select-transfer__divider" aria-hidden="true" />
              {currencyPicker}
            </span>
          </span>
        ) : (
          <>
            <div className="mn-select-transfer__main">
              <span className="mn-select-transfer__stack">
                {labelSlot}
                {amountInput}
              </span>
            </div>
            {currencyPicker}
          </>
        )}
      </div>
      {showMenu && (
        <div id={menuId} className="mn-select-transfer__menu">
          {menuSlot}
        </div>
      )}
      {showCurrencyMenu && (
        <div id={curMenuId} className="mn-select-transfer__menu mn-select-transfer__menu--currency">
          {currencyMenuSlot}
        </div>
      )}
    </div>
  )
}
