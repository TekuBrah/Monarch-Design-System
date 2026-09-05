import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './Sheet.css'
import { Blanket } from '../Blanket'
import { IconButton } from '../IconButton'
import { Icon } from '../Icon'

export interface SheetProps {
  /** Controlled open state. */
  isOpen: boolean
  /** Fired on any close request — ✕ button, Escape, or scrim click. */
  onClose: () => void
  /** Header title (Figma models this as the `{Header}` text prop, left-aligned).
   *  Does NOT by itself decide whether the header region exists — see
   *  `headerIconLeft` / `headerAction`. The region renders if ANY of the three
   *  is supplied, and is absent entirely when none is. That is what lets a
   *  headerless action sheet compose over `Sheet`. */
  title?: string
  /** Optional node before the title. Figma models this as a boolean (`iconLeft`)
   *  bound to one icon; exposed here as a real slot so each instance can supply
   *  its own — the `Link` lesson. */
  headerIconLeft?: React.ReactNode
  /** Optional node on the right of the header, rendered BEFORE the ✕ — the
   *  same position `HeaderDefault` gives `actionLabel`/`onAction`. */
  headerAction?: React.ReactNode
  /** Main content — any app-provided nodes. This is the ONLY scrolling region;
   *  header, actions and home indicator stay fixed. Always rendered. */
  children?: React.ReactNode
  /** Pinned action region below the content — app composes real Button(s),
   *  rendered as a full-width vertical stack. Omit it and the region is not
   *  rendered (a sheet whose only field lives inside the scrolling content). */
  actions?: React.ReactNode
  /** The iOS home indicator — system chrome the phone draws over every app,
   *  authored inside this component in Figma. Not `BottomNavigation`. */
  showHomeIndicator?: boolean
  /** Close when the scrim (Blanket) is clicked. Default true. */
  closeOnScrimClick?: boolean
  /** The header ✕. Default true. Set false when the header already carries a
   *  dismissal affordance (e.g. a back chevron in `headerIconLeft`) — NOT
   *  auto-suppressed, because keying one control's presence off an unrelated
   *  prop is silent behaviour. */
  showCloseButton?: boolean
  /**
   * Accessible name when there is no visible `title`.
   *
   * A dialog MUST have an accessible name — an unnamed one fails axe's
   * `aria-dialog-name`, measured not assumed. This is checked at runtime in
   * dev against the COMPUTED name rather than in the type, because a type can
   * only guarantee a prop is present, not that it names anything: `title=""`
   * is a valid string and still leaves the dialog unnamed (verified). Note a
   * header built from only `headerIconLeft`/`headerAction` renders no <h2>,
   * so it still needs `ariaLabel`.
   */
  ariaLabel?: string
  /**
   * HEIGHT behaviour. `'hug'` (default) is today's sheet: the panel hugs its
   * content and grows with it, capping at the existing
   * `max-height: calc(100dvh - var(--brand-scale-1100))`. `'fill'` opens the
   * panel AT that cap regardless of how little content it holds.
   *
   * This introduces NO new geometry: 'fill' takes the cap the panel already
   * declares. No new literal, no new token, no second viewport expression.
   *
   * THE VALUES ARE 'hug' | 'fill', NOT 'fixed' | 'fill', and the departure
   * from `Field.sizing` / `CardBalance.sizing` is deliberate. Those name
   * their default `'fixed'` because it IS a literal box (240px / 161px), and
   * CLAUDE.md records that Figma's `hug` "would name behaviour neither
   * component has". Sheet is the opposite case: its default is genuinely
   * hug-height — `.mn-sheet__content` is `flex: 0 1 auto`, shrink-only, and
   * the CSS comment states outright that it "never opens at the cap
   * regardless of content". Calling that `'fixed'` would name behaviour THIS
   * component does not have. Same vocabulary, correct term for the axis.
   *
   * THE AXIS IS HEIGHT, where every other `sizing` prop in the DS governs
   * width. That is safe here and is not a second vocabulary: the panel's
   * width is invariant (`width: 100%`, no max-width — see gap G13), so
   * `sizing` on Sheet has only one dimension it could mean.
   */
  sizing?: 'hug' | 'fill'
  id?: string
  className?: string
}

// Duplicated from Modal.tsx rather than shared — extracting a common overlay
// focus utility would mean editing a shipped component, which is out of scope
// for this session. Logged for a later pass; keep the two copies in step.
function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(el => el.offsetParent !== null)
}

