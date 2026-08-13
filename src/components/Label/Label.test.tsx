import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Label } from './Label'
import type { LabelSize } from './Label'

// size → typography class on the inner text span, per Label.tsx.
const SIZE_TYPE_CLASS: Record<LabelSize, string> = {
  m: 'type-body-m-semibold',
  s: 'type-body-sm-semibold',
}
const SIZES = Object.keys(SIZE_TYPE_CLASS) as LabelSize[]

// Deviation from the Button pattern: Label is a presentational <div> with no
// ARIA role (it is not a native <label> and controls nothing), so queries go
// through its text. Size lives on the inner text span, not the root.
describe('Label', () => {
  it('renders without crashing', () => {
    render(<Label label="Amount" />)
    expect(screen.getByText('Amount')).toBeInTheDocument()
  })

  it.each(SIZES)('renders size %s with its typography class', size => {
    render(<Label label="Amount" size={size} />)
    expect(screen.getByText('Amount')).toHaveClass(SIZE_TYPE_CLASS[size])
  })

  it('renders the required asterisk only when isRequired is set', () => {
    const { unmount } = render(<Label label="Amount" />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
    unmount()

    render(<Label label="Amount" isRequired />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  // `tone` governs BOTH halves: Figma binds text/subtle/default on the text node
  // and icon/subtle/default on the leading <element> slot (both #6b7786 in
  // light). jsdom loads no CSS, so these assert the class contract — the
  // computed-colour proof is the browser measurement recorded in the docs entry.
  it('emits no tone modifier by default, and none for tone="default"', () => {
    const { container, unmount } = render(<Label label="Amount" />)
    const unset = (container.firstChild as HTMLElement).className
    unmount()

    render(<Label label="Amount" tone="default" />)
    expect(unset).toBe('mn-label')
  })

  it('adds the subtle modifier only for tone="subtle"', () => {
    const { container } = render(<Label label="Amount" tone="subtle" />)
    expect(container.firstChild as HTMLElement).toHaveClass('mn-label--subtle')
  })

  it('scopes the tone modifier to the root, so it reaches text and icon alike', () => {
    const { container } = render(
      <Label label="Amount" tone="subtle" iconBefore={<svg data-testid="glyph" />} />,
    )
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('mn-label--subtle')
    // Both halves are descendants of the toned root, which is what
    // `.mn-label--subtle .mn-label__text` / `__icon` select on.
    expect(root.querySelector('.mn-label__text')).not.toBeNull()
    expect(root.querySelector('.mn-label__icon')).not.toBeNull()
  })

  it('still renders the required asterisk in both tones', () => {
    for (const tone of ['default', 'subtle'] as const) {
      const { container, unmount } = render(
        <Label label="Amount" isRequired tone={tone} />,
      )
      expect(container.querySelector('.mn-label__required')).not.toBeNull()
      unmount()
    }
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Label label="Amount" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
