import React from 'react'
import { LOGO_MAP } from './logos'
import type { LogoName, LogoCategory } from './logos'

export type { LogoName, LogoCategory }
export type LogoSize = 's' | 'm' | 'l'

export interface LogoProps {
  name: LogoName
  size?: LogoSize
}

// Height-only sizing — logos keep their natural aspect ratio.
// Width is auto so each logo renders at its native proportions.
const HEIGHT_TOKEN: Record<LogoSize, string> = {
  s: 'var(--brand-scale-800)',   // 32px
  m: 'var(--brand-scale-1000)', // 40px
  l: 'var(--brand-scale-1200)', // 56px
}

export function Logo({ name, size = 'm' }: LogoProps) {
  const entry = LOGO_MAP[name]
  if (!entry) return null
  const { Component } = entry
  const h = HEIGHT_TOKEN[size]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, height: h }}>
      <Component style={{ height: '100%', width: 'auto', display: 'block' }} />
    </span>
  )
}
