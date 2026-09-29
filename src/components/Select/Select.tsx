import React, { useId, useState, useRef, useLayoutEffect, useEffect } from 'react'
import { Icon } from '../Icon'
import './Select.css'

/* G43 (Gate 73) — the open menu is drawn with `position: fixed` against its
   trigger, so an ancestor's `overflow: clip` (the Modal card) or a scrolling
   ancestor no longer cuts it off.

   It is NOT portalled, and that is Teku's ruling (Gate 73), superseding the
   review thread's portal ruling. The menu stays a DOM child of `.mn-select`, so
   everything a consumer can observe apart from position is unchanged: a
   `contains()` outside-click check still counts the menu as inside (the MVP's
   budget form relies on exactly that), Tab still reaches the menu items in
   document order, the Modal focus trap still includes them, and a consumer's
   descendant CSS selector still reaches the slot.

   KNOWN LIMIT: `position: fixed` is positioned against the viewport only while
   no ancestor has a `transform`, `filter` or `contain` property; any of those
   becomes the containing block and would clip the menu again. Modal and Sheet
   have none today.

   R7 (Gate 73-B) WITHDREW ONE PART OF G43: the geometry code no longer closes
   the menu. No code path driven by geometry, scroll, resize or render may call
   `setOpen` or `onOpenChange` — open state is the consumer's. Out of view
   hides instead; see the note on `isOutOfView` below. Everything else above is
   unchanged. */
interface MenuGeometry {
  top: number
  left: number
  width: number
  maxHeight: number
  placement: 'below' | 'above'
  /** True when the content is taller than the space it was given. */
  capped: boolean
}

/** The trigger is "in view" while any part of it is inside the viewport and
 *  inside every ancestor that clips its overflow. An unrendered trigger (all
 *  zero rect, e.g. jsdom) is never treated as scrolled away. */
function isInView(el: HTMLElement, rect: DOMRect): boolean {
  if (rect.width === 0 && rect.height === 0) return true
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  let top = 0
  let left = 0
  let bottom = vh || Infinity
  let right = vw || Infinity
  for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
    const s = getComputedStyle(a)
    // The shorthand is read too: not every engine expands it into the longhands.
    const values = [s.overflowX, s.overflowY, ...(s.overflow || '').split(' ')].filter(Boolean)
    if (values.every(v => v === 'visible')) continue
    const r = a.getBoundingClientRect()
    top = Math.max(top, r.top)
    left = Math.max(left, r.left)
    bottom = Math.min(bottom, r.bottom)
    right = Math.min(right, r.right)
  }
  return rect.bottom > top && rect.top < bottom && rect.right > left && rect.left < right
}

/** Below by default; above only when the content does not fit below AND there
 *  is more room above. Height is capped to the chosen side's space. `gap` is
 *  applied between trigger and menu and again at the viewport edge. */
function placeMenu(rect: DOMRect, natural: number, gap: number): MenuGeometry {
  const vh = document.documentElement.clientHeight
  const below = Math.max(0, vh - rect.bottom - 2 * gap)
  const above = Math.max(0, rect.top - 2 * gap)
  const flip = natural > below && above > below
  const maxHeight = flip ? above : below
  const height = Math.min(natural, maxHeight)
  return {
    top: flip ? rect.top - gap - height : rect.bottom + gap,
    left: rect.left,
    width: rect.width,
    maxHeight,
    placement: flip ? 'above' : 'below',
    capped: natural > maxHeight,
  }
}

const sameGeometry = (a: MenuGeometry | null, b: MenuGeometry) =>
  !!a &&
  a.top === b.top &&
  a.left === b.left &&
  a.width === b.width &&
  a.maxHeight === b.maxHeight &&
  a.placement === b.placement &&
  a.capped === b.capped

export type SelectAppearance = 'standard' | 'subtle'

