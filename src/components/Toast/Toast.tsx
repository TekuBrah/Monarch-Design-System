import React from 'react'
import './Toast.css'
import { Icon } from '../Icon'
import type { IconName } from '../Icon/Icon'

export type ToastAppearance = 'information' | 'success' | 'warning' | 'error' | 'discovery' | 'ai'

/* The appearance -> background map that used to live here (`TOAST_BG`) now lives
   in Toast.css / ToastMobile.css as `.mn-toast--<appearance>` rules. It was
   applied as an inline `style={{ background }}`, which hid six token bindings
   from the component-CSS audit grep. Its doc comment also claimed "all mapped
   surfaces dark-flip" — the opposite of what they do; v1.7.0 made every hue
   surface theme-invariant, and that invariance is what lets the on-color
   foreground pair with them safely.

   TOAST_DEFAULT_ICON stays: an icon NAME is not a style, cannot be expressed as
   a CSS declaration, and is genuinely runtime-selected. */

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
      className={['mn-toast', `mn-toast--${appearance}`, className].filter(Boolean).join(' ')}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      {showIcon && (
        <span className="mn-toast__icon">
          {icon ?? <Icon name={TOAST_DEFAULT_ICON[appearance]} size="l" />}
        </span>
      )}

      <div className="mn-toast__body">
        {title && <p className="mn-toast__title type-body-m-semibold">{title}</p>}
        {children && <div className="mn-toast__desc type-body-sm">{children}</div>}
        {actions && <div className="mn-toast__actions">{actions}</div>}
      </div>

      {onDismiss && (
        <button type="button" className="mn-toast__close" aria-label="Dismiss" onClick={onDismiss}>
          <Icon name="close" size="l" />
        </button>
      )}
    </div>
  )
}
