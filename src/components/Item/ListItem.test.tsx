import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ListItem } from './ListItem'
import type { ListItemType } from './ListItem'

const TYPES: ListItemType[] = ['default', 'profile', 'crypto']
const props = { title: 'Netflix', amount: 'RM 55.00' }

describe('ListItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<ListItem {...props} />)
    expect(container.firstChild).toHaveClass('mn-list-item')
  })

  it.each(TYPES)('renders the %s type', type => {
    const { container } = render(<ListItem {...props} type={type} />)
    expect(container.firstChild).toHaveClass(`mn-list-item--${type}`)
  })

  it('renders its title', () => {
    render(<ListItem {...props} />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<ListItem {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Netflix/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ListItem {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Netflix/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ListItem {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // Phase 5.4 — the defect this component set had: the crypto row drew a green
  // up-triangle unconditionally, so a decline rendered as a rise. Figma's own
  // Homepage_Crypto draws a down triangle for Ethereum, a state the shipped
  // component could not express. These three lock the fix in.
  describe('crypto trend direction', () => {
    const crypto = { ...props, type: 'crypto' as const, titleInfo: 'ETH' }

    it('renders a decline when trendDirection is "down"', () => {
      render(<ListItem {...crypto} amountInfo="-2.49%" trendDirection="down" />)
      const trend = screen.getByRole('img', { name: 'Decrease, 2.49%' })
      expect(trend).toHaveClass('mn-trend--down')
      // The sign stays visible even though it is stripped from the announcement.
      expect(screen.getByText('-2.49%')).toBeInTheDocument()
    })

    it('still renders a rise when trendDirection is omitted', () => {
      render(<ListItem {...crypto} amountInfo="10.2%" />)
      expect(screen.getByRole('img', { name: 'Increase, 10.2%' })).toHaveClass(
        'mn-trend--up',
      )
    })

    it('renders no trend indicator at all when amountInfo is absent', () => {
      const { container } = render(<ListItem {...crypto} />)
      expect(container.querySelector('.mn-trend')).toBeNull()
      expect(screen.queryByRole('img')).toBeNull()
    })
  })
})
