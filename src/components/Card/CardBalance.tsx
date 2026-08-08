import React from 'react'
import { IconObject } from '../IconObject'
import './CardBalance.css'

export interface CardBalanceProps {
  icon?: React.ReactNode
  type: string
  name: string
  amount: string
  onClick?: () => void
  className?: string
}

export function CardBalance({ icon, type, name, amount, onClick, className }: CardBalanceProps) {
  const classes = ['mn-card-balance', className].filter(Boolean).join(' ')
  const content = (
    <>
      <div className="mn-card-balance__header">
        <IconObject color="slate" size="l">
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
