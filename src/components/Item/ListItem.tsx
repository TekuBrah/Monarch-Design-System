import React from 'react'
import { Icon } from '../Icon'
import './ListItem.css'

export type ListItemType = 'default' | 'profile' | 'crypto'

export interface ListItemProps {
  type?: ListItemType
  /** Leading visual — company logo, Avatar, or crypto mark; caller-composed. */
  leading?: React.ReactNode
  title: string
  /** `default`/`crypto`: caption subtitle. `profile`: body-sm subtitle (toggle via `hasTitleInfo`). */
  titleInfo?: string
  /** `profile` only — toggles the subtitle line. */
  hasTitleInfo?: boolean
  /** `default`/`crypto` only — trailing amount. */
  amount?: string
  /** `default`: caption under the amount. `crypto`: trend caption next to the triangle. */
  amountInfo?: string
  /** `default` only — receipt icon before the amount. */
  hasReceiptIcon?: boolean
  /** `profile` only — trailing chevron. */
  hasChevron?: boolean
  /** `crypto` only — sparkline slot. */
  miniChart?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ListItem({
  type = 'default',
  leading,
  title,
  titleInfo,
  hasTitleInfo = true,
  amount,
  amountInfo,
  hasReceiptIcon = true,
  hasChevron = true,
  miniChart,
  onClick,
  className,
}: ListItemProps) {
  const isDefault = type === 'default'
  const isProfile = type === 'profile'
  const isCrypto = type === 'crypto'

  const content = (
    <>
      <div className="list-item__leading-group">
        {leading && <div className="list-item__leading">{leading}</div>}
        <div className="list-item__text">
          <span className="list-item__title type-body-m-semibold">{title}</span>
          {isDefault && titleInfo && (
            <span className="list-item__subtitle type-body-caption">{titleInfo}</span>
          )}
          {isProfile && hasTitleInfo && titleInfo && (
            <span className="list-item__subtitle type-body-sm">{titleInfo}</span>
          )}
          {isCrypto && titleInfo && (
            <span className="list-item__subtitle type-body-caption">{titleInfo}</span>
          )}
        </div>
      </div>

      {isCrypto && miniChart && <div className="list-item__chart">{miniChart}</div>}

      {isDefault && (
        <div className="list-item__trailing">
          <div className="list-item__amount-row">
            {hasReceiptIcon && <Icon name="receipt_long" size="s" />}
            <span className="list-item__amount type-body-m-semibold">{amount}</span>
          </div>
          {amountInfo && (
            <span className="list-item__amount-info type-body-caption">{amountInfo}</span>
          )}
        </div>
      )}

      {isCrypto && (
        <div className="list-item__trailing">
          <span className="list-item__amount type-body-m-semibold">{amount}</span>
          <div className="list-item__trend">
            <Icon name="icon_triangle_up" size="xs" />
            <span className="list-item__amount-info type-body-caption">{amountInfo}</span>
          </div>
        </div>
      )}

      {isProfile && hasChevron && (
        <Icon name="icon_chevron_expand_more" size="m" />
      )}
    </>
  )

  const classes = ['list-item', `list-item--${type}`, className].filter(Boolean).join(' ')

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
