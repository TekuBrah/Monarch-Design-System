import React, { useId } from 'react'
import './InlineMessage.css'
import { Icon } from '../Icon'
import type { IconName } from '../Icon/Icon'

/**
 * The tones this component offers: the two the MVP has actually needed — a
 * neutral prompt and a warning advisory.
 *
 * TONE NEVER CHANGES TEXT COLOUR (Gate 62b). Title and body take the same text
 * tokens in every tone. A tone is carried by the CONTAINER and a leading GLYPH:
 * the framed border and the icon take the tone's own `--mapped-border-*` /
 * `--mapped-icon-*` tokens. Gate 62 coloured the warning title with
 * `--mapped-text-warning-default` instead, which measured 2.22:1 in light — no
 * Figma design asked for orange text, and the review thread ruled it out.
 *
 * Adding a tone later widens the union, which is not a breaking change.
 */
export type InlineMessageTone = 'neutral' | 'warning'

/* The leading glyph per tone. Neutral has none: it is the resting message and
   renders exactly as it did at Gate 62. `warning` is the registry glyph
   `Toast` already uses for its warning appearance. */
const TONE_ICON: Partial<Record<InlineMessageTone, IconName>> = {
  warning: 'warning',
}

export interface InlineMessageProps {
  /** Sets the frame's border and the leading glyph — never the text colour.
   *  Default `'neutral'` (no glyph). */
  tone?: InlineMessageTone
  /** The one-line statement — a string, so it can name the group. */
  title: string
  /** The body — an app-provided slot, same as `Toast`'s description, so it can
   *  carry inline markup such as a `Link`. */
  children?: React.ReactNode
  /** Action region below the body — app composes real `Button`s. Omit it and
   *  the region is not rendered. */
  actions?: React.ReactNode
  /** Paints the message's own surface, border and radius. Default true. Set
   *  false inside a container that already paints that surface, where a framed
   *  box would be a card drawn on an identical ground. */
  isFramed?: boolean
  id?: string
  className?: string
}

/**
 * An inline message: a title, a body and optional actions, in the page flow.
 *
 * NON-BLOCKING BY CONSTRUCTION, and the tests hold it there. It never takes
 * focus, carries no dialog semantics, and hides or inerts nothing around it —
 * whatever surrounds it stays exactly as operable as before it rendered.
 *
 * NO LIVE REGION. It is static content that is usually present when the page
 * renders, and a live region would announce it as though it had just changed.
 * A consumer inserting one in response to an event wraps it in its own
 * `role="status"` container; `Toast` is the component for transient news.
 */
export function InlineMessage({
  tone = 'neutral',
  title,
  children,
  actions,
  isFramed = true,
  id,
  className,
}: InlineMessageProps) {
  const autoId = useId()
  const titleId = `${id ?? autoId}-title`
  const toneIcon = TONE_ICON[tone]

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={titleId}
      className={[
        'mn-inline-message',
        `mn-inline-message--${tone}`,
        isFramed && 'mn-inline-message--framed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Decorative: the glyph repeats what the title's words already say, so
          it is hidden from assistive tech (Icon marks its <svg> aria-hidden)
          and the group's name stays the title alone. Rendered in BOTH isFramed
          states — unframed, it is the only non-text tone signal there is. */}
      {toneIcon && (
        <span className="mn-inline-message__icon">
          <Icon name={toneIcon} size="m" />
        </span>
      )}
      <p id={titleId} className="mn-inline-message__title type-body-m-semibold">
        {title}
      </p>
      {children && <div className="mn-inline-message__body type-body-sm">{children}</div>}
      {actions && <div className="mn-inline-message__actions">{actions}</div>}
    </div>
  )
}
