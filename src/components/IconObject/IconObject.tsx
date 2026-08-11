import React from 'react'
import './IconObject.css'

export type IconObjectColor =
  | 'teal'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'lime'
  | 'cyan'
  | 'blue'
  | 'gray'
  | 'red'
  | 'purple'
  | 'slate'
  | 'violet'
  | 'ai'

export type IconObjectShape = 'circle' | 'square'
export type IconObjectSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'

export interface IconObjectProps {
  color?: IconObjectColor
  shape?: IconObjectShape
  size?: IconObjectSize
  children?: React.ReactNode
  ariaLabel?: string
}

export function IconObject({
  color = 'gray',
  shape = 'circle',
  size = 'xl',
  children,
  ariaLabel,
}: IconObjectProps) {
  return (
    <div
      className={[
        'mn-icon-object',
        `mn-icon-object--${color}`,
        `mn-icon-object--${shape}`,
        `mn-icon-object--${size}`,
      ].join(' ')}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}
