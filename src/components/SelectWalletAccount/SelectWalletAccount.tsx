import React, { useId, useState } from 'react'
import { Icon } from '../Icon'
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
   * row — inside it; the trigger itself never shows a logo). */
  menuSlot?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover'
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
  isOpen,
  onOpenChange,
  isDisabled = false,
  isInvalid = false,
  id,
  ariaLabel,
  previewState,
}: SelectWalletAccountProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const menuId = `${controlId}-menu`
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const showMenu = open && !!menuSlot

  const className = [
    'swa',
    `swa--${appearance}`,
    !open && state === 'filled' && 'swa--filled',
    !open && state === 'selected' && 'swa--selected',
    open && 'swa--open',
    isDisabled && 'swa--disabled',
    isInvalid && 'swa--invalid',
    previewState && `swa--${previewState}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} data-preview={previewState}>
      <button
        type="button"
        id={controlId}
        className="swa__control"
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={showMenu ? menuId : undefined}
        aria-invalid={isInvalid || undefined}
        aria-label={ariaLabel ?? [labelCrypto, labelWallet].filter(Boolean).join(' — ')}
        onClick={() => {
          if (isDisabled) return
          setOpen(!open)
        }}
      >
        <span className="swa__main">
          <span className="swa__stack">
            <span className="swa__name type-body-m-semibold">{labelCrypto}</span>
            <span className="swa__wallet type-body-sm">{labelWallet}</span>
          </span>
        </span>
        <span className="swa__side">
          <span className="swa__amounts">
            <span className="swa__amount type-body-m-semibold">{labelAmount}</span>
            <span className="swa__amtcrypto type-body-sm-semibold">{labelAmtCrypto}</span>
          </span>
          {showChevron && (
            <span className="swa__chevron">
              <Icon name="icon_chevron_expand_more" size="m" />
            </span>
          )}
        </span>
      </button>
      {showMenu && (
        <div id={menuId} className="swa__menu">
          {menuSlot}
        </div>
      )}
    </div>
  )
}
