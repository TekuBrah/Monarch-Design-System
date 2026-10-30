import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Icon } from '../Icon'
import { useFormFieldContext } from '../FormField/FormFieldContext'
import './SelectWalletAccount.css'

export type SelectWalletAccountAppearance = 'standard' | 'subtle'
export type SelectWalletAccountState = 'default' | 'filled' | 'selected'

export interface SelectWalletAccountProps {
  appearance?: SelectWalletAccountAppearance
  /** Figma `State` — ignored while `isOpen` is true (Typing takes over). */
  state?: SelectWalletAccountState
  labelCrypto?: string
  labelWallet?: string
  labelAmount?: string
  labelAmtCrypto?: string
  showChevron?: boolean
  /** Dropdown content, rendered below when open. App-provided (Figma: replaceable slot;
   * Figma's own example composes a search Field + option list — with a logo per
   * row — inside it). The trigger shows a leading element only when Figma's
   * `icon left` boolean is on (default off) — see `leadingSlot`. */
  menuSlot?: React.ReactNode
  /** Leading element inside the trigger, before the name stack: Figma's
   *  `icon left` boolean (default off), an `<element>` Size=XXL 40 slot. Pass a
   *  40px node, e.g. `<Avatar size="l" … />`. Decorative: it is `aria-hidden`,
   *  and the trigger's accessible name never reads from it. Gate 91 (G54). */
  leadingSlot?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover'
  /** Width behaviour. `'fixed'` (default) keeps the 320px Figma demo box;
   *  `'fill'` takes the trigger to 100% of its container. Same prop and value
   *  names, and the same `width: 100%` release, as `Select.sizing` (G15).
   *  Closes gap G19 for this component. */
  sizing?: 'fixed' | 'fill'
}

