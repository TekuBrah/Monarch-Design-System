import React from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import './BottomNavigation.css'

export interface BottomNavItem {
  id: string
  icon: IconName
  label: string
  isSelected?: boolean
}

export interface BottomNavigationProps {
  items: BottomNavItem[]
  onSelect?: (id: string) => void
  className?: string
}

export function BottomNavigation({ items, onSelect, className }: BottomNavigationProps) {
  return (
    <div className={['bottom-nav', className].filter(Boolean).join(' ')}>
      <nav className="bottom-nav__bar" aria-label="Primary">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className={[
              'bottom-nav__item',
              item.isSelected && 'bottom-nav__item--selected',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={item.isSelected ? 'page' : undefined}
            onClick={() => onSelect?.(item.id)}
          >
            <Icon name={item.icon} size="l" />
            <span
              className={[
                'bottom-nav__label',
                item.isSelected ? 'type-body-caption-semibold' : 'type-body-caption',
              ].join(' ')}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="bottom-nav__home-indicator" aria-hidden="true" />
    </div>
  )
}
