import React, { useEffect, useRef } from 'react'
import './Menu.css'
import { Field } from '../Field'
import { Icon } from '../Icon'

export interface MenuProps {
  /** Hide to use Menu as a plain option-list dropdown with no search field. */
  searchBar?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchAriaLabel?: string
  /** App-provided option list — typically a stack of `MenuItem` rows. */
  slotContent?: React.ReactNode
  /** Whether `slotContent` is a list of selectable options — adds
   *  `role="listbox"` plus arrow-key/roving-tabindex navigation across any
   *  `[role="option"]` descendants. Set `false` when wrapping non-option
   *  content (e.g. DatePicker's calendar grid). Default `true`. */
  isOptionList?: boolean
  id?: string
  className?: string
}

export function Menu({
  searchBar = true,
  searchPlaceholder = 'Placeholder',
  searchValue,
  onSearchChange,
  searchAriaLabel = 'Search',
  slotContent,
  isOptionList = true,
  id,
  className,
}: MenuProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Establish (or re-establish, e.g. after search-filtering changes the
  // option set) a single roving tabindex target — the selected option if
  // any, else the first — rather than leaving every option at tabIndex 0.
  useEffect(() => {
    if (!isOptionList) return
    const options = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
    )
    if (options.length === 0) return
    // Exactly one option should be roving-active. Zero means it's never been
    // set; more than one means React re-rendered MenuItem's own `tabIndex={0}`
    // default over our prior DOM writes (its default is only meant for
    // standalone use outside a Menu) — either way, needs re-establishing.
    const zeroCount = options.filter(el => el.getAttribute('tabindex') === '0').length
    if (zeroCount === 1) return
    const selectedIndex = options.findIndex(el => el.getAttribute('aria-selected') === 'true')
    const target = selectedIndex === -1 ? 0 : selectedIndex
    options.forEach((el, i) => el.setAttribute('tabindex', i === target ? '0' : '-1'))
  })

  const getOptions = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])

  const focusOption = (index: number, options: HTMLElement[]) => {
    const clamped = ((index % options.length) + options.length) % options.length
    options.forEach((el, i) => el.setAttribute('tabindex', i === clamped ? '0' : '-1'))
    options[clamped]?.focus()
  }

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const options = getOptions()
    if (options.length === 0) return
    const currentIndex = options.findIndex(el => el === document.activeElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusOption(currentIndex === -1 ? 0 : currentIndex + 1, options)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusOption(currentIndex === -1 ? options.length - 1 : currentIndex - 1, options)
        break
      case 'Home':
        e.preventDefault()
        focusOption(0, options)
        break
      case 'End':
        e.preventDefault()
        focusOption(options.length - 1, options)
        break
      default:
        break
    }
  }

  // Keep roving tabindex in sync when an option is focused directly (e.g. via
  // click) rather than through arrow-key navigation.
  const handleListFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const options = getOptions()
    const idx = options.indexOf(e.target as HTMLElement)
    if (idx !== -1) {
      options.forEach((el, i) => el.setAttribute('tabindex', i === idx ? '0' : '-1'))
    }
  }

  return (
    <div id={id} className={['menu', className].filter(Boolean).join(' ')}>
      {searchBar && (
        <div className="menu__search">
          <Field
            leadingIcon={<Icon name="search" size="s" />}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            ariaLabel={searchAriaLabel}
          />
        </div>
      )}
      {isOptionList ? (
        <div
          ref={listRef}
          role="listbox"
          className="menu__list"
          onKeyDown={handleListKeyDown}
          onFocus={handleListFocus}
        >
          {slotContent}
        </div>
      ) : (
        slotContent
      )}
    </div>
  )
}
