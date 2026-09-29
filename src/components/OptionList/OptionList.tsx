import React, { useEffect, useRef } from 'react'
import './OptionList.css'
import { MenuItem } from '../MenuItem'

/* OptionList — R5 (Teku 29 Sept 2026).

   A flat, full-bleed column of option rows. It is NOT an overlay and knows
   nothing about `Modal` or `Sheet`; it goes in their content slot.

   THE DEFECT IT REPLACES, measured in casestudy_02 `Frame 537` (1484:19292),
   which draws `Now` and `Intention` side by side at the same scale:

     Now  (1484:19112) content 343 wide -> `<Menu>` 1484:19296 inset at x=16,
          311 wide, carrying its own radius, elevation fill and shadow, with
          `Slot {Options}` inside it. A panel within a panel; the selected
          tint stops 16px short of both edges.
     Intention (1484:19402) content 343 wide -> seven `<item>` instances at
          x=0, each 343 wide. Flat. The tint reaches both edges.

   This component is the `Intention` column. Rows measured from
   1484:19479-19485: 343 x 48 at y = 0, 50, 100, ... — pitch 50 on a 48 row,
   so the gap is 2px. Each row holds a `Checkbox` instance at x=16, y=12,
   vertically centred.

   IT COMPOSES THE REAL `MenuItem`, per the composition rule, rather than
   re-implementing a row. That is not just convention here — it is what keeps
   R8 satisfied. Figma paints the selected row `Blue/50` (#e6f1ff), a RAW BRAND
   PRIMITIVE: no `--mapped-surface-*` resolves to that tint, and the
   plausibly-named `surface/primary/default-subtle-selected` is an unrelated
   grey (#f2f2f2). Verified this gate by reading 1484:19481's own variable
   definitions. `MenuItem` already carries that finding and its approved
   resolution — `color-mix(in srgb, var(--mapped-border-primary-default) 10%,
   transparent)` under the token-source gap protocol — so composing it adds no
   token and opens no new gap.

   `MenuItem--checkbox` also already measures exactly what Figma draws:
   padding 12/12/12/16 over a 24px control is a 48px row with its control
   inset 16 from the left, and its 12px right padding is why Figma's checkbox
   instance is 315 wide inside a 343 row rather than 327. */

export interface OptionListOption {
  /** Stable identity — the React key, and what `onChange` reports. Never an
   *  array index (DS API convention). */
  id: string
  label: string
}

export type OptionListSelectionMode = 'single' | 'multiple'

export interface OptionListProps {
  options: OptionListOption[]
  /** `'multiple'` (default) keeps a checkbox on every row and does NOT dismiss
   *  on selection — the consumer confirms with its own footer button.
   *  `'single'` fires `onChange` and `onDismiss` in ONE action, so the user
   *  returns to the form on one tap, and there is no confirm button. */
  selectionMode?: OptionListSelectionMode
  /** Selected option ids. One array for both modes deliberately: a single-mode
   *  union would make every consumer narrow a type for a list whose shape does
   *  not otherwise change. In `'single'` this is at most one id. */
  value?: string[]
  /** The new selection. In `'single'` this is always exactly `[id]`. */
  onChange?: (value: string[]) => void
  /** A request to dismiss the surrounding view. Fired ONLY in `'single'`, in
   *  the same action as `onChange`. `OptionList` does not know what encloses
   *  it, so it requests rather than performs. */
  onDismiss?: () => void
  /** Accessible name for the listbox. No generated default — a generic
   *  fallback is a regression when several lists coexist, the reasoning
   *  `Menu.listAriaLabel` already records. */
  ariaLabel?: string
  id?: string
  className?: string
}

export function OptionList({
  options,
  selectionMode = 'multiple',
  value,
  onChange,
  onDismiss,
  ariaLabel,
  id,
  className,
}: OptionListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selected = value ?? []

  const handleSelect = (optionId?: string) => {
    if (optionId === undefined) return
    if (selectionMode === 'single') {
      // R5 — one action: the change and the dismiss request together, so the
      // consumer returns to the form on a single tap.
      onChange?.([optionId])
      onDismiss?.()
      return
    }
    onChange?.(
      selected.includes(optionId)
        ? selected.filter(x => x !== optionId)
        : [...selected, optionId],
    )
  }

  // Roving tabindex across the rows. Mirrors `Menu`'s implementation rather
  // than sharing it: extracting a common listbox utility would mean editing a
  // shipped component, the same call Sheet/Modal already made for
  // `getFocusable`. Keep the copies in step.
  const getOptions = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])

  useEffect(() => {
    const els = getOptions()
    if (els.length === 0) return
    // Exactly one row should be roving-active. Zero means it was never set;
    // more than one means React re-rendered MenuItem's own `tabIndex={0}`
    // default over prior DOM writes.
    const zeroCount = els.filter(el => el.getAttribute('tabindex') === '0').length
    if (zeroCount === 1) return
    const selectedIndex = els.findIndex(el => el.getAttribute('aria-selected') === 'true')
    const target = selectedIndex === -1 ? 0 : selectedIndex
    els.forEach((el, i) => el.setAttribute('tabindex', i === target ? '0' : '-1'))
  })

  const focusOption = (index: number, els: HTMLElement[]) => {
    const clamped = ((index % els.length) + els.length) % els.length
    els.forEach((el, i) => el.setAttribute('tabindex', i === clamped ? '0' : '-1'))
    els[clamped]?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const els = getOptions()
    if (els.length === 0) return
    const current = els.findIndex(el => el === document.activeElement)
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusOption(current === -1 ? 0 : current + 1, els)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusOption(current === -1 ? els.length - 1 : current - 1, els)
        break
      case 'Home':
        e.preventDefault()
        focusOption(0, els)
        break
      case 'End':
        e.preventDefault()
        focusOption(els.length - 1, els)
        break
      default:
        break
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const els = getOptions()
    const idx = els.indexOf(e.target as HTMLElement)
    if (idx !== -1) els.forEach((el, i) => el.setAttribute('tabindex', i === idx ? '0' : '-1'))
  }

  return (
    <div
      ref={listRef}
      id={id}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={['mn-option-list', className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      {options.map(option => (
        <MenuItem
          key={option.id}
          id={option.id}
          /* `checkbox` and `radio` share one geometry in MenuItem.css
             (padding 12/12/12/16 over a 24px control = a 48px row), so the two
             modes are the same shape — only the affordance differs.
             DECISION TAKEN INSIDE THE BRIEF, FLAGGED FOR TEKU: Figma draws no
             single-select picker, so `radio` is a reading, not a source. It
             was chosen over `default` because `default` is a 44px row with a
             12px inset, which would make single mode a different shape from
             the one Figma actually draws. */
          type={selectionMode === 'single' ? 'radio' : 'checkbox'}
          label={option.label}
          isSelected={selected.includes(option.id)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
