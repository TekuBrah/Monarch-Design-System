import React from 'react'
import { Icon } from '../Icon'
import './FilterChip.css'

export interface FilterChipProps {
  /** The facet this chip summarises. Required — it is also the source of the
   *  dismiss button's accessible name. */
  label: string
  /** Leading glyph (Figma `Icon_left`). A real slot, not a boolean behind one
   *  hard-coded icon. Decorative: it is aria-hidden, so the chip's accessible
   *  content stays the label. */
  icon?: React.ReactNode
  /** When supplied, the chip renders a real trailing dismiss BUTTON (Figma
   *  `Icon_right`). Omitted, the chip has no dismiss affordance and no
   *  interactive descendant at all — which is Figma's `Icon_right=False`. */
  onDismiss?: () => void
  /** Overrides the dismiss button's accessible name. Defaults to
   *  `Remove <label>`. */
  dismissLabel?: string
  /** Swappable dismiss glyph, same shape as `Chips.icon`. Defaults to the
   *  12x12 close mark Figma draws. */
  dismissIcon?: React.ReactNode
  className?: string
}

/**
 * FilterChip — summarises a filter currently in force; dismissed to clear that
 * facet. Figma component set `filter/chips` (228:1296), 4 variants across
 * Icon_left x Icon_right.
 *
 * The ROOT IS NOT INTERACTIVE, deliberately. The only action the source models
 * is dismissal, and making the root a button too would nest one button inside
 * another — an accessibility violation that jest-axe fails. Consumers that want
 * a clickable filter summary want ToggleChip.
 */
export function FilterChip({
  label,
  icon,
  onDismiss,
  dismissLabel,
  dismissIcon = <Icon name="close" size="xs" />,
  className,
}: FilterChipProps) {
  return (
    <span
      className={['mn-filter-chip', className].filter(Boolean).join(' ')}
      data-icon-left={!!icon}
      data-icon-right={!!onDismiss}
    >
      {icon && (
        <span className="mn-filter-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="mn-filter-chip__label type-body-caption-semibold">{label}</span>
      {onDismiss && (
        <button
          type="button"
          className="mn-filter-chip__dismiss"
          aria-label={dismissLabel ?? `Remove ${label}`}
          onClick={onDismiss}
        >
          {dismissIcon}
        </button>
      )}
    </span>
  )
}
