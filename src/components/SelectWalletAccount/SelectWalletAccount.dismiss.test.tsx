// Gate 93 DS (v2.12.0): SelectWalletAccount's user-driven dismissal and focus
// return, rulings R93D-5 to R93D-10. Every "does not close" / "stays" check
// runs after a fixed settle() with synchronous expects, never waitFor, so a
// retrying matcher cannot pass on a transient state.
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import { SelectWalletAccount } from './SelectWalletAccount'
import { Menu } from '../Menu'
import { MenuItem } from '../MenuItem'
import { Modal } from '../Modal'

const settle = () => act(() => new Promise(r => setTimeout(r, 60)))

const rows = (close: () => void) => [
  <MenuItem key="m" type="account" label="Main Account" isSelected onSelect={close} />,
  <MenuItem key="j" type="account" label="Joint Account" onSelect={close} />,
]

function Harness({
  onOpenChange = () => {},
  inModal = false,
  onModalClose = () => {},
  searchBar = false,
}: {
  onOpenChange?: (o: boolean) => void
  inModal?: boolean
  onModalClose?: () => void
  searchBar?: boolean
}) {
  const [open, setOpen] = useState(true)
  const swa = (
    <SelectWalletAccount
      ariaLabel="From"
      isOpen={open}
      onOpenChange={o => {
        onOpenChange(o)
        setOpen(o)
      }}
      menuSlot={
        <Menu
          listAriaLabel="Accounts"
          searchBar={searchBar}
          searchAriaLabel="Search accounts"
          slotContent={rows(() => setOpen(false))}
        />
      }
    />
  )
  return (
    <>
      <button type="button">outside</button>
      {inModal ? (
        <Modal isOpen onClose={onModalClose} title="Send money">
          {swa}
        </Modal>
      ) : (
        swa
      )}
      <button type="button">after</button>
    </>
  )
}

const trigger = () => screen.getByRole('button', { name: 'From' })
const outside = () => screen.getByRole('button', { name: 'outside' })
const after = () => screen.getByRole('button', { name: 'after' })
const joint = () => screen.getByRole('option', { name: /Joint/ })
const menuShown = () => document.querySelector('.mn-select-wallet-account__menu') !== null

// The four event types the component listens for while its menu is shown.
const OURS = new Set(['pointerdown', 'keydown', 'focusin', 'focusout'])
function spyListeners() {
  const spies = [
    vi.spyOn(document, 'addEventListener'),
    vi.spyOn(window, 'addEventListener'),
    vi.spyOn(document, 'removeEventListener'),
    vi.spyOn(window, 'removeEventListener'),
  ]
  const types = (i: number) =>
    spies[i].mock.calls.map(c => String(c[0])).filter(t => OURS.has(t))
  return {
    added: () => [...types(0), ...types(1)].sort(),
    removed: () => [...types(2), ...types(3)].sort(),
  }
}

