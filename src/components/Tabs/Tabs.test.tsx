import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Tabs } from './Tabs'
import type { TabItem } from './Tabs'

// TabItem is a data shape, not a variant union — Tabs is a composite container
// around Tab, so its axes are selection and the roving tabindex.
const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
]

describe('Tabs', () => {
  it('renders without crashing', () => {
    const { container } = render(<Tabs tabs={TABS} ariaLabel="Account sections" />)
    expect(container.firstChild).toHaveClass('mn-tabs')
  })

  it('exposes a named tablist', () => {
    render(<Tabs tabs={TABS} ariaLabel="Account sections" />)
    expect(screen.getByRole('tablist', { name: 'Account sections' })).toBeInTheDocument()
  })

  // Composite: one Tab child per item.
  it('renders one tab per item', () => {
    render(<Tabs tabs={TABS} ariaLabel="Account sections" />)
    expect(screen.getAllByRole('tab')).toHaveLength(TABS.length)
    for (const t of TABS) {
      expect(screen.getByRole('tab', { name: t.label })).toBeInTheDocument()
    }
  })

  it('marks only the selected tab through aria-selected', () => {
    render(<Tabs tabs={TABS} selectedId="activity" ariaLabel="Account sections" />)
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false')
  })

  // Roving tabindex: exactly one tab is in the tab order at a time.
  it('keeps exactly one tab in the tab order', () => {
    render(<Tabs tabs={TABS} selectedId="activity" ariaLabel="Account sections" />)
    const focusable = screen.getAllByRole('tab').filter(t => t.getAttribute('tabindex') === '0')
    expect(focusable).toHaveLength(1)
    expect(focusable[0]).toHaveAccessibleName('Activity')
  })

  it('invokes onChange with the clicked tab id', () => {
    const onChange = vi.fn()
    render(<Tabs tabs={TABS} selectedId="overview" onChange={onChange} ariaLabel="Account sections" />)
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }))
    expect(onChange).toHaveBeenCalledWith('settings')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Tabs tabs={TABS} ariaLabel="Account sections" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // Scrollable is opt-in — the default bar must be unchanged.
  describe('isScrollable', () => {
    it('is off by default', () => {
      const { container } = render(<Tabs tabs={TABS} ariaLabel="Account sections" />)
      expect(container.firstChild).not.toHaveClass('mn-tabs--is-scrollable')
    })

    it('applies the scrollable modifier when set', () => {
      const { container } = render(<Tabs tabs={TABS} isScrollable ariaLabel="Account sections" />)
      expect(container.firstChild).toHaveClass('mn-tabs', 'mn-tabs--is-scrollable')
    })

    // The reason the fix lives in Tabs rather than a consumer wrapper: only
    // Tabs knows which tab selection moved to.
    it('scrolls the newly selected tab into view on arrow navigation', () => {
      const scrollIntoView = vi.fn()
      // jsdom does not implement scrollIntoView — define it for this assertion.
      Element.prototype.scrollIntoView = scrollIntoView
      render(<Tabs tabs={TABS} selectedId="overview" isScrollable ariaLabel="Account sections" />)
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
      expect(scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: 'smooth', inline: 'nearest' }),
      )
    })

    it('does not scroll when not scrollable', () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      render(<Tabs tabs={TABS} selectedId="overview" ariaLabel="Account sections" />)
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
      expect(scrollIntoView).not.toHaveBeenCalled()
    })

    it('has no axe violations when scrollable', async () => {
      const { container } = render(<Tabs tabs={TABS} isScrollable ariaLabel="Account sections" />)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
