import { Icon } from '../Icon'
import './Chips.css'

export type ChipsAppearance = 'default' | 'inprogress' | 'moved' | 'new' | 'removed' | 'success'

export interface ChipsProps {
  label?: string
  appearance?: ChipsAppearance
  isBold?: boolean
}

export function Chips({ label = 'LABEL', appearance = 'default', isBold = false }: ChipsProps) {
  return (
    <div className={`mn-chips mn-chips--${appearance} ${isBold ? 'mn-chips--bold' : 'mn-chips--subtle'}`}>
      <Icon name="done" size="s" />
      <span className="type-body-caption-semibold">{label}</span>
    </div>
  )
}
