import './Tab.css'

export interface TabProps {
  label?: string
  isSelected?: boolean
  onClick?: () => void
  previewState?: 'hover' | 'pressed' | 'focus'
  /** Only set when a real tabpanel exists to control; omit otherwise. */
  ariaControls?: string
  id?: string
  /** Roving tabindex — managed by the Tabs container. */
  tabIndex?: number
}

export function Tab({
  label = 'Tab',
  isSelected = false,
  onClick,
  previewState,
  ariaControls,
  id,
  tabIndex,
}: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={ariaControls}
      tabIndex={tabIndex}
      className={[
        'mn-tab',
        isSelected && 'mn-tab--selected',
        previewState && `mn-tab--${previewState}`,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <span className="mn-tab__label type-body-caption-semibold">{label}</span>
    </button>
  )
}
