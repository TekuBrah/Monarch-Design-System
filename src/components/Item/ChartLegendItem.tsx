import React from 'react'
import { IconObject } from '../IconObject'
import type { IconObjectColor } from '../IconObject'
import { Icon } from '../Icon'
import './ChartLegendItem.css'

export type ChartLegendItemVariant = 'legend' | 'contribution'

export interface ChartLegendItemProps {
  /** `legend` = "Chart legend item" (semibold, optional trailing chevron).
   *  `contribution` = "Recent contributions item" (medium weight, subtle title color). */
  variant?: ChartLegendItemVariant
  icon?: React.ReactNode
  /**
   * Colour of the leading `IconObject` badge — the SERIES colour when this row
   * is used as a chart legend.
   *
   * Added Phase 5.4. Before this, the badge was hardcoded `color="gray"`, which
   * is why the component could never actually be a chart legend despite its
   * name: it had no way to show which series a row belonged to. Figma pairs
   * these rows with the budget donut and assigns one hue per category
   * (`red`/`purple`/`blue`/`cyan`/`lime`/`yellow`/`orange`), so the swatch has
   * to be expressible.
   *
   * Defaults to `'gray'` — the previous hardcoded value — so every existing
   * call site is unchanged.
   */
  iconColor?: IconObjectColor
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
  iconColor = 'gray',
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
      <div className="mn-chart-legend-item__leading-group">
        {showIcon && (
          <IconObject color={iconColor} size="xl">
            {icon}
          </IconObject>
        )}
        <div className="mn-chart-legend-item__text">
          <span
            className={[
              'mn-chart-legend-item__title',
              isLegend ? 'type-body-m-semibold' : 'type-body-m-medium',
            ].join(' ')}
          >
            {title}
          </span>
          {hasSubtitle && subtitle && (
            <span className="mn-chart-legend-item__subtitle type-body-sm">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="mn-chart-legend-item__trailing">
        <span
          className={[
            'mn-chart-legend-item__amount',
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
    'mn-chart-legend-item',
    `mn-chart-legend-item--${variant}`,
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
