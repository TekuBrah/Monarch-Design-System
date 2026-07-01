import React from 'react'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Icon } from '../Icon'
import './ButtonGroup.css'

export interface ButtonGroupItem {
  label: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}

export interface ButtonGroupProps {
  buttons: ButtonGroupItem[]
  onMoreClick?: React.MouseEventHandler<HTMLButtonElement>
  moreAriaLabel?: string
}

export function ButtonGroup({ buttons, onMoreClick, moreAriaLabel = 'More actions' }: ButtonGroupProps) {
  return (
    <div className="button-group">
      <IconButton
        variant="tertiary"
        size="m"
        icon={<Icon name="more_horiz" size="l" />}
        ariaLabel={moreAriaLabel}
        onClick={onMoreClick}
      />
      {buttons.map((b, i) => (
        <Button
          key={i}
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
