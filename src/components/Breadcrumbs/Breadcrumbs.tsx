import React from 'react'
import { Link } from '../Link'
import { Icon } from '../Icon'
import './Breadcrumbs.css'

export interface BreadcrumbItem {
  label: string
  href?: string
  /** Leading icon — typically only used on the first item (e.g. home) */
  icon?: React.ReactNode
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  ariaLabel?: string
}

export function Breadcrumbs({ items, ariaLabel = 'Breadcrumb' }: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className="breadcrumbs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <Link
            key={i}
            label={item.label}
            href={item.href}
            appearance="subtle"
            size="S"
            isCurrent={isLast}
            iconBefore={item.icon ?? null}
            iconAfter={isLast ? null : <Icon name="chevron_right" size="s" />}
          />
        )
      })}
    </nav>
  )
}
