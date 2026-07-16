import React from 'react'
import './ToastMobile.css'
import { Icon } from '../Icon'
import { TOAST_BG, TOAST_DEFAULT_ICON } from '../Toast'
import type { ToastAppearance } from '../Toast'

export interface ToastMobileProps {
  appearance?: ToastAppearance
  title?: string
  /** Description — app-provided slot (Figma marks the paragraph as replaceable). */
  children?: React.ReactNode
  /** Trailing action — app composes an inverse-tertiary `Button`. */
  actions?: React.ReactNode
  /** When provided, shows the close ✕ and fires on click. */
  onDismiss?: () => void
  /** Override the auto leading icon. */
  icon?: React.ReactNode
  showIcon?: boolean
  role?: 'status' | 'alert'
  id?: string
  className?: string
}

export function ToastMobile({
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
}: ToastMobileProps) {
  return (
    <div
      id={id}
      className={['toast-mobile', `toast-mobile--${appearance}`, className].filter(Boolean).join(' ')}
      style={{ background: TOAST_BG[appearance] }}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      <div className="toast-mobile__main">
        {showIcon && (
          <span className="toast-mobile__icon">
            {icon ?? <Icon name={TOAST_DEFAULT_ICON[appearance]} size="m" />}
          </span>
        )}
        <div className="toast-mobile__stack">
          {title && <p className="toast-mobile__title type-body-m-semibold">{title}</p>}
          {children && <div className="toast-mobile__desc type-body-sm">{children}</div>}
        </div>
      </div>

      {actions && <div className="toast-mobile__actions">{actions}</div>}

      {onDismiss && (
        <button type="button" className="toast-mobile__close" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="close" size="l" />
        </button>
      )}
    </div>
  )
}
