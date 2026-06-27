import React from 'react'
import { ElementWrapper } from '../ElementWrapper'
import type { ElementWrapperSize } from '../ElementWrapper'
import { ICONS } from './icons'

export type IconName = keyof typeof ICONS
export type IconSize = 's' | 'm' | 'l'

export interface IconProps {
  name: IconName
  size?: IconSize
}

const SIZE_MAP: Record<IconSize, ElementWrapperSize> = {
  s: 's',  // 16px  --brand-scale-400
  m: 'm',  // 20px  --brand-scale-500
  l: 'l',  // 24px  --brand-scale-600
}

export function Icon({ name, size = 'm' }: IconProps) {
  const SvgIcon = ICONS[name]
  return (
    <ElementWrapper size={SIZE_MAP[size]}>
      <SvgIcon width="100%" height="100%" fill="currentColor" aria-hidden="true" />
    </ElementWrapper>
  )
}
