import React from 'react'
import './Avatar.css'
import { Icon } from '../Icon'

export type AvatarSize = 's' | 'm' | 'l'

export interface AvatarProps {
  size?: AvatarSize
  src?: string
  name?: string
  initials?: string
  alt?: string
}

const TYPE_CLASS: Record<AvatarSize, string> = {
  s: 'type-body-caption-semibold',
  m: 'type-body-sm-semibold',
  l: 'type-body-m-semibold',
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

export function Avatar({ size = 'm', src, name, initials, alt }: AvatarProps) {
  const sizeClass = `avatar--${size}`

  if (src) {
    return (
      <div className={`avatar avatar--photo ${sizeClass}`}>
        <img src={src} alt={alt ?? name ?? ''} />
      </div>
    )
  }

  const label = initials ?? (name ? deriveInitials(name) : null)

  if (label) {
    return (
      <div className={`avatar avatar--initials ${sizeClass}`}>
        <span className={`avatar__label ${TYPE_CLASS[size]}`}>{label}</span>
      </div>
    )
  }

  return (
    <div className={`avatar avatar--placeholder ${sizeClass}`}>
      <Icon name="person" size={size} />
    </div>
  )
}
