import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Icon } from '../Icon'
import { FilterChip } from './FilterChip'

// FilterChip summarises a filter in force and is dismissed to clear that facet.
// Its ROOT IS NOT INTERACTIVE — the only action the Figma source models is
// dismissal, so the only button in the tree is the dismiss affordance.
describe('FilterChip', () => {
  it('renders its label', () => {
    render(<FilterChip label="Groceries" />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('renders no interactive element when onDismiss is omitted (Figma Icon_right=False)', () => {
    render(<FilterChip label="Groceries" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a real dismiss BUTTON when onDismiss is supplied', () => {
    render(<FilterChip label="Groceries" onDismiss={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('gives the dismiss button an accessible name incorporating the label', () => {
    render(<FilterChip label="Groceries" onDismiss={() => {}} />)
    expect(screen.getByRole('button', { name: 'Remove Groceries' })).toBeInTheDocument()
  })

  it('lets dismissLabel override that accessible name', () => {
    render(<FilterChip label="Groceries" onDismiss={() => {}} dismissLabel="Clear category filter" />)
    expect(screen.getByRole('button', { name: 'Clear category filter' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove Groceries' })).not.toBeInTheDocument()
  })

  it('invokes onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(<FilterChip label="Groceries" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Groceries' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  // The four Figma variants are Icon_left x Icon_right; both slots drive a
  // data-* attribute that the CSS reads for the 12->8px padding tightening.
  it('flags the leading-icon slot on the root when icon is supplied', () => {
    const { container } = render(<FilterChip label="Groceries" icon={<Icon name="add" size="xs" />} />)
    expect(container.firstChild).toHaveAttribute('data-icon-left', 'true')
    expect(container.firstChild).toHaveAttribute('data-icon-right', 'false')
  })

  it('flags the trailing slot on the root when onDismiss is supplied', () => {
    const { container } = render(<FilterChip label="Groceries" onDismiss={() => {}} />)
    expect(container.firstChild).toHaveAttribute('data-icon-left', 'false')
    expect(container.firstChild).toHaveAttribute('data-icon-right', 'true')
  })

  it('flags both slots for the leading+trailing variant', () => {
    const { container } = render(
      <FilterChip label="Groceries" icon={<Icon name="add" size="xs" />} onDismiss={() => {}} />,
    )
    expect(container.firstChild).toHaveAttribute('data-icon-left', 'true')
    expect(container.firstChild).toHaveAttribute('data-icon-right', 'true')
  })

  // The leading glyph is decorative: it must not add to the chip's accessible
  // content, or a screen reader announces the icon's own text alongside the label.
  it('hides the leading icon from assistive technology', () => {
    const { container } = render(<FilterChip label="Groceries" icon={<Icon name="add" size="xs" />} />)
    expect(container.querySelector('.mn-filter-chip__icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('appends a consumer className without dropping the base class', () => {
    const { container } = render(<FilterChip label="Groceries" className="u-mt-2" />)
    expect(container.firstChild).toHaveClass('mn-filter-chip', 'u-mt-2')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<FilterChip label="Groceries" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations in the full leading+dismiss variant', async () => {
    const { container } = render(
      <FilterChip label="Groceries" icon={<Icon name="add" size="xs" />} onDismiss={() => {}} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
