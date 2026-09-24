import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { ChartLegendItem } from './ChartLegendItem'
import type { ChartLegendItemVariant } from './ChartLegendItem'
import { Icon } from '../Icon'

const VARIANTS: ChartLegendItemVariant[] = ['legend', 'contribution']
const props = { title: 'Groceries', amount: 'RM 240.00' }

const sha = (html: string) => createHash('sha256').update(html).digest('hex')
const LESS = renderToStaticMarkup(<Icon name="icon_chevron_expand_less" size="m" />)
const MORE = renderToStaticMarkup(<Icon name="icon_chevron_expand_more" size="m" />)
const chevronHtml = (root: Element) =>
  root.querySelector('.mn-chart-legend-item__trailing > .mn-element-wrapper')!.outerHTML

describe('ChartLegendItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChartLegendItem {...props} />)
    expect(container.firstChild).toHaveClass('mn-chart-legend-item')
  })

  it.each(VARIANTS)('renders the %s variant', variant => {
    const { container } = render(<ChartLegendItem {...props} variant={variant} />)
    expect(container.firstChild).toHaveClass(`mn-chart-legend-item--${variant}`)
  })

  it('renders its title and amount', () => {
    render(<ChartLegendItem {...props} />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('RM 240.00')).toBeInTheDocument()
  })

  it('upgrades to a real button when onClick is given', () => {
    render(<ChartLegendItem {...props} onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /Groceries/ })).toBeInTheDocument()
  })

  // Step 1.4 normalized this handler to () => void — verify the wiring actually fires.
  it('invokes onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ChartLegendItem {...props} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Groceries/ }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ChartLegendItem {...props} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // ── Gate 66 · G37 — controlled expanded state ───────────────────────
  describe('expanded (G37)', () => {
    const row = { title: 'Groceries', amount: 'RM 1,800.00', subtitle: '24.00%' }

    // Hashes captured from the v2.4.1 tree (820736e) before any edit.
    it.each([
      ['legend', <ChartLegendItem {...row} />, 'ec6042f4a5c2c23567d19dd5c54043072f83e636cd8a6f8b87e3853d2a3e3d2b'],
      ['legend + onClick', <ChartLegendItem {...row} iconColor="purple" onClick={() => {}} />, '960e139a563076c7cc7aa99ced112da227d14a02722d76d1aa38e75186a97314'],
      ['contribution', <ChartLegendItem variant="contribution" title="Groceries" amount="RM 1" subtitle="s" />, 'ad69906ca49eaa0d2f2c279aec8dd5f17ef7aeac4f47e5639668a2ca62f1aaa2'],
    ] as const)('undefined: the %s render is byte-identical to v2.4.1', (_n, el, hash) => {
      const { container } = render(el)
      expect(sha(container.innerHTML)).toBe(hash)
      expect(container.querySelector('[aria-expanded]')).toBeNull()
    })

    it('true: a button with aria-expanded="true", the up-chevron and the expanded modifier', () => {
      const { container } = render(<ChartLegendItem {...row} expanded />)
      const btn = screen.getByRole('button', { name: /Groceries/ })
      expect(btn).toHaveAttribute('aria-expanded', 'true')
      expect(btn).toHaveClass('mn-chart-legend-item--expanded')
      expect(chevronHtml(container)).toBe(LESS)
    })

    it('false: a button with aria-expanded="false", the down-chevron and no expanded modifier', () => {
      const { container } = render(<ChartLegendItem {...row} expanded={false} />)
      const btn = screen.getByRole('button', { name: /Groceries/ })
      expect(btn).toHaveAttribute('aria-expanded', 'false')
      expect(btn).not.toHaveClass('mn-chart-legend-item--expanded')
      expect(chevronHtml(container)).toBe(MORE)
    })

    it.each([true, false])('expanded=%s: onExpandedChange receives the negated value', expanded => {
      const onExpandedChange = vi.fn()
      render(<ChartLegendItem {...row} expanded={expanded} onExpandedChange={onExpandedChange} />)
      fireEvent.click(screen.getByRole('button', { name: /Groceries/ }))
      expect(onExpandedChange).toHaveBeenCalledTimes(1)
      expect(onExpandedChange).toHaveBeenCalledWith(!expanded)
    })

    it('renders controlsId as aria-controls, and only on a disclosure', () => {
      const { unmount } = render(<ChartLegendItem {...row} expanded={false} controlsId="groceries-list" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'groceries-list')
      unmount()
      const { container } = render(<ChartLegendItem {...row} onClick={() => {}} controlsId="groceries-list" />)
      expect(container.querySelector('[aria-controls]')).toBeNull()
    })

    it('reuses the single row button: onClick still fires, nothing interactive is nested', () => {
      const onClick = vi.fn()
      const onExpandedChange = vi.fn()
      const { container } = render(
        <ChartLegendItem {...row} expanded onClick={onClick} onExpandedChange={onExpandedChange} />,
      )
      expect(container.querySelectorAll('button')).toHaveLength(1)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onExpandedChange).toHaveBeenCalledWith(false)
    })

    it('is ignored on the contribution variant', () => {
      const { container } = render(<ChartLegendItem {...row} variant="contribution" expanded />)
      expect(container.querySelector('[aria-expanded]')).toBeNull()
      expect(container.firstChild).not.toHaveClass('mn-chart-legend-item--expanded')
    })

    it('has no axe violations expanded, with its controlled region rendered', async () => {
      const { container } = render(
        <>
          <ChartLegendItem {...row} expanded controlsId="groceries-list" />
          <div id="groceries-list">transactions</div>
        </>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
