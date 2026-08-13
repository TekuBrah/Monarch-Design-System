import { ElementWrapper } from '../ElementWrapper'
import type { ElementWrapperSize } from '../ElementWrapper'
import { ICONS } from './icons'

export type IconName = keyof typeof ICONS
export type IconSize = 'xs' | 's' | 'm' | 'l' | 'xl'

export interface IconProps {
  name: IconName
  size?: IconSize
}

const SIZE_MAP: Record<IconSize, ElementWrapperSize> = {
  xs: 'xs', // 12px  --brand-scale-300 — e.g. ListItem's crypto trend triangle
  s: 's',  // 16px  --brand-scale-400
  m: 'm',  // 20px  --brand-scale-500
  l: 'l',  // 24px  --brand-scale-600
  // 32px --brand-scale-800. Exposes a step ElementWrapper already implements
  // (Figma has it too: <element> variant `Size=XL 32`, node 49:10056).
  // Required by the AI FAB, whose interior glyph is 32x32 — unreachable at 'l'.
  xl: 'xl',
}

export function Icon({ name, size = 'm' }: IconProps) {
  const SvgIcon = ICONS[name]
  return (
    <ElementWrapper size={SIZE_MAP[size]}>
      <SvgIcon width="100%" height="100%" fill="currentColor" aria-hidden="true" />
    </ElementWrapper>
  )
}