export function SelectWalletAccount({
  appearance = 'standard',
  state = 'default',
  labelCrypto,
  labelWallet,
  labelAmount,
  labelAmtCrypto,
  showChevron = true,
  menuSlot,
  leadingSlot,
  isOpen,
  onOpenChange,
  isDisabled = false,
  isInvalid = false,
  id,
  ariaLabel,
  previewState,
  sizing = 'fixed',
}: SelectWalletAccountProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const menuId = `${controlId}-menu`
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const showMenu = open && !!menuSlot
  // Gate 91: inside a FormField (R91D-7) the trigger is named by the wrapper's
  // label FOLLOWED BY its own existing name: `aria-labelledby` lists the label
  // and then the button itself, and a self-reference resolves to the button's
  // `aria-label`. That keeps the visible label in the name (WCAG 2.5.3). The
  // messages describe it. `aria-invalid` is NOT taken from the wrapper:
  // `button` does not support it in ARIA 1.2, so the described-by error line
  // carries the meaning. Outside a FormField this is `null` and the markup is
  // v2.9.0's (R91D-8, hash-pinned).
  const formField = useFormFieldContext()

  // Gate 93 (v2.12.0): user-driven dismissal. Every close below is a request
  // through `setOpen`, so a controlled consumer still decides. None is driven
  // by geometry, scroll, resize or render (R7, Gate 73-B). The listeners exist
  // only while the menu is shown, so a closed render adds nothing (R93D-10).
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  // The latest setOpen, read through a ref so the listeners never re-attach
  // when its identity changes (the G31 pattern, Gate 62).
  const setOpenRef = useRef(setOpen)
  useLayoutEffect(() => {
    setOpenRef.current = setOpen
  })
  const focusWasInMenu = useRef(false)
  useEffect(() => {
    if (!showMenu) return
    const root = rootRef.current
    if (!root) return
    const close = () => setOpenRef.current(false)
    // Used by the two closes that must not move focus. Focus is on its way to
    // where the user put it, so the close effect must not pull it back to the
    // trigger. In Chrome, React commits these closes in a microtask that runs
    // BEFORE the new target's focusin, so without this the close effect sees
    // focus on <body> and steals it, aborting the browser's own move
    // (measured live, Gate 93; jsdom does not reproduce the ordering).
    const closeLeavingFocus = () => {
      focusWasInMenu.current = false
      close()
    }
    // R93D-6: a press outside the root closes. Focus is not moved.
    const onPointerDown = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) closeLeavingFocus()
    }
    // R93D-5: Escape closes only while focus is inside the root. Window
    // CAPTURE runs before Modal/Sheet's document-capture listener, and
    // stopPropagation keeps the same Escape from also closing the dialog.
    // Focus return is left to the close effect below (R93D-9).
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !root.contains(document.activeElement)) return
      e.stopPropagation()
      e.preventDefault()
      close()
    }
    const onFocusIn = (e: FocusEvent) => {
      focusWasInMenu.current = !!menuRef.current?.contains(e.target as Node)
    }
    // R93D-7: focus moving from inside the root to somewhere outside it
    // closes, and focus is not moved. A null relatedTarget (focus falling to
    // <body>) never closes.
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget
      if (!root.contains(e.target as Node) || !(next instanceof Node)) return
      if (!root.contains(next)) closeLeavingFocus()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn, true)
    document.addEventListener('focusout', onFocusOut, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn, true)
      document.removeEventListener('focusout', onFocusOut, true)
    }
  }, [showMenu])
  // R93D-8 / R93D-9, the one focus path: if focus was inside the menu when it
  // closed and fell to <body>, hand it back to the trigger.
  useEffect(() => {
    if (showMenu || !focusWasInMenu.current) return
    focusWasInMenu.current = false
    const active = document.activeElement
    if (!active || active === document.body) triggerRef.current?.focus()
  }, [showMenu])

  const className = [
    'mn-select-wallet-account',
    `mn-select-wallet-account--${appearance}`,
    !open && state === 'filled' && 'mn-select-wallet-account--filled',
    !open && state === 'selected' && 'mn-select-wallet-account--selected',
    open && 'mn-select-wallet-account--open',
    isDisabled && 'mn-select-wallet-account--disabled',
    isInvalid && 'mn-select-wallet-account--invalid',
    previewState && `mn-select-wallet-account--${previewState}`,
    sizing === 'fill' && 'mn-select-wallet-account--fill',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className={className} data-preview={previewState}>
      <button
        ref={triggerRef}
        type="button"
        id={controlId}
        className="mn-select-wallet-account__control"
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={showMenu ? menuId : undefined}
        aria-invalid={isInvalid || undefined}
        aria-label={ariaLabel ?? [labelCrypto, labelWallet].filter(Boolean).join(' — ')}
        aria-labelledby={formField ? `${formField.labelId} ${controlId}` : undefined}
        aria-describedby={formField?.describedBy}
        onClick={() => {
          if (isDisabled) return
          setOpen(!open)
        }}
      >
        <span className="mn-select-wallet-account__main">
          {leadingSlot && (
            <span className="mn-select-wallet-account__leading" aria-hidden="true">
              {leadingSlot}
            </span>
          )}
          <span className="mn-select-wallet-account__stack">
            <span className="mn-select-wallet-account__name type-body-m-semibold">{labelCrypto}</span>
            <span className="mn-select-wallet-account__wallet type-body-sm">{labelWallet}</span>
          </span>
        </span>
        <span className="mn-select-wallet-account__side">
          <span className="mn-select-wallet-account__amounts">
            <span className="mn-select-wallet-account__amount type-body-m-semibold">{labelAmount}</span>
            <span className="mn-select-wallet-account__amtcrypto type-body-sm-semibold">{labelAmtCrypto}</span>
          </span>
          {showChevron && (
            <span className="mn-select-wallet-account__chevron">
              <Icon name="icon_chevron_expand_more" size="m" />
            </span>
          )}
        </span>
      </button>
      {showMenu && (
        <div ref={menuRef} id={menuId} className="mn-select-wallet-account__menu">
          {menuSlot}
        </div>
      )}
    </div>
  )
}
