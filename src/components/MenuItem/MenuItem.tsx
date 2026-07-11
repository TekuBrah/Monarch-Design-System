import React from 'react'
import './MenuItem.css'
import { Avatar } from '../Avatar'
import { Checkbox } from '../Checkbox'
import { Radio } from '../Radio'

export type MenuItemType = 'default' | 'crypto' | 'account' | 'checkbox' | 'radio'

export interface MenuItemProps {
  type?: MenuItemType
  label?: string
  isSelected?: boolean
  onSelect?: () => void
  id?: string
  className?: string

  /** Leading badge for type="default" / "crypto" — app-provided, not a fixed component. */
  iconSlot?: React.ReactNode
  /** Maps to Figma's `icon` toggle — hides the leading slot even when content is passed. */
  showIcon?: boolean

  /** type="account" */
  avatarSrc?: string
  avatarName?: string
  avatarInitials?: string
  trailingLabel?: string

  /** type="crypto" */
  labelCrypto?: string
  labelWallet?: string
  labelAmount?: string
  labelAmountCrypto?: string

  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed'
}

export function MenuItem({
  type = 'default',
  label = 'Label',
  isSelected = false,
  onSelect,
  id,
  className,
  iconSlot,
  showIcon = true,
  avatarSrc,
  avatarName,
  avatarInitials,
  trailingLabel = 'Label',
  labelCrypto = 'Crypto',
  labelWallet = 'Wallet',
  labelAmount = '$0,000.00',
  labelAmountCrypto = '0.00 ETH',
  previewState,
}: MenuItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.()
    }
  }

  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      data-type={type}
      data-preview={previewState}
      onClick={() => onSelect?.()}
      onKeyDown={handleKeyDown}
      className={[
        'menu-item',
        `menu-item--${type}`,
        isSelected && 'menu-item--selected',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {type === 'default' && (
        <>
          {showIcon && iconSlot && <span className="menu-item__icon menu-item__icon--default">{iconSlot}</span>}
          <span className="menu-item__label type-body-sm">{label}</span>
        </>
      )}

      {type === 'crypto' && (
        <>
          {showIcon && iconSlot && <span className="menu-item__icon menu-item__icon--crypto">{iconSlot}</span>}
          <span className="menu-item__crypto-primary">
            <span className="menu-item__crypto-name type-body-m-semibold">{labelCrypto}</span>
            <span className="menu-item__crypto-sub type-body-caption">{labelWallet}</span>
          </span>
          <span className="menu-item__crypto-trailing">
            <span className="menu-item__crypto-name type-body-m-semibold">{labelAmount}</span>
            <span className="menu-item__crypto-sub type-body-caption">{labelAmountCrypto}</span>
          </span>
        </>
      )}

      {type === 'account' && (
        <>
          {showIcon && (
            <span className="menu-item__icon menu-item__icon--account">
              <Avatar size="m" src={avatarSrc} name={avatarName} initials={avatarInitials} />
            </span>
          )}
          <span className="menu-item__label menu-item__label--account type-body-m-semibold">{label}</span>
          <span className="menu-item__trailing">
            <span className="menu-item__trailing-label type-body-sm">{trailingLabel}</span>
            {/* Presentational — the row (role="option") owns selection semantics, not this dot. */}
            <span className="menu-item__control" inert aria-hidden="true">
              <Radio isChecked={isSelected} label="" />
            </span>
          </span>
        </>
      )}

      {type === 'checkbox' && (
        <span className="menu-item__control menu-item__control--checkbox" inert aria-hidden="true">
          <Checkbox isChecked={isSelected} label={label} />
        </span>
      )}

      {type === 'radio' && (
        <span className="menu-item__control menu-item__control--radio" inert aria-hidden="true">
          <Radio isChecked={isSelected} label={label} />
        </span>
      )}
    </div>
  )
}