export function Sheet({
  isOpen,
  onClose,
  title,
  headerIconLeft,
  headerAction,
  children,
  actions,
  showHomeIndicator = true,
  closeOnScrimClick = true,
  showCloseButton = true,
  ariaLabel,
  sizing = 'hug',
  id,
  className,
}: SheetProps) {
  const autoId = useId()
  const titleId = `${id ?? autoId}-title`
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const [isContentScrollable, setIsContentScrollable] = useState(false)

  // Region presence is derived from the region's own slots, never coupled to
  // one child: supplying only `headerIconLeft` or only `headerAction` must not
  // be a silent no-op.
  const hasHeader = Boolean(title || headerIconLeft || headerAction)
  const hasHeaderTrail = Boolean(headerAction || showCloseButton)

  if (import.meta.env.DEV && isOpen && !title?.trim() && !ariaLabel?.trim()) {
    // Fail loud on the COMPUTED name, not on prop presence. A type can only
    // guarantee a prop exists: `title=""` typechecks, names nothing, and was
    // verified to still fail axe `aria-dialog-name`. This check catches that
    // and whitespace-only values; a discriminated union could not.
    console.error(
      'Sheet: no accessible name. Supply a non-empty `title`, or `ariaLabel` when there is no visible title — an unnamed dialog fails axe `aria-dialog-name`.',
    )
  }

  // Overflow detection WITHOUT ResizeObserver. useLayoutEffect runs
  // synchronously after DOM mutation and before paint — it is not part of the
  // frame-rendering steps, so unlike RO it fires (and is measurable) even
  // while the preview pane is hidden. That keeps the a11y attributes below
  // inside this project's verification standard.
  // Trade-off vs RO, stated rather than hidden: this re-measures on open and
  // whenever `children` changes identity, not on arbitrary later resizes of
  // already-mounted content.
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!isOpen || !el) return
    const overflowing = el.scrollHeight > el.clientHeight
    if (import.meta.env.DEV) {
      // Dev-only verification hook: proves this effect RAN, rather than
      // inferring it from the resulting DOM. Stripped from the library build
      // (`import.meta.env.DEV` is statically false there).
      ;(globalThis as { __mnSheetOverflowProbe?: unknown }).__mnSheetOverflowProbe = {
        ran: true,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        overflowing,
      }
    }
    setIsContentScrollable(overflowing)
  }, [isOpen, children])

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    // Move focus into the dialog (first focusable, else the panel itself).
    // The content region is skipped for INITIAL focus only — it carries
    // tabIndex={0} so it stays in the Tab cycle, but landing there on open
    // would steal focus from the first real control, unlike Modal.
    const initial = panel ? getFocusable(panel).filter(el => el !== contentRef.current) : []
    ;(initial[0] ?? panel)?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      // Focus trap: keep Tab cycling within the dialog.
      if (e.key === 'Tab' && panel) {
        const items = getFocusable(panel)
        if (items.length === 0) {
          e.preventDefault()
          panel.focus()
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === panel)) {
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
    <div className={['mn-sheet', className].filter(Boolean).join(' ')}>
      <Blanket onClick={closeOnScrimClick ? onClose : undefined} />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        // Keyed to `title`, NOT to `hasHeader` — a header built from only
        // `headerIconLeft`/`headerAction` renders no <h2>, and pointing
        // aria-labelledby at an id that doesn't exist is a dangling reference.
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={['mn-sheet__panel', sizing === 'fill' && 'mn-sheet__panel--fill']
          .filter(Boolean)
          .join(' ')}
      >
        {hasHeader && (
          <div className="mn-sheet__header">
            <div className="mn-sheet__header-lead">
              {headerIconLeft}
              {title && (
                <h2 id={titleId} className="mn-sheet__title type-body-m-semibold">
                  {title}
                </h2>
              )}
            </div>
            {hasHeaderTrail && (
              <div className="mn-sheet__header-trail">
                {headerAction}
                {showCloseButton && (
                  <IconButton
                    variant="tertiary"
                    size="s"
                    ariaLabel="Close"
                    icon={<Icon name="close" size="l" />}
                    onClick={onClose}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div
          ref={contentRef}
          className={['mn-sheet__content', !hasHeader && 'mn-sheet__content--headerless']
            .filter(Boolean)
            .join(' ')}
          /* Hiding the scrollbar removes the only pointer affordance, so the
             region has to stay reachable by keyboard — axe's
             `scrollable-region-focusable` rule, and the `.mvp-home__carousel`
             cautionary case. Applied ONLY while the content actually
             overflows: a short sheet must not carry a spurious tab stop or
             announce a group that has nothing to scroll. */
          tabIndex={isContentScrollable ? 0 : undefined}
          role={isContentScrollable ? 'group' : undefined}
          aria-label={isContentScrollable ? (title ?? ariaLabel) : undefined}
        >
          {children}
        </div>

        {actions && <div className="mn-sheet__actions">{actions}</div>}

        {showHomeIndicator && (
          <div className="mn-sheet__home-indicator-frame">
            <div className="mn-sheet__home-indicator" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
