import React from 'react'
import { Icon } from '../Icon'
import { TrendIndicator } from '../TrendIndicator'
import type { TrendDirection } from '../TrendIndicator'
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
  /**
   * `crypto` only — which way `amountInfo` moved.
   *
   * Optional with a default of `'up'` because `ListItemProps` is a flat
   * interface, not a discriminated union on `type` (no props type in this
   * library is), so it cannot be made required on the crypto branch alone
   * without making it required for `default` and `profile` too. `'up'` is
   * exactly what this row rendered unconditionally before the prop existed,
   * so every existing call site is unaffected.
   */
  trendDirection?: TrendDirection
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
  trendDirection = 'up',
  miniChart,
  onClick,
  className,
}: ListItemProps) {
  const isDefault = type === 'default'
  const isProfile = type === 'profile'
  const isCrypto = type === 'crypto'

  const content = (
    <>
      <div className="mn-list-item__leading-group">
        {leading && <div className="mn-list-item__leading">{leading}</div>}
        <div className="mn-list-item__text">
          <span className="mn-list-item__title type-body-m-semibold">{title}</span>
          {isDefault && titleInfo && (
            <span className="mn-list-item__subtitle type-body-caption">{titleInfo}</span>
          )}
          {isProfile && hasTitleInfo && titleInfo && (
            <span className="mn-list-item__subtitle type-body-sm">{titleInfo}</span>
          )}
          {isCrypto && titleInfo && (
            <span className="mn-list-item__subtitle type-body-caption">{titleInfo}</span>
          )}
        </div>
      </div>

      {isCrypto && miniChart && <div className="mn-list-item__chart">{miniChart}</div>}

      {isDefault && (
        <div className="mn-list-item__trailing">
          <div className="mn-list-item__amount-row">
            {hasReceiptIcon && <Icon name="receipt_long" size="s" />}
            <span className="mn-list-item__amount type-body-m-semibold">{amount}</span>
          </div>
          {amountInfo && (
            <span className="mn-list-item__amount-info type-body-caption">{amountInfo}</span>
          )}
        </div>
      )}

      {isCrypto && (
        <div className="mn-list-item__trailing">
          <span className="mn-list-item__amount type-body-m-semibold">{amount}</span>
          {/* Only when there is a value. A lone arrow with no number states
              nothing — this row used to render one whenever `amountInfo` was
              omitted. */}
          {amountInfo && (
            <TrendIndicator direction={trendDirection} label={amountInfo} />
          )}
        </div>
      )}

      {isProfile && hasChevron && (
        <Icon name="icon_chevron_expand_more" size="m" />
      )}
    </>
  )

  const classes = ['mn-list-item', `mn-list-item--${type}`, className].filter(Boolean).join(' ')

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
