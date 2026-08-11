import React from 'react'
import { IconObject } from '../IconObject'
import type { IconObjectColor, IconObjectShape, IconObjectSize } from '../IconObject'
import './CardBalance.css'

export interface CardBalanceProps {
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
  type: string
  name: string
  amount: string
  onClick?: () => void
  className?: string
}

export function CardBalance({
  icon,
  iconColor = 'slate',
  iconSize = 'l',
  shape = 'circle',
  iconAriaLabel,
  type,
  name,
  amount,
  onClick,
  className,
}: CardBalanceProps) {
  const classes = ['mn-card-balance', className].filter(Boolean).join(' ')
  const content = (
    <>
      <div className="mn-card-balance__header">
        <IconObject color={iconColor} size={iconSize} shape={shape} ariaLabel={iconAriaLabel}>
          {icon}
        </IconObject>
        <div className="mn-card-balance__text">
          <span className="mn-card-balance__type type-body-caption">{type}</span>
          <span className="mn-card-balance__name type-body-caption-semibold">{name}</span>
        </div>
      </div>
      <span className="mn-card-balance__amount type-body-m-semibold">{amount}</span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
