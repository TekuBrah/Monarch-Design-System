import React from 'react'
import { Icon } from '../Icon'
import './CardSmartInsights.css'

export interface CardSmartInsightsProps {
  icon?: React.ReactNode
  title: string
  /** CSS color (e.g. `var(--brand-cyan-500)`) — varies per instance/category in Figma's own examples. */
  titleColor?: string
  description: string
  linkLabel?: string
  onLinkClick?: () => void
  className?: string
}

export function CardSmartInsights({
  icon,
  title,
  titleColor,
  description,
  linkLabel = 'View',
  onLinkClick,
  className,
}: CardSmartInsightsProps) {
  return (
    <div className={['card-smart-insights', className].filter(Boolean).join(' ')}>
      <span className="card-smart-insights__title type-body-m-semibold" style={titleColor ? { color: titleColor } : undefined}>
        {title}
      </span>
      <p className="card-smart-insights__description type-body-caption">{description}</p>
      <div className="card-smart-insights__footer">
        {icon && <span className="card-smart-insights__icon">{icon}</span>}
        <button type="button" className="card-smart-insights__link type-body-sm" onClick={onLinkClick}>
          {linkLabel}
          <Icon name="chevron_right" size="s" />
        </button>
      </div>
    </div>
  )
}
