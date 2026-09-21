import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { InlineMessage } from './InlineMessage'

describe('InlineMessage', () => {
  it('renders the title and the body', () => {
    render(<InlineMessage title="Couldn't read this photo">Try again in good light.</InlineMessage>)
    expect(screen.getByText("Couldn't read this photo")).toBeInTheDocument()
    expect(screen.getByText('Try again in good light.')).toBeInTheDocument()
  })

  it('defaults to the neutral tone, framed', () => {
    const { container } = render(<InlineMessage title="Add a receipt" />)
    expect((container.firstChild as HTMLElement).className).toBe(
      'mn-inline-message mn-inline-message--neutral mn-inline-message--framed',
    )
  })

  it('applies the warning tone modifier', () => {
    const { container } = render(<InlineMessage tone="warning" title="Couldn't read this photo" />)
    expect(container.firstChild).toHaveClass('mn-inline-message--warning')
    expect(container.firstChild).not.toHaveClass('mn-inline-message--neutral')
  })

  it('drops the framed modifier when isFramed is false', () => {
    const { container } = render(<InlineMessage title="Add a receipt" isFramed={false} />)
    expect(container.firstChild).not.toHaveClass('mn-inline-message--framed')
  })

  it('appends className after its own modifiers', () => {
    const { container } = render(<InlineMessage title="Add a receipt" className="extra" />)
    expect((container.firstChild as HTMLElement).className).toBe(
      'mn-inline-message mn-inline-message--neutral mn-inline-message--framed extra',
    )
  })

  it('renders the actions region when actions are supplied', () => {
    render(<InlineMessage title="Couldn't read this photo" actions={<button>Retake photo</button>} />)
    const action = screen.getByRole('button', { name: 'Retake photo' })
    expect(action.parentElement).toHaveClass('mn-inline-message__actions')
  })

  it('renders no body or actions region when they are omitted', () => {
    const { container } = render(<InlineMessage title="Add a receipt" />)
    expect(container.querySelector('.mn-inline-message__body')).toBeNull()
    expect(container.querySelector('.mn-inline-message__actions')).toBeNull()
  })

  it('is a group named by its title', () => {
    render(<InlineMessage title="Couldn't read this photo">Body</InlineMessage>)
    expect(screen.getByRole('group', { name: "Couldn't read this photo" })).toBeInTheDocument()
  })

  // ── NON-BLOCKING ─────────────────────────────────────────────────────────
  // The component's defining promise is that it never stands between the user
  // and the surrounding flow. Three separate ways an inline message can break
  // that, one test each, so a regression names which one it is.

  it('does not move focus when it renders', () => {
    const { rerender } = render(
      <div>
        <button>Before</button>
      </div>,
    )
    const before = screen.getByRole('button', { name: 'Before' })
    before.focus()
    rerender(
      <div>
        <button>Before</button>
        <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>}>
          Body
        </InlineMessage>
      </div>,
    )
    expect(document.activeElement).toBe(before)
  })

  it('carries no dialog semantics and hides nothing around it', () => {
    const { container } = render(
      <div>
        <button>Before</button>
        <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>} />
        <button>After</button>
      </div>,
    )
    expect(container.querySelector('[role="dialog"], [role="alertdialog"], [aria-modal]')).toBeNull()
    expect(container.querySelector('[inert], [aria-hidden="true"]')).toBeNull()
  })

  it('leaves the surrounding controls operable', () => {
    const onBefore = vi.fn()
    const onAfter = vi.fn()
    render(
      <div>
        <button onClick={onBefore}>Before</button>
        <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>} />
        <button onClick={onAfter}>After</button>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Before' }))
    fireEvent.click(screen.getByRole('button', { name: 'After' }))
    expect(onBefore).toHaveBeenCalledTimes(1)
    expect(onAfter).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in the neutral tone', async () => {
    const { container } = render(<InlineMessage title="Add a receipt">Snap one to keep it with this transaction.</InlineMessage>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations in the warning tone with an action', async () => {
    const { container } = render(
      <InlineMessage tone="warning" title="Couldn't read this photo" actions={<button>Retake photo</button>}>
        Try again with the receipt flat, in good light and in focus.
      </InlineMessage>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
