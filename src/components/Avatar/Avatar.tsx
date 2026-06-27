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

const SIZE_TOKEN: Record<AvatarSize, string> = {
  s: 'var(--brand-scale-600)',   // 24px
  m: 'var(--brand-scale-800)',   // 32px
  l: 'var(--brand-scale-1000)', // 40px
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
  const dim = SIZE_TOKEN[size]
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: dim,
    height: dim,
    borderRadius: '50%',
    overflow: 'hidden',
  }

  if (src) {
    return (
      <div className="avatar avatar--photo" style={base}>
        <img
          src={src}
          alt={alt ?? name ?? ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    )
  }

  const label = initials ?? (name ? deriveInitials(name) : null)

  if (label) {
    return (
      <div
        className="avatar avatar--initials"
        style={{
          ...base,
          background: 'var(--mapped-surface-primary-default-subtle)',
          border: 'var(--brand-scale-25) solid var(--mapped-border-subtlest-default)',
        }}
      >
        <span
          className={TYPE_CLASS[size]}
          style={{ color: 'var(--mapped-text-subtle-default)', lineHeight: 1 }}
        >
          {label}
        </span>
      </div>
    )
  }

  return (
    <div
      className="avatar avatar--placeholder"
      style={{
        ...base,
        background: 'var(--mapped-surface-default-default)',
      }}
    >
      <Icon name="person" size={size} />
    </div>
  )
}
