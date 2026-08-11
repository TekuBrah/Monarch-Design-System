import React from 'react'
import './ElementWrapper.css'

export type ElementWrapperSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'

export interface ElementWrapperProps {
  size?: ElementWrapperSize
  children?: React.ReactNode
}

export function ElementWrapper({ size = 'l', children }: ElementWrapperProps) {
  return (
    <span className={`mn-element-wrapper mn-element-wrapper--${size}`}>{children}</span>
  )
}
