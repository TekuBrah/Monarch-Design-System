import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Modal } from './Modal'

// SMOKE SCOPE ONLY. Modal has real lifecycle — focus trap, Escape-to-close
// (implemented, per Step 0.5) and scrim-click dismissal. None of that is tested
// here by design; it is flagged as a candidate for deeper testing later, same
// as Blanket (Batch 1) and DatePicker/TimePicker (Batch 2).
describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when open', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Confirm' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('renders its children and footer content', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Confirm" footer={<span>Footer</span>}>
        Body
      </Modal>,
    )
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  // B3 / G12. Same prop name and shape as Sheet's, positioned inside the
  // centred cell so icon+title centre as one unit (Figma header 1321:12708).
  it('renders a leading header icon beside the title', () => {
    const { baseElement } = render(
      <Modal isOpen onClose={() => {}} title="Smart insights" headerIconLeft={<span>lead</span>}>
        Body
      </Modal>,
    )
    // REWRITTEN at Gate 73-B (R1). Old element `.mn-modal__title-group`, new
    // element `.mn-overlay-header__title-group`; Modal's own header markup is
    // retired in favour of the shared `OverlayHeader`. The ASSERTION IS
    // UNCHANGED — `headerIconLeft` still shares the centred cell with the
    // title, in that order, and the title still names the dialog.
    const group = baseElement.querySelector('.mn-overlay-header__title-group')!
    expect(group).toBeInTheDocument()
    expect(group.textContent).toBe('leadSmart insights')
    // The title still names the dialog — the wrapper must not break labelling.
    expect(screen.getByRole('dialog', { name: 'Smart insights' })).toBeInTheDocument()
  })

  // NO-CHANGE PROOF: the wrapper is new DOM for every existing call site, so
  // the no-icon render must keep the same title element, id and accessible name.
  it('keeps the title element and labelling unchanged when no icon is given', () => {
    const { baseElement } = render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    // REWRITTEN at Gate 73-B (R1). Old elements `.mn-modal__title-group` and
    // `h2.mn-modal__title`; new elements `.mn-overlay-header__title-group` and
    // `h2.mn-overlay-header__title`. The ASSERTION IS UNCHANGED and still does
    // the same job — with no icon the centred cell holds exactly one child,
    // that child is the <h2>, it still carries `type-body-m-semibold`, and the
    // dialog is still labelled by its id.
    const group = baseElement.querySelector('.mn-overlay-header__title-group')!
    const title = baseElement.querySelector('h2.mn-overlay-header__title')!
    expect(group.children).toHaveLength(1)
    expect(group.firstElementChild).toBe(title)
    expect(title).toHaveClass('type-body-m-semibold')
    expect(screen.getByRole('dialog', { name: 'Confirm' })).toHaveAttribute(
      'aria-labelledby',
      title.getAttribute('id'),
    )
  })

  it('has no axe violations while open', async () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Confirm">
        Body
      </Modal>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// G31 (Gate 62) — the open effect is keyed to OPENING, never to `onClose`
// identity. The defect this guards was invisible to a "where is focus now"
// assertion: the old teardown focused the opener and the re-run immediately
// focused the dialog again, so focus ENDED in the right place while the opener
// had been focused (and, in a browser, scrolled into view) on the way. The
// assertion is therefore on the opener's focus EVENTS, not on activeElement.
describe('Modal focus restore (G31)', () => {
  function setup() {
    const opener = document.createElement('button')
    opener.textContent = 'Open'
    document.body.appendChild(opener)
    opener.focus()
    const onOpenerFocus = vi.fn()
    opener.addEventListener('focus', onOpenerFocus)
    const first = vi.fn()
    const view = render(
      <Modal isOpen onClose={first} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    return { opener, onOpenerFocus, first, view }
  }

  it('does not refocus the opener when onClose changes identity while open', () => {
    const { opener, onOpenerFocus, view } = setup()
    expect(document.activeElement).not.toBe(opener)
    onOpenerFocus.mockClear()
    view.rerender(
      <Modal isOpen onClose={() => {}} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    expect(onOpenerFocus).not.toHaveBeenCalled()
    opener.remove()
  })

  it('calls the latest onClose on Escape after onClose changes identity', () => {
    const { opener, first, view } = setup()
    const latest = vi.fn()
    view.rerender(
      <Modal isOpen onClose={latest} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(latest).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
    opener.remove()
  })

  it('still restores focus to the opener when it closes', () => {
    const { opener, first, view } = setup()
    view.rerender(
      <Modal isOpen={false} onClose={first} title="Confirm">
        <p>Body</p>
      </Modal>,
    )
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
