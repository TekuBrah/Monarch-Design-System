import './Badge.css'

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
        className={`mn-badge--dot mn-badge--${appearance}`}
      />
    )
  }

  const prefix = PREFIX[appearance]

  const classes = [
    'mn-badge',
    `mn-badge--${appearance}`,
    prefix && 'mn-badge--with-prefix',
    'type-body-sm',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      {label}
    </span>
  )
}
