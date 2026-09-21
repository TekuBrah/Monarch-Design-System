import React, { useId } from 'react'
import './InlineMessage.css'

/**
 * The tones this component offers: the two the MVP has actually needed — a
 * neutral prompt and a warning advisory. A tone colours the title with its own
 * `--mapped-text-<tone>-default`, at the value designed in Figma; this
 * component never substitutes a different colour for a tone.
 *
 * Adding a tone later widens the union, which is not a breaking change.
 */
export type InlineMessageTone = 'neutral' | 'warning'

export interface InlineMessageProps {
  /** Colours the title. Default `'neutral'`. */
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
      <p id={titleId} className="mn-inline-message__title type-body-m-semibold">
        {title}
      </p>
      {children && <div className="mn-inline-message__body type-body-sm">{children}</div>}
      {actions && <div className="mn-inline-message__actions">{actions}</div>}
    </div>
  )
}
