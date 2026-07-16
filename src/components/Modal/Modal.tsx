import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'
import { Blanket } from '../Blanket'
import { IconButton } from '../IconButton'
import { Icon } from '../Icon'

export interface ModalProps {
  /** Controlled open state. */
  isOpen: boolean
  /** Fired on any close request — ✕ button, Escape, or scrim click. */
  onClose: () => void
  /** Header title (Figma models this as the `{Header}` text prop). */
  title?: string
  /** Main content — any app-provided nodes. This is the flexible middle slot:
   *  the Modal is a generic container, so whatever a feature needs goes here. */
  children?: React.ReactNode
  /** Footer content — app composes real Button(s); rendered as a full-width vertical stack. */
  footer?: React.ReactNode
  /** Close when the scrim (Blanket) is clicked. Default true. */
  closeOnScrimClick?: boolean
  /** Accessible name when there's no visible `title`. */
  ariaLabel?: string
  id?: string
  className?: string
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(el => el.offsetParent !== null)
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnScrimClick = true,
  ariaLabel,
  id,
  className,
}: ModalProps) {
  const autoId = useId()
  const titleId = `${id ?? autoId}-title`
  const cardRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const card = cardRef.current
    // Move focus into the dialog (first focusable, else the card itself).
    const initial = card ? getFocusable(card) : []
    ;(initial[0] ?? card)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      // Focus trap: keep Tab cycling within the dialog.
      if (e.key === 'Tab' && card) {
        const items = getFocusable(card)
        if (items.length === 0) {
          e.preventDefault()
          card.focus()
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === card)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className={['modal', className].filter(Boolean).join(' ')}>
      <Blanket onClick={closeOnScrimClick ? onClose : undefined} />
      <div
        ref={cardRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className="modal__card"
      >
        <div className="modal__header">
          <span className="modal__header-side" aria-hidden="true" />
          {title ? (
            <h2 id={titleId} className="modal__title type-body-m-semibold">
              {title}
            </h2>
          ) : (
            <span className="modal__title" aria-hidden="true" />
          )}
          <span className="modal__header-side modal__header-side--end">
            <IconButton
              variant="tertiary"
              size="s"
              ariaLabel="Close"
              icon={<Icon name="close" size="l" />}
              onClick={onClose}
            />
          </span>
        </div>

        <div className="modal__content">{children}</div>

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