export interface SelectProps {
  appearance?: SelectAppearance
  /** Floating caption label inside the trigger. */
  label?: string
  placeholder?: string
  /** Current text — the search query while typing, or the chosen value's label. */
  value?: string
  /** Fires as the user types (searchable combobox) — the app filters its menu. */
  onSearchChange?: (value: string) => void
  /** Allow typing to filter. Default true (this is a searchable select). */
  searchable?: boolean
  /** Controlled open state; omit for uncontrolled. */
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Dropdown content, rendered below when open. App-provided (Figma: replaceable slot). */
  menuSlot?: React.ReactNode
  /** Optional leading element — wrap decorative content (Logo/flag) in ElementWrapper. */
  leadingSlot?: React.ReactNode
  /** Figma `Selected` state — persistent blue border + glow ring after a choice. */
  isSelected?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  name?: string
  /** Accessible name when no visible `label`. */
  ariaLabel?: string
  /** Showcase only — forces a visual state without interaction. */
  previewState?: 'hover' | 'focus'
  /** Width behaviour. `'fixed'` (default) keeps the 320px Figma demo box;
   *  `'fill'` takes the select to 100% of its container, so a consumer can
   *  size it from the layout instead of overriding DS rules from the app.
   *  Same prop name and value names as `Field.sizing` (v2.0.0),
   *  `CardBalance.sizing` (v1.11.0) and `CardFeaturesAndEducation.sizing`
   *  (v1.5.0). Closes gap G15.
   *
   *  `'fixed'`, not `'hug'`: the default is a literal 320px box, not a
   *  hug-contents one, so Figma's `hug` would name behaviour this component
   *  does not have.
   *
   *  Nothing outranks `'fill'` here. `Field` had to declare `--fill` BEFORE
   *  `--compact` so an icon-only square stayed square; `Select` exposes no
   *  compact/icon-only variant and no other geometry-owning prop, so there is
   *  no shape contract to order against. */
  sizing?: 'fixed' | 'fill'
}

