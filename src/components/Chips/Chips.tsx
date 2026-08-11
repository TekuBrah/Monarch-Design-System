import React from 'react'
import { Icon } from '../Icon'
import './Chips.css'

export type ChipsAppearance = 'default' | 'inprogress' | 'moved' | 'new' | 'removed' | 'success'

export interface ChipsProps {
  label?: string
  appearance?: ChipsAppearance
  isBold?: boolean
  /** Leading glyph. A real slot, not a boolean behind one hard-coded icon —
   *  the `done` checkmark was previously unconditional, so a `removed` chip
   *  still showed a tick. Defaults to that checkmark so no existing call site
   *  changes; pass `null` for no glyph at all. */
  icon?: React.ReactNode
}

export function Chips({
  label = 'LABEL',
  appearance = 'default',
  isBold = false,
  icon = <Icon name="done" size="s" />,
}: ChipsProps) {
  return (
    <div className={`mn-chips mn-chips--${appearance} ${isBold ? 'mn-chips--bold' : 'mn-chips--subtle'}`}>
      {icon}
      <span className="type-body-caption-semibold">{label}</span>
    </div>
  )
}
