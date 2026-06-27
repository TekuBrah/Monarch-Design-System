import React from 'react'

export type ElementWrapperSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl'

export interface ElementWrapperProps {
  size?: ElementWrapperSize
  children?: React.ReactNode
}

const SIZE_TOKEN: Record<ElementWrapperSize, string> = {
  xs:   'var(--brand-scale-300)',  // 12px
  s:    'var(--brand-scale-400)',  // 16px
  m:    'var(--brand-scale-500)',  // 20px
  l:    'var(--brand-scale-600)',  // 24px
  xl:   'var(--brand-scale-800)',  // 32px
  xxl:  'var(--brand-scale-1000)', // 40px
  xxxl: 'var(--brand-scale-1200)', // 56px
}

export function ElementWrapper({ size = 'l', children }: ElementWrapperProps) {
  const dim = SIZE_TOKEN[size]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  )
}
