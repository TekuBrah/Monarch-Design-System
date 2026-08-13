import React from 'react'
import { Icon } from '../Icon'
import './Link.css'

export type LinkAppearance = 'default' | 'subtle' | 'inverse'
export type LinkSize = 's' | 'm'
export type LinkWeight = 'regular' | 'semibold'

const DEFAULT_ICON = <Icon name="open_in_new" size="s" />

/* size × weight → typography class.
   `s` carries both weights: Figma's section-header "See all" binds the
   body/sm-semibold composite (600/14) — verified on casestudy_02 nodes
   1307:19423, 1344:9703 and 1344:9793 — while the plain 14px link is
   body/sm (400/14).
   `m` is weight-invariant BY SOURCE, not by omission: Figma models the 12px
   link only as body/caption (400/12), verified on node 1344:9986. There is no
   semibold caption link to map, so both weights resolve to the same class.
   Note `s` (14px) renders LARGER than `m` (12px) — a naming inversion in the
   source that is preserved deliberately; the mapping itself is correct. */
const TYPE_CLASS: Record<LinkSize, Record<LinkWeight, string>> = {
  s: { regular: 'type-body-sm', semibold: 'type-body-sm-semibold' },
  m: { regular: 'type-body-caption', semibold: 'type-body-caption' },
}

export interface LinkProps {
  label?: string
  href?: string
  appearance?: LinkAppearance
  size?: LinkSize
  /** `semibold` only differs at size `s` — see TYPE_CLASS. */
  weight?: LinkWeight
  hasVisited?: boolean
  isCurrent?: boolean
  iconBefore?: React.ReactNode
  iconAfter?: React.ReactNode
  target?: '_blank' | '_self'
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

export function Link({
  label = 'Link',
  href = '#',
  appearance = 'default',
  size = 's',
  weight = 'regular',
  hasVisited = false,
  isCurrent = false,
  iconBefore = DEFAULT_ICON,
  iconAfter = DEFAULT_ICON,
  target = '_blank',
  onClick,
  previewState,
}: LinkProps) {
  const typeClass = TYPE_CLASS[size][weight]

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      aria-current={isCurrent ? 'page' : undefined}
      data-preview={previewState}
      className={[
        'mn-link',
        `mn-link--${appearance}`,
        hasVisited && 'mn-link--visited',
        isCurrent && 'mn-link--current',
      ].filter(Boolean).join(' ')}
    >
      {iconBefore && <span className="mn-link__icon">{iconBefore}</span>}
      <span className={typeClass}>{label}</span>
      {iconAfter && <span className="mn-link__icon">{iconAfter}</span>}
    </a>
  )
}
