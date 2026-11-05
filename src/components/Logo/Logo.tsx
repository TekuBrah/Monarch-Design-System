import './Logo.css'
import { LOGO_MAP } from './logos'
import type { LogoName, LogoCategory } from './logos'

export type { LogoName, LogoCategory }
/** `xs` 14px, `s` 32px, `m` 40px, `l` 56px tall.
 *  `fill` (Gate 97, G61) is a HEIGHT fill: the logo takes 100% of its
 *  container's height and keeps its aspect ratio, so a sized slot such as
 *  `<ElementWrapper size="m">` (20px) decides how tall it renders. It is
 *  unrelated to the `sizing?: 'fixed' | 'fill'` prop other components carry,
 *  which releases a WIDTH. */
export type LogoSize = 'xs' | 's' | 'm' | 'l' | 'fill'

export interface LogoProps {
  name: LogoName
  /** See `LogoSize`. `fill` is a height fill, not `sizing`'s width fill. */
  size?: LogoSize
}

export function Logo({ name, size = 'm' }: LogoProps) {
  const entry = LOGO_MAP[name]
  if (!entry) return null
  const { Component } = entry
  return (
    <span className={`mn-logo mn-logo--${size}`}>
      <Component />
    </span>
  )
}
