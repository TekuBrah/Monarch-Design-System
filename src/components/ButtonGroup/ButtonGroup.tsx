import React from 'react'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Icon } from '../Icon'
import './ButtonGroup.css'

export interface ButtonGroupItem {
  label: string
  /** Stable identity for React keys; falls back to label+index if omitted. */
  id?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

export interface ButtonGroupProps {
  buttons: ButtonGroupItem[]
  onMoreClick?: React.MouseEventHandler<HTMLButtonElement>
  moreAriaLabel?: string
  /** Accessible name for the group (role="group"). */
  ariaLabel?: string
}

export function ButtonGroup({ buttons, onMoreClick, moreAriaLabel = 'More actions', ariaLabel = 'Button group' }: ButtonGroupProps) {
  return (
    <div className="button-group" role="group" aria-label={ariaLabel}>
      <IconButton
        variant="tertiary"
        size="m"
        icon={<Icon name="more_horiz" size="l" />}
        ariaLabel={moreAriaLabel}
        onClick={onMoreClick}
      />
      {buttons.map((b, i) => (
        <Button
          key={b.id ?? `${b.label}-${i}`}
          variant="primary"
          size="m"
          label={b.label}
          onClick={b.onClick}
          disabled={b.disabled}
        />
      ))}
    </div>
  )
}
