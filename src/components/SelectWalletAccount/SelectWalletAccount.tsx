import React, { useId, useState } from 'react'
import { Icon } from '../Icon'
import { useFormFieldContext } from '../FormField/FormFieldContext'
import './SelectWalletAccount.css'

export type SelectWalletAccountAppearance = 'standard' | 'subtle'
export type SelectWalletAccountState = 'default' | 'filled' | 'selected'

export interface SelectWalletAccountProps {
  appearance?: SelectWalletAccountAppearance
  /** Figma `State` — ignored while `isOpen` is true (Typing takes over). */
  state?: SelectWalletAccountState
  labelCrypto?: string
  labelWallet?: string
  labelAmount?: string
  labelAmtCrypto?: string
  showChevron?: boolean
  /** Dropdown content, rendered below when open. App-provided (Figma: replaceable slot;
   * Figma's own example composes a search Field + option list — with a logo per
   * row — inside it). The trigger shows a leading element only when Figma's
   * `icon left` boolean is on (default off) — see `leadingSlot`. */
  menuSlot?: React.ReactNode
  /** Leading element inside the trigger, before the name stack: Figma's
   *  `icon left` boolean (default off), an `<element>` Size=XXL 40 slot. Pass a
   *  40px node, e.g. `<Avatar size="l" … />`. Decorative: it is `aria-hidden`,
   *  and the trigger's accessible name never reads from it. Gate 91 (G54). */
  leadingSlot?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover'
  /** Width behaviour. `'fixed'` (default) keeps the 320px Figma demo box;
   *  `'fill'` takes the trigger to 100% of its container. Same prop and value
   *  names, and the same `width: 100%` release, as `Select.sizing` (G15).
   *  Closes gap G19 for this component. */
  sizing?: 'fixed' | 'fill'
}

export function SelectWalletAccount({
  appearance = 'standard',
  state = 'default',
  labelCrypto,
  labelWallet,
  labelAmount,
  labelAmtCrypto,
  showChevron = true,
  menuSlot,
  leadingSlot,
  isOpen,
  onOpenChange,
  isDisabled = false,
  isInvalid = false,
  id,
  ariaLabel,
  previewState,
  sizing = 'fixed',
}: SelectWalletAccountProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const menuId = `${controlId}-menu`
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const showMenu = open && !!menuSlot
  // Gate 91: inside a FormField (R91D-7) the trigger is named by the wrapper's
  // label FOLLOWED BY its own existing name: `aria-labelledby` lists the label
  // and then the button itself, and a self-reference resolves to the button's
  // `aria-label`. That keeps the visible label in the name (WCAG 2.5.3). The
  // messages describe it. `aria-invalid` is NOT taken from the wrapper:
  // `button` does not support it in ARIA 1.2, so the described-by error line
  // carries the meaning. Outside a FormField this is `null` and the markup is
  // v2.9.0's (R91D-8, hash-pinned).
  const formField = useFormFieldContext()

  const className = [
    'mn-select-wallet-account',
    `mn-select-wallet-account--${appearance}`,
    !open && state === 'filled' && 'mn-select-wallet-account--filled',
    !open && state === 'selected' && 'mn-select-wallet-account--selected',
    open && 'mn-select-wallet-account--open',
    isDisabled && 'mn-select-wallet-account--disabled',
    isInvalid && 'mn-select-wallet-account--invalid',
    previewState && `mn-select-wallet-account--${previewState}`,
    sizing === 'fill' && 'mn-select-wallet-account--fill',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} data-preview={previewState}>
      <button
        type="button"
        id={controlId}
        className="mn-select-wallet-account__control"
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={showMenu ? menuId : undefined}
        aria-invalid={isInvalid || undefined}
        aria-label={ariaLabel ?? [labelCrypto, labelWallet].filter(Boolean).join(' — ')}
        aria-labelledby={formField ? `${formField.labelId} ${controlId}` : undefined}
        aria-describedby={formField?.describedBy}
        onClick={() => {
          if (isDisabled) return
          setOpen(!open)
        }}
      >
        <span className="mn-select-wallet-account__main">
          {leadingSlot && (
            <span className="mn-select-wallet-account__leading" aria-hidden="true">
              {leadingSlot}
            </span>
          )}
          <span className="mn-select-wallet-account__stack">
            <span className="mn-select-wallet-account__name type-body-m-semibold">{labelCrypto}</span>
            <span className="mn-select-wallet-account__wallet type-body-sm">{labelWallet}</span>
          </span>
        </span>
        <span className="mn-select-wallet-account__side">
          <span className="mn-select-wallet-account__amounts">
            <span className="mn-select-wallet-account__amount type-body-m-semibold">{labelAmount}</span>
            <span className="mn-select-wallet-account__amtcrypto type-body-sm-semibold">{labelAmtCrypto}</span>
          </span>
          {showChevron && (
            <span className="mn-select-wallet-account__chevron">
              <Icon name="icon_chevron_expand_more" size="m" />
            </span>
          )}
        </span>
      </button>
      {showMenu && (
        <div id={menuId} className="mn-select-wallet-account__menu">
          {menuSlot}
        </div>
      )}
    </div>
  )
}
