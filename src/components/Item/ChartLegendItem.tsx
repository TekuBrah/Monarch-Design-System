import React from 'react'
import { IconObject } from '../IconObject'
import { Icon } from '../Icon'
import './ChartLegendItem.css'

export type ChartLegendItemVariant = 'legend' | 'contribution'

export interface ChartLegendItemProps {
  /** `legend` = "Chart legend item" (semibold, optional trailing chevron).
   *  `contribution` = "Recent contributions item" (medium weight, subtle title color). */
  variant?: ChartLegendItemVariant
  icon?: React.ReactNode
  /** `contribution` only — toggles the leading icon. `legend` always shows it. */
  hasIcon?: boolean
  title: string
  subtitle?: string
  hasSubtitle?: boolean
  amount: string
  /** `legend` only — trailing chevron. */
  hasChevron?: boolean
  onClick?: () => void
  className?: string
}

export function ChartLegendItem({
  variant = 'legend',
  icon = <Icon name="question_mark" size="m" />,
  hasIcon = true,
  title,
  subtitle,
  hasSubtitle = true,
  amount,
  hasChevron = true,
  onClick,
  className,
}: ChartLegendItemProps) {
  const isLegend = variant === 'legend'
  const showIcon = isLegend || hasIcon

  const content = (
    <>
      <div className="chart-legend-item__leading-group">
        {showIcon && (
          <IconObject color="gray" size="xl">
            {icon}
          </IconObject>
        )}
        <div className="chart-legend-item__text">
          <span
            className={[
              'chart-legend-item__title',
              isLegend ? 'type-body-m-semibold' : 'type-body-m-medium',
            ].join(' ')}
          >
            {title}
          </span>
          {hasSubtitle && subtitle && (
            <span className="chart-legend-item__subtitle type-body-sm">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="chart-legend-item__trailing">
        <span
          className={[
            'chart-legend-item__amount',
            isLegend ? 'type-body-m-semibold' : 'type-body-m-medium',
          ].join(' ')}
        >
          {amount}
        </span>
        {isLegend && hasChevron && <Icon name="icon_chevron_expand_more" size="m" />}
      </div>
    </>
  )

  const classes = [
    'chart-legend-item',
    `chart-legend-item--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
