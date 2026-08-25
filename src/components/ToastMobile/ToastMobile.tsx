import React from 'react'
import './ToastMobile.css'
import { Icon } from '../Icon'
import { TOAST_DEFAULT_ICON } from '../Toast'
import type { ToastAppearance } from '../Toast'

export interface ToastMobileProps {
  appearance?: ToastAppearance
  title?: string
  /** Description — app-provided slot (Figma marks the paragraph as replaceable). */
  children?: React.ReactNode
  /** Trailing action — app composes a tertiary `Button`. The slot is a
   *  [data-theme="dark"] context so the button renders its on-color (white)
   *  treatment on the toast's saturated colored surface. */
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
      className={['mn-toast-mobile', `mn-toast-mobile--${appearance}`, className].filter(Boolean).join(' ')}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      <div className="mn-toast-mobile__main">
        {showIcon && (
          <span className="mn-toast-mobile__icon">
            {icon ?? <Icon name={TOAST_DEFAULT_ICON[appearance]} size="m" />}
          </span>
        )}
        <div className="mn-toast-mobile__stack">
          {title && <p className="mn-toast-mobile__title type-body-m-semibold">{title}</p>}
          {children && <div className="mn-toast-mobile__desc type-body-sm">{children}</div>}
        </div>
      </div>

      {actions && <div className="mn-toast-mobile__actions" data-theme="dark">{actions}</div>}

      {onDismiss && (
        <button type="button" className="mn-toast-mobile__close" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="close" size="l" />
        </button>
      )}
    </div>
  )
}
