import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Select } from './Select'
import type { SelectAppearance } from './Select'

const APPEARANCES: SelectAppearance[] = ['standard', 'subtle']

describe('Select', () => {
  it('renders without crashing', () => {
    render(<Select ariaLabel="Account" />)
    expect(screen.getByRole('combobox', { name: 'Account' })).toBeInTheDocument()
  })

  it.each(APPEARANCES)('renders the %s appearance', appearance => {
    const { container } = render(<Select ariaLabel="Account" appearance={appearance} />)
    expect(container.firstChild).toHaveClass(`mn-select--${appearance}`)
  })

  // Step 1.2 classified Select as HYBRID: the inner input/chevron carry the real
  // disabled attribute, while the outer control <div> relies on a manual
  // `if (isDisabled) return` JS guard. Both halves are asserted.
  it('natively disables its inner controls, and its outer click guard does not crash', () => {
    const { container } = render(<Select ariaLabel="Account" isDisabled />)
    expect(screen.getByRole('combobox', { name: 'Account' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Open options' })).toBeDisabled()

    const control = container.querySelector('.mn-select__control')
    expect(control).not.toBeNull()
    expect(() => fireEvent.click(control!)).not.toThrow()
  })

  it('sets aria-invalid when isInvalid is set', () => {
    render(<Select ariaLabel="Account" isInvalid />)
    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Select ariaLabel="Account" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // sizing (Gate 45, gap G15) — mirrors the CardBalance.sizing suite added at
  // Gate 32 deliberately: the prop's whole rationale is that Select now shares
  // one shape with Field and the two Cards, so its tests should be comparable
  // to theirs rather than inventing a second form.
  //
  // ASSERTED BY DECLARATION, NOT BY PIXELS, and that is the standing rule for
  // this prop rather than a limitation here. CLAUDE.md records why: any
  // container at or under the component's own width renders both modes
  // identically and proves nothing. (In this suite it could not be pixels
  // anyway — vitest.config.ts sets no test.css option, so no stylesheet is
  // ever applied in jsdom.)
  describe('sizing', () => {
    it('omits the fill modifier by default', () => {
      const { container } = render(<Select ariaLabel="Account" />)
      expect(container.firstChild).toHaveClass('mn-select')
      expect(container.firstChild).not.toHaveClass('mn-select--fill')
    })

    it('applies the fill modifier when sizing is fill', () => {
      const { container } = render(<Select ariaLabel="Account" sizing="fill" />)
      expect(container.firstChild).toHaveClass('mn-select--fill')
    })

    it("treats an explicit 'fixed' as identical to omitting the prop", () => {
      const a = render(<Select ariaLabel="Account" sizing="fixed" />)
      const explicit = (a.container.firstChild as HTMLElement).className
      a.unmount()

      const b = render(<Select ariaLabel="Account" />)
      const omitted = (b.container.firstChild as HTMLElement).className

      expect(explicit).toBe(omitted)
    })

    // The modifier must not displace or reorder the variant modifier that
    // shares the class string — Select composes appearance into the same list.
    it.each(APPEARANCES)('composes fill alongside the %s appearance', appearance => {
      const { container } = render(
        <Select ariaLabel="Account" appearance={appearance} sizing="fill" />,
      )
      expect(container.firstChild).toHaveClass('mn-select')
      expect(container.firstChild).toHaveClass(`mn-select--${appearance}`)
      expect(container.firstChild).toHaveClass('mn-select--fill')
    })

    it('leaves the combobox role and accessible name untouched', () => {
      render(<Select ariaLabel="Account" sizing="fill" />)
      expect(screen.getByRole('combobox', { name: 'Account' })).toBeInTheDocument()
    })

    it('has no axe violations when filling', async () => {
      const { container } = render(<Select ariaLabel="Account" sizing="fill" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  // G43 (Gate 73). jsdom has no layout, so the geometry the component reads is
  // stubbed: the viewport height, the trigger's rect, a clipping ancestor's
  // rect and the menu's natural content height. The gap token does not resolve
  // in jsdom (no stylesheet), so it reads as 0 here; the browser measurement
  // in CLAUDE.md Gate 73 covers the real 4px.
  describe('menu placement (G43)', () => {
    let trigger = { top: 100, bottom: 148, left: 16, width: 343 }
    let clip = { top: 0, bottom: 800 }
    let natural = 200

    beforeEach(() => {
      trigger = { top: 100, bottom: 148, left: 16, width: 343 }
      clip = { top: 0, bottom: 800 }
      natural = 200
      Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, get: () => 800 })
      Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, get: () => 375 })
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        get(this: HTMLElement) {
          return this.classList.contains('mn-select__menu') ? natural : 0
        },
      })
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('mn-select')) {
          const { top, bottom, left, width } = trigger
          return { top, bottom, left, right: left + width, width, height: bottom - top, x: left, y: top, toJSON: () => ({}) } as DOMRect
        }
        if (this.dataset.testid === 'clip') {
          return { top: clip.top, bottom: clip.bottom, left: 0, right: 375, width: 375, height: clip.bottom - clip.top, x: 0, y: clip.top, toJSON: () => ({}) } as DOMRect
        }
        return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
      delete (document.documentElement as unknown as Record<string, unknown>).clientHeight
      delete (document.documentElement as unknown as Record<string, unknown>).clientWidth
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight
    })

    const open = (onOpenChange = () => {}) =>
      render(
        <div data-testid="clip" style={{ overflow: 'auto' }}>
          <Select ariaLabel="Category" isOpen onOpenChange={onOpenChange} menuSlot={<button>Groceries</button>} />
        </div>,
      )
    const menuOf = (c: HTMLElement) => c.querySelector('.mn-select__menu') as HTMLElement
    const prop = (el: HTMLElement, name: string) => el.style.getPropertyValue(name)

    it('keeps the open menu a DOM child of the select root, not portalled', () => {
      const { container } = open()
      const root = container.querySelector('.mn-select') as HTMLElement
      expect(root.contains(menuOf(container))).toBe(true)
    })

    it('places the menu below the trigger at the trigger width', () => {
      const menu = menuOf(open().container)
      expect(menu.dataset.placement).toBe('below')
      expect(prop(menu, '--mn-select-menu-top')).toBe('148px')
      expect(prop(menu, '--mn-select-menu-left')).toBe('16px')
      expect(prop(menu, '--mn-select-menu-width')).toBe('343px')
      expect(prop(menu, '--mn-select-menu-max-height')).toBe('652px')
      expect(menu.dataset.capped).toBeUndefined()
    })

    it('flips the menu above when it does not fit below and there is more room above', () => {
      trigger = { top: 600, bottom: 648, left: 16, width: 343 }
      natural = 300
      const menu = menuOf(open().container)
      expect(menu.dataset.placement).toBe('above')
      expect(prop(menu, '--mn-select-menu-top')).toBe('300px')
      expect(prop(menu, '--mn-select-menu-max-height')).toBe('600px')
    })

    it('caps the menu height to the space available and marks it scrollable', () => {
      trigger = { top: 300, bottom: 348, left: 16, width: 343 }
      natural = 1000
      const menu = menuOf(open().container)
      expect(menu.dataset.placement).toBe('below')
      expect(prop(menu, '--mn-select-menu-max-height')).toBe('452px')
      expect(menu.dataset.capped).toBe('true')
    })

    it('follows the trigger when an ancestor scrolls', () => {
      const { container, getByTestId } = open()
      trigger = { top: 60, bottom: 108, left: 16, width: 343 }
      fireEvent.scroll(getByTestId('clip'))
      expect(prop(menuOf(container), '--mn-select-menu-top')).toBe('108px')
    })

    it('closes when the trigger scrolls fully out of a clipping ancestor', () => {
      const onOpenChange = vi.fn()
      const { getByTestId } = open(onOpenChange)
      clip = { top: 0, bottom: 400 }
      trigger = { top: 450, bottom: 498, left: 16, width: 343 }
      fireEvent.scroll(getByTestId('clip'))
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
