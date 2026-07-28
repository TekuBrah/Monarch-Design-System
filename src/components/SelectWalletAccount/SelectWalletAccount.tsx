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
    'mn-select-wallet-account',
    `mn-select-wallet-account--${appearance}`,
    !open && state === 'filled' && 'mn-select-wallet-account--filled',
    !open && state === 'selected' && 'mn-select-wallet-account--selected',
    open && 'mn-select-wallet-account--open',
    isDisabled && 'mn-select-wallet-account--disabled',
    isInvalid && 'mn-select-wallet-account--invalid',
    previewState && `mn-select-wallet-account--${previewState}`,
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
        onClick={() => {
          if (isDisabled) return
          setOpen(!open)
        }}
      >
        <span className="mn-select-wallet-account__main">
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
