import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import './FieldMessage.css'

export type FieldMessageTone = 'error' | 'helper'

export interface FieldMessageProps {
  /** `error` mirrors Figma `<Error message>` (279:4741); `helper` mirrors
   *  `<Helper message>` (279:4770). */
  tone: FieldMessageTone
  /** The message text. */
  children: ReactNode
  /** Passed through to the root so a control can point `aria-describedby` at
   *  it. `FormField` supplies one; a standalone message needs its own. */
  id?: string
}

/* Figma draws the glyph at 16px inside an `<element>` Size=S, which is what
   Icon size="s" renders (ElementWrapper `s`, 16px). The glyph's <svg> is
   already aria-hidden, so it is never announced.

   No `role` and no `aria-live`, deliberately. The message is announced
   through the control's `aria-describedby`, so a live region would announce
   it a second time, and `role="alert"` would interrupt on every render.

   Not built: Figma's hidden `*` text and hidden trailing `<element>` (both
   `visible: false` in both components, and never shown in any instance). */
const GLYPH = { error: 'error', helper: 'help_outline' } as const
const TEXT_CLASS = { error: 'type-body-caption-semibold', helper: 'type-body-caption' } as const

export function FieldMessage({ tone, children, id }: FieldMessageProps) {
  return (
    <div id={id} className={`mn-field-message mn-field-message--${tone}`}>
      <Icon name={GLYPH[tone]} size="s" />
      <span className={`mn-field-message__text ${TEXT_CLASS[tone]}`}>{children}</span>
    </div>
  )
}
