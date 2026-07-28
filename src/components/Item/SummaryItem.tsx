import React from 'react'
import { IconObject } from '../IconObject'
import { Icon } from '../Icon'
import './SummaryItem.css'

export interface SummaryItemProps {
  /** Icon shown inside the leading IconObject badge. */
  icon?: React.ReactNode
  amount: string
  type: string
  className?: string
}

export function SummaryItem({
  icon = <Icon name="question_mark" size="m" />,
  amount,
  type,
  className,
}: SummaryItemProps) {
  return (
    <div className={['mn-summary-item', className].filter(Boolean).join(' ')}>
      <IconObject color="slate" size="l">
        {icon}
      </IconObject>
      <div className="mn-summary-item__text">
        <span className="mn-summary-item__amount type-body-m-semibold">{amount}</span>
        <span className="mn-summary-item__type type-body-caption">{type}</span>
      </div>
    </div>
  )
}
