import React from 'react'
import { Icon } from '../Icon'
import { ProgressRing } from '../ProgressRing'
import { SummaryItem } from '../Item'
import './CardMonthlyBudget.css'

export type CardMonthlyBudgetState = 'default' | 'addNew'

export interface CardMonthlyBudgetProps {
  state?: CardMonthlyBudgetState
  period?: string
  onDetailsClick?: () => void
  /** `default` state — drives the ProgressRing gauge. */
  percentage?: number
  amountLeft?: string
  totalAmount?: string
  availableAmount?: string
  spentAmount?: string
  /** `addNew` state. */
  onAddNew?: () => void
  className?: string
}

export function CardMonthlyBudget({
  state = 'default',
  period = 'dd mmm - dd mmm',
  onDetailsClick,
  percentage = 0,
  amountLeft = 'RM 0.00',
  totalAmount = 'RM 0.00',
  availableAmount = 'RM 0.00',
  spentAmount = 'RM 0.00',
  onAddNew,
  className,
}: CardMonthlyBudgetProps) {
  const isAddNew = state === 'addNew'

  return (
    <div
      className={[
        'card-monthly-budget',
        isAddNew && 'card-monthly-budget--add-new',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isAddNew ? (
        <button type="button" className="card-monthly-budget__add-new" onClick={onAddNew}>
          <span className="card-monthly-budget__add-icon">
            <Icon name="add" size="m" />
          </span>
          <span className="card-monthly-budget__add-label type-body-caption-semibold">
            Add New Budget
          </span>
        </button>
      ) : (
        <>
          <div className="card-monthly-budget__header">
            <div className="card-monthly-budget__header-text type-body-caption">
              <span className="card-monthly-budget__header-title type-body-caption-semibold">
                Monthly Budget
              </span>
              <span className="card-monthly-budget__header-dot">•</span>
              <span>{period}</span>
            </div>
            <button
              type="button"
              className="card-monthly-budget__details type-body-caption-semibold"
              onClick={onDetailsClick}
            >
              Details
            </button>
          </div>

          <div className="card-monthly-budget__body">
            <ProgressRing
              value={percentage}
              size="medium"
              caption="Left to Spend"
              amount={amountLeft}
              total={totalAmount}
            />
            <div className="card-monthly-budget__summary">
              <SummaryItem icon={<Icon name="icon_wallet" size="m" />} amount={availableAmount} type="Available" />
              <SummaryItem icon={<Icon name="icon_track_spending" size="m" />} amount={spentAmount} type="Spent" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
