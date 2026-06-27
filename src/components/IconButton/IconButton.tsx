import React from 'react'
import '../Button/Button.css'
import './IconButton.css'
import { ElementWrapper } from '../ElementWrapper'
import type { ButtonVariant, ButtonAppearance } from '../Button'

export type { ButtonVariant as IconButtonVariant, ButtonAppearance as IconButtonAppearance }
export type IconButtonSize = 's' | 'm' | 'l'

export interface IconButtonProps {
  variant?: ButtonVariant
  appearance?: ButtonAppearance
  size?: IconButtonSize
  icon?: React.ReactNode
  ariaLabel?: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Showcase only — forces a visual state without interaction */
  previewState?: 'hover' | 'pressed' | 'focus'
}

type TokenSet = {
  bg: string; bgHover: string; bgPressed: string; bgDisabled: string
  border: string; borderHover: string; borderPressed: string; borderDisabled: string
  text: string; textHover: string; textPressed: string; textDisabled: string
  focusRing: string
}

const v = (t: string) => `var(${t})`

// Token matrix is identical to Button — same surface/border/text tokens per variant × appearance × state
const TOKENS: Record<ButtonVariant, Record<ButtonAppearance, TokenSet>> = {
  primary: {
    default: {
      bg:             v('--mapped-surface-primary-default'),
      bgHover:        v('--mapped-surface-primary-default-hover'),
      bgPressed:      v('--mapped-surface-primary-default-pressed'),
      bgDisabled:     v('--mapped-surface-disabled-default'),
      border:         v('--mapped-border-primary-default'),
      borderHover:    v('--mapped-border-primary-default-hover'),
      borderPressed:  v('--mapped-border-primary-default-pressed'),
      borderDisabled: v('--mapped-border-disabled-default'),
      text:           v('--mapped-text-primary-on-color'),
      textHover:      v('--mapped-text-primary-on-color-hover'),
      textPressed:    v('--mapped-text-primary-on-color-pressed'),
      textDisabled:   v('--mapped-text-disabled-on-color'),
      focusRing:      v('--mapped-border-primary-default'),
    },
    inverse: {
      bg:             v('--mapped-surface-interactive-on-color'),
      bgHover:        v('--mapped-surface-interactive-on-color-hover'),
      bgPressed:      v('--mapped-surface-interactive-on-color-pressed'),
      bgDisabled:     v('--mapped-surface-disabled-default'),
      border:         v('--mapped-surface-interactive-on-color'),
      borderHover:    v('--mapped-surface-interactive-on-color-hover'),
      borderPressed:  v('--mapped-surface-interactive-on-color-pressed'),
      borderDisabled: v('--mapped-border-disabled-default'),
      text:           v('--mapped-text-primary-default'),
      textHover:      v('--mapped-text-primary-default-hover'),
      textPressed:    v('--mapped-text-primary-default-pressed'),
      textDisabled:   v('--mapped-text-disabled-default'),
      focusRing:      v('--mapped-border-interactive-on-color'),
    },
  },
  secondary: {
    default: {
      bg:             v('--mapped-surface-primary-default-subtle'),
      bgHover:        v('--mapped-surface-primary-default-subtle-hover'),
      bgPressed:      v('--mapped-surface-primary-default-subtle-pressed'),
      bgDisabled:     v('--mapped-surface-disabled-default'),
      border:         v('--mapped-border-primary-default'),
      borderHover:    v('--mapped-border-primary-default-hover'),
      borderPressed:  v('--mapped-border-primary-default-pressed'),
      borderDisabled: v('--mapped-border-disabled-default'),
      text:           v('--mapped-text-primary-default'),
      textHover:      v('--mapped-text-primary-default-hover'),
      textPressed:    v('--mapped-text-primary-default-pressed'),
      textDisabled:   v('--mapped-text-disabled-default'),
      focusRing:      v('--mapped-border-primary-default'),
    },
    inverse: {
      bg:             'transparent',
      bgHover:        v('--mapped-surface-interactive-on-color-hover'),
      bgPressed:      v('--mapped-surface-interactive-on-color-pressed'),
      bgDisabled:     v('--mapped-surface-disabled-default'),
      border:         v('--mapped-border-interactive-on-color'),
      borderHover:    v('--mapped-border-interactive-on-color-hover'),
      borderPressed:  v('--mapped-border-interactive-on-color-pressed'),
      borderDisabled: v('--mapped-border-disabled-default'),
      text:           v('--mapped-text-on-color-label'),
      textHover:      v('--mapped-text-on-color-label-hover'),
      textPressed:    v('--mapped-text-on-color-label-pressed'),
      textDisabled:   v('--mapped-text-disabled-on-color'),
      focusRing:      v('--mapped-border-interactive-on-color'),
    },
  },
  tertiary: {
    default: {
      bg:             'transparent',
      bgHover:        v('--mapped-surface-subtle-hover'),
      bgPressed:      v('--mapped-surface-subtle-pressed'),
      bgDisabled:     'transparent',
      border:         'transparent',
      borderHover:    'transparent',
      borderPressed:  'transparent',
      borderDisabled: 'transparent',
      text:           v('--mapped-text-default-default'),
      textHover:      v('--mapped-text-default-hover'),
      textPressed:    v('--mapped-text-default-pressed'),
      textDisabled:   v('--mapped-text-disabled-default'),
      focusRing:      v('--mapped-border-primary-default'),
    },
    inverse: {
      bg:             'transparent',
      bgHover:        v('--mapped-surface-interactive-on-color-hover'),
      bgPressed:      v('--mapped-surface-interactive-on-color-pressed'),
      bgDisabled:     'transparent',
      border:         'transparent',
      borderHover:    'transparent',
      borderPressed:  'transparent',
      borderDisabled: 'transparent',
      text:           v('--mapped-text-on-color-label'),
      textHover:      v('--mapped-text-on-color-label-hover'),
      textPressed:    v('--mapped-text-on-color-label-pressed'),
      textDisabled:   v('--mapped-text-disabled-on-color'),
      focusRing:      v('--mapped-border-interactive-on-color'),
    },
  },
}

export function IconButton({
  variant = 'primary',
  appearance = 'default',
  size = 'm',
  icon,
  ariaLabel,
  disabled = false,
  onClick,
  previewState,
}: IconButtonProps) {
  const t = TOKENS[variant][appearance]

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      data-preview={previewState}
      className={`btn btn--icon-${size}`}
      style={{
        '--btn-bg':              t.bg,
        '--btn-bg-hover':        t.bgHover,
        '--btn-bg-pressed':      t.bgPressed,
        '--btn-bg-disabled':     t.bgDisabled,
        '--btn-border':          t.border,
        '--btn-border-hover':    t.borderHover,
        '--btn-border-pressed':  t.borderPressed,
        '--btn-border-disabled': t.borderDisabled,
        '--btn-text':            t.text,
        '--btn-text-hover':      t.textHover,
        '--btn-text-pressed':    t.textPressed,
        '--btn-text-disabled':   t.textDisabled,
        '--btn-focus-ring':      t.focusRing,
      } as React.CSSProperties}
    >
      <ElementWrapper size="l">
        {icon}
      </ElementWrapper>
    </button>
  )
}
