import React from 'react'
import './Logo.css'
import { LOGO_MAP } from './logos'
import type { LogoName, LogoCategory } from './logos'

export type { LogoName, LogoCategory }
export type LogoSize = 'xs' | 's' | 'm' | 'l'

export interface LogoProps {
  name: LogoName
  size?: LogoSize
}

export function Logo({ name, size = 'm' }: LogoProps) {
  const entry = LOGO_MAP[name]
  if (!entry) return null
  const { Component } = entry
  return (
    <span className={`logo logo--${size}`}>
      <Component />
    </span>
  )
}