describe('SelectWalletAccount dismissal (Gate 93)', () => {
  it('Escape from the trigger closes once and leaves focus on the trigger', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    trigger().focus()
    fireEvent.keyDown(trigger(), { key: 'Escape' })
    await settle()
    expect(spy.mock.calls).toEqual([[false]])
    expect(menuShown()).toBe(false)
    expect(document.activeElement).toBe(trigger())
  })

  it('Escape from inside the menu closes and returns focus to the trigger', async () => {
    render(<Harness />)
    const opt = joint()
    opt.focus()
    fireEvent.keyDown(opt, { key: 'Escape' })
    await settle()
    expect(menuShown()).toBe(false)
    expect(document.activeElement).toBe(trigger())
  })

  // Focus starts INSIDE the menu, the case where the close effect could pull
  // it to the trigger. fireEvent commits the close before anything else
  // moves focus, as Chrome does (see the Tab-out test). jsdom has no
  // mousedown default, so focus is left on <body>, where the menu's removal
  // put it; the browser then moves it to wherever the user pressed.
  it('an outside press closes and does not move focus', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    const triggerFocus = vi.fn()
    trigger().addEventListener('focus', triggerFocus)
    joint().focus()
    fireEvent.pointerDown(outside())
    await settle()
    expect(spy.mock.calls).toEqual([[false]])
    expect(triggerFocus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(document.body)
  })

  it('a press inside the menu does not close it', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    fireEvent.pointerDown(joint())
    await settle()
    expect(spy).not.toHaveBeenCalled()
    expect(menuShown()).toBe(true)
  })

  it('an Escape whose focus is outside the component is not claimed', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    outside().focus()
    fireEvent.keyDown(outside(), { key: 'Escape' })
    await settle()
    expect(spy).not.toHaveBeenCalled()
    expect(menuShown()).toBe(true)
  })

  it('a pick returns focus to the trigger', async () => {
    render(<Harness />)
    const opt = joint()
    opt.focus()
    fireEvent.click(opt)
    await settle()
    expect(menuShown()).toBe(false)
    expect(document.activeElement).toBe(trigger())
  })

  it('inside a Modal, the first Escape closes the menu and the second closes the Modal', async () => {
    const close = vi.fn()
    render(<Harness inModal onModalClose={close} />)
    trigger().focus()
    fireEvent.keyDown(trigger(), { key: 'Escape' })
    await settle()
    expect(menuShown()).toBe(false)
    expect(close).not.toHaveBeenCalled()
    fireEvent.keyDown(trigger(), { key: 'Escape' })
    await settle()
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('the trigger still toggles, and a closed menu stays closed', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    fireEvent.click(trigger())
    await settle()
    expect(spy.mock.calls).toEqual([[false]])
    expect(menuShown()).toBe(false)
    fireEvent.pointerDown(document.body)
    fireEvent.keyDown(trigger(), { key: 'Escape' })
    await settle()
    expect(spy.mock.calls).toEqual([[false]])
    expect(menuShown()).toBe(false)
  })

  it('uncontrolled: a click opens the menu and Escape closes it', async () => {
    render(
      <SelectWalletAccount
        ariaLabel="From"
        menuSlot={<Menu listAriaLabel="Accounts" searchBar={false} slotContent={rows(() => {})} />}
      />,
    )
    trigger().focus()
    fireEvent.click(trigger())
    await settle()
    expect(menuShown()).toBe(true)
    fireEvent.keyDown(trigger(), { key: 'Escape' })
    await settle()
    expect(menuShown()).toBe(false)
  })

  it('unmounting while open removes every listener it added', async () => {
    const spy = vi.fn()
    const listeners = spyListeners()
    const { unmount } = render(<Harness onOpenChange={spy} />)
    await settle()
    unmount()
    fireEvent.pointerDown(document.body)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    await settle()
    expect(spy).not.toHaveBeenCalled()
    expect(listeners.removed()).toEqual(listeners.added())
  })

  it('a closed render adds no document or window listener', async () => {
    const listeners = spyListeners()
    render(
      <SelectWalletAccount
        ariaLabel="From"
        isOpen={false}
        onOpenChange={() => {}}
        menuSlot={<Menu listAriaLabel="Accounts" searchBar={false} slotContent={rows(() => {})} />}
      />,
    )
    await settle()
    expect(listeners.added()).toEqual([])
  })

  // Chrome's order, measured live: focusout fires on the option, React
  // commits the close in a microtask, and only then does the new target get
  // focus. A plain `after().focus()` in jsdom fires focusout and focusin in
  // one synchronous step, so it would hide a close effect that steals focus.
  // fireEvent.focusOut (wrapped in act) commits the close first, as Chrome does.
  it('Tab out of the component closes the menu and leaves focus where Tab put it', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    const triggerFocus = vi.fn()
    trigger().addEventListener('focus', triggerFocus)
    joint().focus()
    fireEvent.focusOut(joint(), { relatedTarget: after() })
    after().focus()
    await settle()
    expect(spy.mock.calls).toEqual([[false]])
    expect(menuShown()).toBe(false)
    expect(triggerFocus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(after())
  })

  it('Tab from the search field to an option does not close the menu', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} searchBar />)
    screen.getByRole('textbox', { name: 'Search accounts' }).focus()
    joint().focus()
    await settle()
    expect(spy).not.toHaveBeenCalled()
    expect(menuShown()).toBe(true)
    expect(document.activeElement).toBe(joint())
  })

  it('focus leaving with no destination does not close the menu', async () => {
    const spy = vi.fn()
    render(<Harness onOpenChange={spy} />)
    const opt = joint()
    opt.focus()
    opt.blur()
    await settle()
    expect(document.activeElement).toBe(document.body)
    expect(spy).not.toHaveBeenCalled()
    expect(menuShown()).toBe(true)
  })
})
