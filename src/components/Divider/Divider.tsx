import React from 'react'
import './Divider.css'

export type DividerWeight = 1 | 2
export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps {
  weight?: DividerWeight
  orientation?: DividerOrientation
}

export function Divider({ weight = 1, orientation = 'horizontal' }: DividerProps) {
  return (
    <div
      className={`divider divider--${orientation} divider--w${weight}`}
      role="separator"
      aria-orientation={orientation}
    />
  )
}
