import React from 'react'
import { IconObject } from '../IconObject'
import './CardBalance.css'

export interface CardBalanceProps {
  icon?: React.ReactNode
  type: string
  name: string
  amount: string
  className?: string
}

export function CardBalance({ icon, type, name, amount, className }: CardBalanceProps) {
  return (
    <div className={['card-balance', className].filter(Boolean).join(' ')}>
      <div className="card-balance__header">
        <IconObject color="slate" size="large">
          {icon}
        </IconObject>
        <div className="card-balance__text">
          <span className="card-balance__type type-body-caption">{type}</span>
          <span className="card-balance__name type-body-caption-semibold">{name}</span>
        </div>
      </div>
      <span className="card-balance__amount type-body-m-semibold">{amount}</span>
    </div>
  )
}
