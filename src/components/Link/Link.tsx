import React from 'react'
import { Icon } from '../Icon'
import './Link.css'

export type LinkAppearance = 'default' | 'subtle' | 'inverse'
export type LinkSize = 'S' | 'M'

export interface LinkProps {
  label?: string
  href?: string
  appearance?: LinkAppearance
  size?: LinkSize
  hasVisited?: boolean
  iconBefore?: boolean
  iconAfter?: boolean
  target?: '_blank' | '_self'
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

export function Link({
  label = 'Link',
  href = '#',
  appearance = 'default',
  size = 'S',
  hasVisited = false,
  iconBefore = true,
  iconAfter = true,
  target = '_blank',
  onClick,
  previewState,
}: LinkProps) {
  const typeClass = size === 'S' ? 'type-body-sm' : 'type-body-caption'

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      data-preview={previewState}
      className={[
        'link',
        `link--${appearance}`,
        hasVisited && 'link--visited',
      ].filter(Boolean).join(' ')}
    >
      {iconBefore && (
        <span className="link__icon">
          <Icon name="open_in_new" size="s" />
        </span>
      )}
      <span className={typeClass}>{label}</span>
      {iconAfter && (
        <span className="link__icon">
          <Icon name="open_in_new" size="s" />
        </span>
      )}
    </a>
  )
}
