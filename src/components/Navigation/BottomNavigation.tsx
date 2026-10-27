import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import './BottomNavigation.css'

export interface BottomNavItem {
  id: string
  icon: IconName
  label: string
  isSelected?: boolean
  /** 'fixed' (default) keeps the 64px item (Figma's 62, rounded to the ramp).
      'hug' sizes the item to its label plus its own padding, with no floor and
      no ceiling: Figma's case study widens one item this way, by instance
      override, and binds no min or max width. Per item, as Figma models it.
      No effect inside a `barWidth="fill"` bar, where fill sizes every item. */
  width?: 'fixed' | 'hug'
}

export interface BottomNavigationProps {
  items: BottomNavItem[]
  onSelect?: (id: string) => void
  className?: string
  /** 'hug' (default) keeps today's content-width pill. 'fill' stretches the
      bar to the container width, letting the consumer own the gutter.
      `className` lands on the root, which is why the bar needs its own prop. */
  barWidth?: 'hug' | 'fill'
}

export function BottomNavigation({
  items,
  onSelect,
  className,
  barWidth = 'hug',
}: BottomNavigationProps) {
  return (
    <div className={['mn-bottom-nav', className].filter(Boolean).join(' ')}>
      <nav
        className={[
          'mn-bottom-nav__bar',
          barWidth === 'fill' && 'mn-bottom-nav__bar--fill',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Primary"
      >
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            className={[
              'mn-bottom-nav__item',
              item.isSelected && 'mn-bottom-nav__item--selected',
              item.width === 'hug' && barWidth !== 'fill' && 'mn-bottom-nav__item--hug',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={item.isSelected ? 'page' : undefined}
            onClick={() => onSelect?.(item.id)}
          >
            <Icon name={item.icon} size="l" />
            <span
              className={[
                'mn-bottom-nav__label',
                item.isSelected ? 'type-body-caption-semibold' : 'type-body-caption',
              ].join(' ')}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="mn-bottom-nav__home-indicator" aria-hidden="true" />
    </div>
  )
}
