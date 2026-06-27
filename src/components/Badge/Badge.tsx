import React from 'react'

export type BadgeAppearance =
  | 'default'
  | 'primary'
  | 'inverted'
  | 'important'
  | 'added'
  | 'removed'
  | 'dark'

export type BadgeType = 'default' | 'dot'

export interface BadgeProps {
  appearance?: BadgeAppearance
  type?: BadgeType
  label?: string
}

const BG: Record<BadgeAppearance, string> = {
  default:   'var(--mapped-surface-subtle-default)',
  primary:   'var(--mapped-surface-primary-default)',
  inverted:  'var(--mapped-surface-page)',
  important: 'var(--mapped-surface-error-default)',
  added:     'var(--alias-success-100)',
  removed:   'var(--alias-error-100)',
  dark:      'var(--brand-slate-600)',
}

const COLOR: Record<BadgeAppearance, string> = {
  default:   'var(--mapped-text-default-default)',
  primary:   'var(--mapped-text-on-color-heading)',
  inverted:  'var(--mapped-text-primary-default)',
  important: 'var(--mapped-text-on-color-heading)',
  added:     'var(--mapped-text-success-default-pressed)',
  removed:   'var(--mapped-text-error-default-press)',
  dark:      'var(--mapped-text-on-color-heading)',
}

const PREFIX: Partial<Record<BadgeAppearance, string>> = {
  added:   '+',
  removed: '−',
}

export function Badge({
  appearance = 'default',
  type = 'default',
  label = '25',
}: BadgeProps) {
  if (type === 'dot') {
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: 'var(--brand-scale-300)',
          height: 'var(--brand-scale-300)',
          borderRadius: '50%',
          background: BG[appearance],
          flexShrink: 0,
        }}
      />
    )
  }

  const prefix = PREFIX[appearance]

  return (
    <span
      className="type-body-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: prefix ? 'var(--brand-scale-25)' : undefined,
        background: BG[appearance],
        color: COLOR[appearance],
        borderRadius: 'var(--brand-scale-200)',
        paddingInline: 'var(--brand-scale-200)',
        paddingBlock: '0',
        whiteSpace: 'nowrap',
      }}
    >
      {prefix && <span aria-hidden="true">{prefix}</span>}
      {label}
    </span>
  )
}
