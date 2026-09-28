import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { IconObject } from './IconObject'
import type { IconObjectColor, IconObjectShape, IconObjectSize } from './IconObject'

const COLORS: IconObjectColor[] = [
  'teal', 'green', 'yellow', 'orange', 'lime', 'cyan', 'blue',
  'gray', 'red', 'purple', 'slate', 'violet', 'ai',
]
const SHAPES: IconObjectShape[] = ['circle', 'square']
const SIZES: IconObjectSize[] = ['xs', 's', 'm', 'l', 'xl', 'xxl']

describe('IconObject', () => {
  it('renders without crashing', () => {
    const { container } = render(<IconObject />)
    expect(container.firstChild).toHaveClass('mn-icon-object')
  })

  it.each(COLORS)('renders the %s color', color => {
    const { container } = render(<IconObject color={color} />)
    expect(container.firstChild).toHaveClass(`mn-icon-object--${color}`)
  })

  it.each(SHAPES)('renders the %s shape', shape => {
    const { container } = render(<IconObject shape={shape} />)
    expect(container.firstChild).toHaveClass(`mn-icon-object--${shape}`)
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<IconObject size={size} />)
    expect(container.firstChild).toHaveClass(`mn-icon-object--${size}`)
  })

  it('renders its children', () => {
    render(<IconObject><span>Child</span></IconObject>)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  // Decorative by default; it only becomes an image role once given a name.
  it('becomes a named img role only when ariaLabel is given', () => {
    const { unmount } = render(<IconObject />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    unmount()

    render(<IconObject ariaLabel="Wallet" />)
    expect(screen.getByRole('img', { name: 'Wallet' })).toBeInTheDocument()
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<IconObject />)
    expect(await axe(container)).toHaveNoViolations()
  })

  // G47 (Gate 73). jsdom applies no stylesheet, so the radius is read from the
  // CSS: every rule whose selector (one of a comma list) is a compound of
  // classes the root carries and that sets border-radius; the highest class
  // count wins and ties go to source order. Figma binds border-radius/sm to
  // the 16/20/24px squares and border-radius/md from 32px up.
  const SQUARE_RADII: Array<[IconObjectSize, string]> = [
    ['xs', 'var(--brand-scale-100)'],
    ['s', 'var(--brand-scale-100)'],
    ['m', 'var(--brand-scale-100)'],
    ['l', 'var(--brand-scale-200)'],
    ['xl', 'var(--brand-scale-200)'],
    ['xxl', 'var(--brand-scale-200)'],
  ]
  const squareRadius = (size: IconObjectSize) => {
    const css = readFileSync(resolve(process.cwd(), 'src/components/IconObject/IconObject.css'), 'utf8').replace(
      /\/\*[\s\S]*?\*\//g,
      '',
    )
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((m, order) =>
      m[1].split(',').map(selector => ({
        classes: selector.trim().split('.').filter(Boolean),
        radius: m[2].match(/border-radius:\s*([^;]+);/)?.[1].trim(),
        order,
      })),
    )
    const root = ['mn-icon-object', 'mn-icon-object--square', `mn-icon-object--${size}`]
    const hits = rules.filter(r => r.radius && r.classes.every(c => root.includes(c)))
    hits.sort((a, b) => a.classes.length - b.classes.length || a.order - b.order)
    return hits[hits.length - 1]?.radius
  }

  it.each(SQUARE_RADII)('rounds the %s square at %s', (size, radius) => {
    expect(squareRadius(size)).toBe(radius)
  })
})
