import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import './TrendIndicator.css'

export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendIndicatorProps {
  /**
   * Required, deliberately — no default.
   *
   * A defaulted direction is the exact defect this component exists to fix:
   * `ListItem`'s crypto row drew a green up-triangle unconditionally, so a
   * decline rendered as a rise. The caller must state which way it went.
   */
  direction: TrendDirection
  /**
   * The already-formatted value, e.g. `'2.49%'`, `'-2.49%'`, `'+RM 1,568.00'`.
   *
   * This component does NOT format. Every amount in this library is a
   * pre-formatted string (`ListItem.amount`, `CardBalance.amount`,
   * `SummaryItem.amount`, `ChartLegendItem.amount`), the library has no locale
   * layer, and a trend is not always a percentage. Formatting stays with the
   * app that owns the number.
   */
  label: string
  /** Overrides the composed announcement. See the note on `announce` below. */
  ariaLabel?: string
  className?: string
}

const GLYPH: Record<TrendDirection, IconName> = {
  up: 'icon_triangle_up',
  down: 'icon_triangle_down',
  flat: 'remove',
}

const DIRECTION_WORD: Record<TrendDirection, string> = {
  up: 'Increase',
  down: 'Decrease',
  flat: 'No change',
}

/**
 * Leading `+`/`-` (and the unicode dashes a formatter might emit) removed
 * before the value goes into the announcement.
 *
 * Without this, a signed label is stated twice: the visible text `-2.49%` is
 * announced as "minus two point four nine percent", so "Decrease, -2.49%"
 * reads as "Decrease, minus …". Stripping keeps one consistent announced shape
 * — "Decrease, 2.49%" — no matter how the caller chose to format the visible
 * string. The visible label always keeps its sign.
 */
function stripLeadingSign(label: string): string {
  return label.replace(/^\s*[+\-‒–—−]\s*/, '')
}

/**
 * Directional change indicator — a glyph plus its value, coloured by direction.
 *
 * DESIGNED ADDITION, not a faithful build. Figma has no trend component and no
 * direction variant: `Item/list` (`153:1841`) ships exactly three symbols
 * (Default / Profile / Crypto), and the trend glyph inside `Type=Crypto` is a
 * swappable 12px `<element>` instance (`153:1891`). `Homepage_Crypto` expresses
 * a decline by swapping that instance to `icon_triangle down` and overriding the
 * label to `text/error/default` on that one instance — real intent, with no
 * component to carry it. `flat` goes further still and exists in no Figma source
 * at all; it is an approved addition, being added to Figma so the two don't
 * diverge.
 *
 * NOT INTERACTIVE. Figma defines no hover/pressed/focus for this, so none is
 * invented here and there is no `previewState` prop.
 */
export function TrendIndicator({
  direction,
  label,
  ariaLabel,
  className,
}: TrendIndicatorProps) {
  // Direction reaches assistive tech as a WORD. Colour and glyph shape convey
  // it visually and neither is available to a screen reader. `role="img"` makes
  // the subtree opaque, so the visible label is not announced a second time —
  // the same pattern IconObject and Field already use.
  const announced = ariaLabel ?? `${DIRECTION_WORD[direction]}, ${stripLeadingSign(label)}`

  return (
    <span
      className={['mn-trend', `mn-trend--${direction}`, className]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={announced}
    >
      <Icon name={GLYPH[direction]} size="xs" />
      <span className="mn-trend__label type-body-caption">{label}</span>
    </span>
  )
}
