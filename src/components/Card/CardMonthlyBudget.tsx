import { Icon } from '../Icon'
import { ProgressRing } from '../ProgressRing'
import { SummaryItem } from '../Item'
import './CardMonthlyBudget.css'

export type CardMonthlyBudgetState = 'default' | 'addNew'

export interface CardMonthlyBudgetProps {
  state?: CardMonthlyBudgetState
  /** `default` state — the header title. Defaults to `'Monthly Budget'`, the
   *  previously hard-coded string, so every existing call site is unchanged.
   *  Also names the Details button: its accessible name is
   *  "Details for {title}", so two cards on one screen stay distinguishable. */
  title?: string
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
  /** `'fixed'` (default) keeps the Figma component box: `width: 343px`.
   *  `'fill'` drops `width` so the container decides — a grid track or a flex
   *  line. Same shape as `CardBalance.sizing` and
   *  `CardFeaturesAndEducation.sizing`. */
  sizing?: 'fixed' | 'fill'
}

export function CardMonthlyBudget({
  state = 'default',
  title = 'Monthly Budget',
  period = 'dd mmm - dd mmm',
  onDetailsClick,
  percentage = 0,
  amountLeft = 'RM 0.00',
  totalAmount = 'RM 0.00',
  availableAmount = 'RM 0.00',
  spentAmount = 'RM 0.00',
  onAddNew,
  className,
  sizing = 'fixed',
}: CardMonthlyBudgetProps) {
  const isAddNew = state === 'addNew'

  return (
    <div
      className={[
        'mn-card-monthly-budget',
        isAddNew && 'mn-card-monthly-budget--add-new',
        sizing === 'fill' && 'mn-card-monthly-budget--fill',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isAddNew ? (
        <button type="button" className="mn-card-monthly-budget__add-new" onClick={onAddNew}>
          <span className="mn-card-monthly-budget__add-icon">
            <Icon name="add" size="m" />
          </span>
          <span className="mn-card-monthly-budget__add-label type-body-caption-semibold">
            Add New Budget
          </span>
        </button>
      ) : (
        <>
          <div className="mn-card-monthly-budget__header">
            <div className="mn-card-monthly-budget__header-text type-body-caption">
              <span className="mn-card-monthly-budget__header-title type-body-caption-semibold">
                {title}
              </span>
              <span className="mn-card-monthly-budget__header-dot">•</span>
              <span>{period}</span>
            </div>
            {/* The visible text stays "Details"; the accessible name starts with
                it (WCAG 2.5.3) and adds the title, so two cards on one screen do
                not expose two identically named buttons. aria-label, because the
                DS has no visually-hidden utility to carry the suffix as text. */}
            <button
              type="button"
              className="mn-card-monthly-budget__details type-body-caption-semibold"
              aria-label={`Details for ${title}`}
              onClick={onDetailsClick}
            >
              Details
            </button>
          </div>

          <div className="mn-card-monthly-budget__body">
            <ProgressRing
              value={percentage}
              size="m"
              caption="Left to Spend"
              amount={amountLeft}
              total={totalAmount}
            />
            <div className="mn-card-monthly-budget__summary">
              <SummaryItem icon={<Icon name="icon_wallet" size="m" />} amount={availableAmount} type="Available" />
              <SummaryItem icon={<Icon name="icon_track_spending" size="m" />} amount={spentAmount} type="Spent" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
