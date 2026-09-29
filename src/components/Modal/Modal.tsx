import React, { useEffect, useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'
import { Blanket } from '../Blanket'
import { OverlayHeader } from '../OverlayHeader'

export interface ModalProps {
  /** Controlled open state. */
  isOpen: boolean
  /** Fired on any close request — ✕ button, Escape, or scrim click. */
  onClose: () => void
  /** Header title (Figma models this as the `{Header}` text prop). */
  title?: string
  /** Optional node before the title, inside the centred group — same name and
   *  same `ReactNode` shape as `Sheet`'s, so the two overlays don't carry two
   *  names for one slot. Positioned differently because the two overlays put
   *  it in different places: Modal centres icon+title as a unit (it maps to
   *  `OverlayHeader.titleLeading`), Sheet puts it in the leading slot (it maps
   *  to `OverlayHeader.leading`). Both names keep working — R1 (Gate 73-B). */
  headerIconLeft?: React.ReactNode
  /** Renders a back control at the left of the header, and fires this on
   *  activation. Omit it and the leading slot stays empty and inert — but it
   *  still occupies the control's full footprint, so the title stays centred
   *  (R2). Added at Gate 73-B for the dropdown-in-a-form pattern: a `Select`
   *  inside an overlay turns the overlay's content into a selection view, and
   *  back returns to the form. */
  onBack?: () => void
  /** Accessible name for the back control. */
  backLabel?: string
  /** Main content — any app-provided nodes. This is the flexible middle slot:
   *  the Modal is a generic container, so whatever a feature needs goes here. */
  children?: React.ReactNode
  /** Footer content — app composes real Button(s); rendered as a full-width vertical stack. */
  footer?: React.ReactNode
  /** Close when the scrim (Blanket) is clicked. Default true. */
  closeOnScrimClick?: boolean
  /** Accessible name when there's no visible `title`. */
  ariaLabel?: string
  /** R6 (Gate 73-B) — side padding on the content region.
   *  `'default'` keeps the 16px sides every existing consumer already gets.
   *  `'none'` drops them so a full-bleed child (`OptionList`) can run the
   *  panel's whole width and its selected tint can reach both edges.
   *  Only the SIDES are released: the header and footer still own the vertical
   *  spacing, so a flush content region does not change the panel's height. */
  contentPadding?: 'default' | 'none'
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
  headerIconLeft,
  onBack,
  backLabel,
  children,
  footer,
  closeOnScrimClick = true,
  ariaLabel,
  contentPadding = 'default',
  id,
  className,
}: ModalProps) {
  const autoId = useId()
  const titleId = `${id ?? autoId}-title`
  const cardRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  // G31 (Gate 62). The open effect below is keyed to OPENING, not to `onClose`
  // changing identity. It used to list `onClose` as a dependency, so any
  // consumer passing an inline arrow tore the effect down on every render
  // while open — and the teardown restores focus to the opener, which scrolls
  // it into view: the page jumped behind an open modal (measured in the MVP at
  // 770px and 808px). Restoring focus is a CLOSE behaviour, so only closing may
  // run it. The latest callback is read through this ref instead, so Escape
  // still calls the current `onClose` rather than the one captured at open.
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

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
        onCloseRef.current()
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
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className={['mn-modal', className].filter(Boolean).join(' ')}>
      <Blanket onClick={closeOnScrimClick ? onClose : undefined} />
      <div
        ref={cardRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className="mn-modal__card"
      >
        <OverlayHeader
          title={title}
          titleId={titleId}
          titleLeading={headerIconLeft}
          onBack={onBack}
          backLabel={backLabel}
          onClose={onClose}
        />

        <div
          className={[
            'mn-modal__content',
            contentPadding === 'none' && 'mn-modal__content--flush',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>

        {footer && <div className="mn-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
