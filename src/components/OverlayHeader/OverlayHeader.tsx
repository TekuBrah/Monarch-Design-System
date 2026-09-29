import React from 'react'
import './OverlayHeader.css'
import { Icon } from '../Icon'

/* OverlayHeader — Figma component set `<header>` 249:177 (Monarch design
   system), six variants across `Header` / `Icon right` / `Icon left`.

   ONE header for both overlays (R1, Teku 29 Sept 2026). `Modal` and `Sheet`
   both render this; `Sheet`'s own left-aligned header is retired.

   Measured from 249:177, not assumed — every variant is 375 x 64 with the
   icons 24 x 24 at x=16 and x=335 (right edge 359 = 375 - 16) and y=24, i.e.
   padding 24 top / 16 bottom / 16 sides. The title frame sits at x=149.5 and
   is 76 wide in EVERY variant, so its centre is 187.5 = 375 / 2 exactly —
   including the two single-icon variants. Figma holds the centre with a
   dedicated empty frame (`Frame 446`, 24 x 24) on whichever side has no icon:
   815:8290 carries one at x=335, 249:178 carries one at x=16. R2's empty slot
   is therefore the source's own mechanism, not an invention. */

export interface OverlayHeaderProps {
  /** Centred title. Figma models this as the `{Header}` text prop. */
  title?: string
  /** `id` for the rendered `<h2>`, so a dialog can point `aria-labelledby` at
   *  it. No title means no `<h2>`, so a consumer must not reference this id
   *  unconditionally — a dangling reference is an accessibility defect. */
  titleId?: string
  /** Node centred WITH the title, immediately before it — the pair centres as
   *  one unit. This is `Modal`'s `headerIconLeft`, which has always sat inside
   *  the centred cell rather than in the leading slot. */
  titleLeading?: React.ReactNode
  /** Leading (left) slot content, rendered after the built-in back control.
   *  This is `Sheet`'s `headerIconLeft`. */
  leading?: React.ReactNode
  /** Trailing (right) slot content, rendered BEFORE the built-in close
   *  control — the position `Sheet`'s `headerAction` has always held. */
  trailing?: React.ReactNode
  /** Renders the built-in back control in the leading slot. */
  onBack?: () => void
  /** Accessible name for the back control. */
  backLabel?: string
  /** Renders the built-in close control in the trailing slot. */
  onClose?: () => void
  /** Accessible name for the close control. */
  closeLabel?: string
  id?: string
  className?: string
}

export function OverlayHeader({
  title,
  titleId,
  titleLeading,
  leading,
  trailing,
  onBack,
  backLabel = 'Back',
  onClose,
  closeLabel = 'Close',
  id,
  className,
}: OverlayHeaderProps) {
  // R2 — both side slots ALWAYS render, at the control's full footprint. An
  // empty one is inert: `aria-hidden`, no focusable descendant, no accessible
  // name. Only its presence is keyed to content, never its width; the width
  // lives in CSS as a fixed track, so centring cannot depend on this boolean.
  const hasLeading = Boolean(onBack || leading)
  const hasTrailing = Boolean(onClose || trailing)

  return (
    <div id={id} className={['mn-overlay-header', className].filter(Boolean).join(' ')}>
      <div
        className="mn-overlay-header__side mn-overlay-header__side--start"
        aria-hidden={hasLeading ? undefined : true}
      >
        {onBack && (
          <button
            type="button"
            className="mn-overlay-header__control"
            aria-label={backLabel}
            onClick={onBack}
          >
            <Icon name="arrow_back" size="l" />
          </button>
        )}
        {leading}
      </div>

      <div className="mn-overlay-header__title-group">
        {titleLeading}
        {title && (
          <h2 id={titleId} className="mn-overlay-header__title type-body-m-semibold">
            {title}
          </h2>
        )}
      </div>

      <div
        className="mn-overlay-header__side mn-overlay-header__side--end"
        aria-hidden={hasTrailing ? undefined : true}
      >
        {trailing}
        {onClose && (
          <button
            type="button"
            className="mn-overlay-header__control"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <Icon name="close" size="l" />
          </button>
        )}
      </div>
    </div>
  )
}