export function Select({
  appearance = 'standard',
  label,
  placeholder,
  value,
  onSearchChange,
  searchable = true,
  isOpen,
  onOpenChange,
  menuSlot,
  leadingSlot,
  isSelected = false,
  isDisabled = false,
  isInvalid = false,
  id,
  name,
  ariaLabel,
  previewState,
  sizing = 'fixed',
}: SelectProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const menuId = `${inputId}-menu`
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isOpen ?? uncontrolledOpen
  const setOpen = (o: boolean) => (onOpenChange ? onOpenChange(o) : setUncontrolledOpen(o))
  const showMenu = open && !!menuSlot

  // G43 — measure the trigger and place the fixed menu against it, before
  // paint, on every render while open (the slot's content can change height
  // as the user types), and again on any scroll or resize.
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = useState<MenuGeometry | null>(null)
  // R7 (Gate 73-B) — SELECT NEVER CLOSES ITSELF.
  //
  // v2.7.0 called setOpen(false) from here when the trigger read out of view.
  // With a controlled consumer that fires onOpenChange(false) with no user
  // action at all, and because this runs on EVERY render while open as well as
  // on scroll and resize, a single transient measurement could dismiss a menu
  // the user had just opened. It produced a roughly 1-in-12 non-deterministic
  // screenshot in the MVP (85,275 px and 60,131 px diffs, identical each time;
  // the trace showed the menu open at the last setup step and gone at capture).
  // v2.6.0 had no such path.
  //
  // Out of view now HIDES rather than closes: the menu stays open, stays
  // mounted and keeps its place in the DOM and the Tab order's document order,
  // but is made invisible and non-interactive by a modifier class. Open state
  // belongs to the consumer; visibility is ours.
  const [isOutOfView, setIsOutOfView] = useState(false)
  // A single out-of-view reading is not enough to act on — it can be a
  // transient during layout, which is exactly what made the MVP flake. One
  // requestAnimationFrame re-measure has to agree before anything hides.
  const recheckRef = useRef<number | null>(null)
  const cancelRecheck = () => {
    if (recheckRef.current !== null) {
      cancelAnimationFrame(recheckRef.current)
      recheckRef.current = null
    }
  }
  const updateRef = useRef(() => {})
  updateRef.current = () => {
    const root = rootRef.current
    const menu = menuRef.current
    if (!root || !menu) return
    const rect = root.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    if (!isInView(root, rect)) {
      // Confirm on the next frame before hiding. Only one frame is ever in
      // flight; a reading while one is pending does not queue a second, and
      // once hidden no further frame is scheduled — otherwise every render
      // while out of view would leave one pending forever.
      if (!isOutOfView && recheckRef.current === null) {
        recheckRef.current = requestAnimationFrame(() => {
          recheckRef.current = null
          const el = rootRef.current
          if (!el) return
          if (!isInView(el, el.getBoundingClientRect())) setIsOutOfView(true)
        })
      }
      // No geometry update while out of view: the last good placement is kept
      // so the menu is correct the moment it comes back.
      return
    }
    // An in-view reading clears the state at once and cancels a pending frame,
    // so a scroll that leaves and returns within one frame never hides.
    cancelRecheck()
    setIsOutOfView(false)
    const gap = parseFloat(getComputedStyle(menu).getPropertyValue('--brand-scale-100')) || 0
    const next = placeMenu(rect, menu.scrollHeight, gap)
    setGeometry(prev => (sameGeometry(prev, next) ? prev : next))
  }
  useLayoutEffect(() => {
    if (showMenu) updateRef.current()
  })
  useEffect(() => {
    if (!showMenu) {
      cancelRecheck()
      setGeometry(null)
      setIsOutOfView(false)
      return
    }
    const onChange = () => updateRef.current()
    window.addEventListener('scroll', onChange, true)
    window.addEventListener('resize', onChange)
    return () => {
      window.removeEventListener('scroll', onChange, true)
      window.removeEventListener('resize', onChange)
      // Cancel on close AND on unmount — a frame that fires after teardown
      // would call setState on an unmounted component.
      cancelRecheck()
    }
  }, [showMenu])

  const className = [
    'mn-select',
    `mn-select--${appearance}`,
    isSelected && 'mn-select--selected',
    isDisabled && 'mn-select--disabled',
    isInvalid && 'mn-select--invalid',
    previewState && `mn-select--${previewState}`,
    sizing === 'fill' && 'mn-select--fill',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className={className} data-preview={previewState}>
      <div
        className="mn-select__control"
        onClick={() => {
          if (isDisabled) return
          inputRef.current?.focus()
          setOpen(true)
        }}
      >
        {leadingSlot && <span className="mn-select__lead">{leadingSlot}</span>}
        <span className="mn-select__stack">
          {label && (
            <label htmlFor={inputId} className="mn-select__label type-body-caption">
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="text"
            className="mn-select__input type-body-m"
            value={value}
            placeholder={placeholder}
            readOnly={!searchable}
            disabled={isDisabled}
            role="combobox"
            aria-expanded={open}
            aria-controls={showMenu ? menuId : undefined}
            aria-autocomplete={searchable ? 'list' : undefined}
            aria-invalid={isInvalid || undefined}
            aria-label={label ? undefined : ariaLabel}
            onChange={e => onSearchChange?.(e.target.value)}
          />
        </span>
        <button
          type="button"
          className="mn-select__chevron"
          tabIndex={-1}
          aria-label={open ? 'Close options' : 'Open options'}
          disabled={isDisabled}
          onClick={e => {
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          <Icon name="icon_chevron_expand_more" size="m" />
        </button>
      </div>
      {showMenu && (
        <div
          ref={menuRef}
          id={menuId}
          className={['mn-select__menu', isOutOfView && 'mn-select__menu--out-of-view']
            .filter(Boolean)
            .join(' ')}
          data-placement={geometry?.placement}
          data-capped={geometry?.capped || undefined}
          // Continuous geometry, so it cannot be a finite set of classes: the
          // custom-property pattern, read by .mn-select__menu in Select.css.
          style={
            geometry
              ? ({
                  '--mn-select-menu-top': `${geometry.top}px`,
                  '--mn-select-menu-left': `${geometry.left}px`,
                  '--mn-select-menu-width': `${geometry.width}px`,
                  '--mn-select-menu-max-height': `${geometry.maxHeight}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {menuSlot}
        </div>
      )}
    </div>
  )
}
