import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Sheet } from './Sheet'
import type { SheetProps } from './Sheet'

// SMOKE SCOPE ONLY, matching Modal. Sheet has real lifecycle — focus trap,
// Escape-to-close and scrim dismissal. None of that is tested here by design;
// it is flagged as a candidate for deeper testing later, same as Modal and
// Blanket. Region presence and the header slot combinations ARE covered, since
// those are the G8-class defect this component exists not to reproduce.
describe('Sheet', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Sheet isOpen={false} onClose={() => {}} title="Filter">
        Body
      </Sheet>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog when open', () => {
    render(
      <Sheet isOpen onClose={() => {}} title="Filter">
        Body
      </Sheet>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Filter' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('renders its children and actions content', () => {
    render(
      <Sheet isOpen onClose={() => {}} title="Filter" actions={<button>Apply</button>}>
        Body
      </Sheet>,
    )
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  // The G8 fix: with none of the three header slots supplied, the header
  // region must be absent entirely, not rendered empty. A headerless action
  // sheet composes over this.
  it('renders no header region when no header slot is supplied', () => {
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} ariaLabel="Choose a source">
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__header')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Choose a source' })).toBeInTheDocument()
  })

  // Region presence is derived from the region, not from one child: each slot
  // alone must bring the header up. `headerIconLeft` alone was a silent no-op
  // before this.
  it.each([
    ['title only', { title: 'Filter' }],
    ['headerIconLeft only', { headerIconLeft: <span>lead</span> }],
    ['headerAction only', { headerAction: <button>Reset</button> }],
    ['all three', { title: 'Filter', headerIconLeft: <span>lead</span>, headerAction: <button>Reset</button> }],
  ])('renders the header region with %s', (_name, props) => {
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} ariaLabel="Sheet" {...props}>
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__header')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  // Dangling aria-labelledby: a header built from only the icon/action slots
  // renders no <h2>, so the reference must not be emitted.
  it('never points aria-labelledby at a title that was not rendered', () => {
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} ariaLabel="Choose a source" headerAction={<button>Reset</button>}>
        Body
      </Sheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(baseElement.querySelector('.mn-sheet__header')).not.toBeNull()
    expect(dialog).not.toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAccessibleName('Choose a source')
  })

  it('renders the header action before the close button', () => {
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} title="Filter" headerAction={<button>Reset</button>}>
        Body
      </Sheet>,
    )
    const trail = baseElement.querySelector('.mn-sheet__header-trail')!
    const order = Array.from(trail.querySelectorAll('button')).map(b => b.textContent || b.getAttribute('aria-label'))
    expect(order).toEqual(['Reset', 'Close'])
  })

  // The scroll region keeps a keyboard route after the scrollbar is hidden —
  // but only while it actually scrolls. jsdom computes no layout, so
  // scrollHeight/clientHeight are stubbed to drive each branch explicitly.
  const withScrollHeight = (value: number, fn: () => void) => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value })
    try {
      fn()
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', original)
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight
    }
  }

  it('gives the content region no tab stop when it does not overflow', () => {
    withScrollHeight(0, () => {
      const { baseElement } = render(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const content = baseElement.querySelector('.mn-sheet__content')!
      expect(content).not.toHaveAttribute('tabindex')
      expect(content).not.toHaveAttribute('role')
    })
  })

  it('makes the content region focusable and named when it overflows', () => {
    withScrollHeight(2000, () => {
      const { baseElement } = render(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const content = baseElement.querySelector('.mn-sheet__content')!
      expect(content).toHaveAttribute('tabindex', '0')
      expect(content).toHaveAttribute('role', 'group')
      expect(content).toHaveAccessibleName('Filter')
    })
  })

  // The dialog must have an accessible name — measured to fail axe
  // `aria-dialog-name` without one. Checked against the COMPUTED name, which
  // is strictly more capable than a type could be: `title=""` is a valid
  // string that names nothing, and was verified to still fail axe.
  it.each([
    ['neither prop', {}],
    ['empty-string title', { title: '' }],
    ['whitespace-only title', { title: '   ' }],
    ['empty-string ariaLabel', { ariaLabel: '' }],
  ])('warns when the computed name is empty — %s', (_name, props: Partial<SheetProps>) => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Sheet isOpen onClose={() => {}} {...props}>
        Body
      </Sheet>,
    )
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('no accessible name'))
    spy.mockRestore()
  })

  it('does not warn when a real name is supplied', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Sheet isOpen onClose={() => {}} ariaLabel="Choose a source">
        Body
      </Sheet>,
    )
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('no accessible name'))
    spy.mockRestore()
  })

  // Item 2: the headerless top inset is state-driven, not position-driven.
  it('marks the content region headerless only when no header renders', () => {
    const { baseElement, rerender } = render(
      <Sheet isOpen onClose={() => {}} ariaLabel="S">
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__content')).toHaveClass('mn-sheet__content--headerless')

    rerender(
      <Sheet isOpen onClose={() => {}} title="Filter">
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__content')).not.toHaveClass('mn-sheet__content--headerless')
  })

  // Item 3: the ✕ is explicit, never auto-suppressed by an unrelated prop.
  it('renders the close button by default and suppresses it on request', () => {
    const { baseElement, rerender } = render(
      <Sheet isOpen onClose={() => {}} title="Filter" headerIconLeft={<span>back</span>}>
        Body
      </Sheet>,
    )
    // headerIconLeft alone must NOT remove the ✕ — that would be silent.
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()

    rerender(
      <Sheet isOpen onClose={() => {}} title="Filter" headerIconLeft={<span>back</span>} showCloseButton={false}>
        Body
      </Sheet>,
    )
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    expect(baseElement.querySelector('.mn-sheet__header')).not.toBeNull()
    // Nothing left for the trail to hold, so it is not rendered at all.
    expect(baseElement.querySelector('.mn-sheet__header-trail')).toBeNull()
  })

  it('keeps an accessible name when headerIconLeft is the only header content', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { baseElement } = render(
      <Sheet
        isOpen
        onClose={() => {}}
        ariaLabel="Receipt options"
        headerIconLeft={<span>back</span>}
        showCloseButton={false}
      >
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__header')).not.toBeNull()
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Receipt options')
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('no accessible name'))
    expect(await axe(baseElement)).toHaveNoViolations()
    spy.mockRestore()
  })

  it('has no axe violations when named only by ariaLabel', async () => {
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} ariaLabel="Choose a source">
        Body
      </Sheet>,
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Choose a source')
    expect(await axe(baseElement)).toHaveNoViolations()
  })

  it('renders no actions region when no actions are passed', () => {
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} title="Filter">
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__actions')).toBeNull()
  })

  it('renders the home indicator by default and suppresses it on request', () => {
    const { baseElement, rerender } = render(
      <Sheet isOpen onClose={() => {}} title="Filter">
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__home-indicator')).not.toBeNull()

    rerender(
      <Sheet isOpen onClose={() => {}} title="Filter" showHomeIndicator={false}>
        Body
      </Sheet>,
    )
    expect(baseElement.querySelector('.mn-sheet__home-indicator')).toBeNull()
  })

  it('has no axe violations while open', async () => {
    // `baseElement`, not `container`: Sheet portals to document.body, so
    // `container` is empty and would assert nothing.
    const { baseElement } = render(
      <Sheet isOpen onClose={() => {}} title="Filter" actions={<button>Apply</button>}>
        Body
      </Sheet>,
    )
    expect(await axe(baseElement)).toHaveNoViolations()
  })

  // sizing (Gate 45) — the mechanism behind an in-place push: one Sheet stays
  // mounted, its props are swapped, and 'fill' raises it to the cap it already
  // declares. ONE overlay, ONE scrim, ONE dismiss gesture; a second stacked
  // sheet was rejected and none of these tests should ever mount two.
  //
  // Assertions go through `baseElement` for the portal reason above, and
  // through the MODIFIER rather than a measured height — vitest.config.ts sets
  // no test.css option, so no stylesheet is applied in jsdom and a height read
  // here would be meaningless. What the CSS does with the modifier is
  // documented in Sheet.css and belongs to a browser check, not to this file.
  describe('sizing', () => {
    it('omits the fill modifier by default', () => {
      const { baseElement } = render(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const panel = baseElement.querySelector('.mn-sheet__panel')
      expect(panel).not.toBeNull()
      expect(panel).not.toHaveClass('mn-sheet__panel--fill')
    })

    it('applies the fill modifier when sizing is fill', () => {
      const { baseElement } = render(
        <Sheet isOpen onClose={() => {}} title="Filter" sizing="fill">
          Body
        </Sheet>,
      )
      expect(baseElement.querySelector('.mn-sheet__panel')).toHaveClass('mn-sheet__panel--fill')
    })

    it("treats an explicit 'hug' as identical to omitting the prop", () => {
      const a = render(
        <Sheet isOpen onClose={() => {}} title="Filter" sizing="hug">
          Body
        </Sheet>,
      )
      const explicit = (a.baseElement.querySelector('.mn-sheet__panel') as HTMLElement).className
      a.unmount()

      const b = render(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const omitted = (b.baseElement.querySelector('.mn-sheet__panel') as HTMLElement).className

      expect(explicit).toBe(omitted)
    })

    // THE IN-PLACE PUSH, asserted as one mounted Sheet whose props change.
    // The dialog node must survive the swap — remounting it would be a second
    // overlay wearing the first one's markup, and would reset focus.
    it('raises and returns in place, on one dialog, across a prop swap', () => {
      const { baseElement, rerender } = render(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const before = baseElement.querySelector('.mn-sheet__panel')
      expect(before).not.toHaveClass('mn-sheet__panel--fill')

      rerender(
        <Sheet isOpen onClose={() => {}} title="Select merchant" sizing="fill">
          Merchants
        </Sheet>,
      )
      const during = baseElement.querySelector('.mn-sheet__panel')
      expect(during).toHaveClass('mn-sheet__panel--fill')
      expect(during).toBe(before)
      expect(baseElement.querySelectorAll('[role="dialog"]')).toHaveLength(1)

      rerender(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const after = baseElement.querySelector('.mn-sheet__panel')
      expect(after).not.toHaveClass('mn-sheet__panel--fill')
      expect(after).toBe(before)
    })

    // The scrim is Sheet's own Blanket. One sheet must never render two, and a
    // sizing change must not add one.
    it('renders exactly one scrim in either mode', () => {
      const { baseElement, rerender } = render(
        <Sheet isOpen onClose={() => {}} title="Filter">
          Body
        </Sheet>,
      )
      const hug = baseElement.querySelectorAll('.mn-blanket').length
      expect(hug).toBe(1)

      rerender(
        <Sheet isOpen onClose={() => {}} title="Select merchant" sizing="fill">
          Merchants
        </Sheet>,
      )
      expect(baseElement.querySelectorAll('.mn-blanket')).toHaveLength(hug)
    })

    // A back arrow in headerIconLeft with the ✕ suppressed is the picker's
    // header shape. showCloseButton is deliberately NOT auto-suppressed, so
    // this combination has to be asserted rather than assumed.
    it('supports a back-arrow header with the close button suppressed', () => {
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          title="Select merchant"
          sizing="fill"
          headerIconLeft={<button aria-label="Back">‹</button>}
          showCloseButton={false}
        >
          Merchants
        </Sheet>,
      )
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Select merchant' })).toBeInTheDocument()
    })

    it('has no axe violations while filling', async () => {
      const { baseElement } = render(
        <Sheet isOpen onClose={() => {}} title="Select merchant" sizing="fill">
          Merchants
        </Sheet>,
      )
      expect(await axe(baseElement)).toHaveNoViolations()
    })
  })
})
