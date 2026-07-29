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

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Label label="Amount" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
