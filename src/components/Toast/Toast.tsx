import React from 'react'
import './Toast.css'
import { Icon } from '../Icon'
import type { IconName } from '../Icon/Icon'

export type ToastAppearance = 'information' | 'success' | 'warning' | 'error' | 'discovery' | 'ai'

/** Appearance → background. All mapped surfaces dark-flip; `ai` is a fixed
 *  brand-primitive gradient (no mapped gradient token — approved, like ProgressRing). */
export const TOAST_BG: Record<ToastAppearance, string> = {
  information: 'var(--mapped-surface-primary-default)',
  success: 'var(--mapped-surface-success-default)',
  warning: 'var(--mapped-surface-warning-default)',
  error: 'var(--mapped-surface-error-default)',
  discovery: 'var(--mapped-surface-interactive-default)',
  ai: 'linear-gradient(90deg, var(--brand-blue-500), var(--brand-violet-500))',
}

export const TOAST_DEFAULT_ICON: Record<ToastAppearance, IconName> = {
  information: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  discovery: 'help_outline',
  ai: 'icon_aiinsights',
}

export interface ToastProps {
  appearance?: ToastAppearance
  title?: string
  /** Description — app-provided slot (Figma marks the paragraph as replaceable). */
  children?: React.ReactNode
  /** Action row — app composes inverse `Link`s. */
  actions?: React.ReactNode
  /** When provided, shows the close ✕ and fires on click. */
  onDismiss?: () => void
  /** Override the auto leading icon. */
  icon?: React.ReactNode
  showIcon?: boolean
  /** Live-region politeness. `alert` = assertive (errors); default `status`. */
  role?: 'status' | 'alert'
  id?: string
  className?: string
}

export function Toast({
  appearance = 'information',
  title,
  children,
  actions,
  onDismiss,
  icon,
  showIcon = true,
  role = 'status',
  id,
  className,
}: ToastProps) {
  return (
    <div
      id={id}
      className={['toast', `toast--${appearance}`, className].filter(Boolean).join(' ')}
      style={{ background: TOAST_BG[appearance] }}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      {showIcon && (
        <span className="toast__icon">
          {icon ?? <Icon name={TOAST_DEFAULT_ICON[appearance]} size="l" />}
        </span>
      )}

      <div className="toast__body">
        {title && <p className="toast__title type-body-m-semibold">{title}</p>}
        {children && <div className="toast__desc type-body-sm">{children}</div>}
        {actions && <div className="toast__actions">{actions}</div>}
      </div>

      {onDismiss && (
        <button type="button" className="toast__close" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="close" size="l" />
        </button>
      )}
    </div>
  )
}
