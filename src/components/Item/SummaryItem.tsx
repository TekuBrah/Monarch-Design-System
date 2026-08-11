import React from 'react'
import { IconObject } from '../IconObject'
import type { IconObjectColor, IconObjectShape, IconObjectSize } from '../IconObject'
import { Icon } from '../Icon'
import './SummaryItem.css'

export interface SummaryItemProps {
  /** Icon shown inside the leading IconObject badge. */
  icon?: React.ReactNode
  /** Badge tint — per-category colour. Defaults to the previously hard-coded `slate`. */
  iconColor?: IconObjectColor
  /** Badge size. Defaults to the previously hard-coded `l`. */
  iconSize?: IconObjectSize
  /** Badge shape. Defaults to `circle`, which was IconObject's implicit default here. */
  shape?: IconObjectShape
  /** Accessible name for the badge. Omitted, the badge stays decorative and
   *  unnamed — which is what it was before this prop existed. */
  iconAriaLabel?: string
  amount: string
  type: string
  className?: string
}

export function SummaryItem({
  icon = <Icon name="question_mark" size="m" />,
  iconColor = 'slate',
  iconSize = 'l',
  shape = 'circle',
  iconAriaLabel,
  amount,
  type,
  className,
}: SummaryItemProps) {
  return (
    <div className={['mn-summary-item', className].filter(Boolean).join(' ')}>
      <IconObject color={iconColor} size={iconSize} shape={shape} ariaLabel={iconAriaLabel}>
        {icon}
      </IconObject>
      <div className="mn-summary-item__text">
        <span className="mn-summary-item__amount type-body-m-semibold">{amount}</span>
        <span className="mn-summary-item__type type-body-caption">{type}</span>
      </div>
    </div>
  )
}
