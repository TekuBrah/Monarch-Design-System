import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { OverlayHeader } from './OverlayHeader'
import { readGlobals, environment, resolveToken } from '../../test/tokenCss'

/* WHY THE GEOMETRY HERE IS COMPUTED, NOT MEASURED.

   `vitest.config.ts` sets no `test.css`, so CSS imports are stubbed and no
   stylesheet is ever applied in jsdom: every `getBoundingClientRect()` returns
   zeros and every `getComputedStyle()` width is ''. A test that asked the DOM
   where the title's centre is would therefore compare 0 with 0 and pass
   against ANY implementation — including one with no side slots at all, which
   is precisely the defect R2 exists to prevent.

   So centring is proved in two halves, and BOTH have to hold:

     1. the DOM half — both side slots are actually rendered, in all four icon
        combinations. This is what fails if the empty slot is removed.
     2. the CSS half — the two side tracks are the same width, read out of
        OverlayHeader.css and resolved through globals.css. This is what fails
        if the tracks are made unequal.

   The centre offset is then arithmetic over those two facts rather than a
   reading taken from a layout engine that is not running. The real browser
   measurement is recorded in CLAUDE.md. */

/* `parseBlocks` from ../../test/tokenCss is deliberately NOT used here: it
   keeps only custom properties, because it exists to read the generated token
   CSS. This file needs ordinary declarations (`grid-template-columns`,
   `padding`, `color`), so it does its own flat scan. OverlayHeader.css has no
   at-rules and therefore no nested braces — asserted below, so the assumption
   this scan rests on cannot rot silently. */
const CSS = readFileSync(
  resolve(process.cwd(), 'src/components/OverlayHeader/OverlayHeader.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const ENV = environment(readGlobals(), 'light')

const rule = (selector: string) => {
  const out = new Map<string, string>()
  let from = 0
  for (;;) {
    const open = CSS.indexOf('{', from)
    if (open === -1) break
    const close = CSS.indexOf('}', open)
    const selectors = CSS.slice(from, open)
      .trim()
      .split(',')
      .map(s => s.trim())
    if (selectors.includes(selector)) {
      for (const part of CSS.slice(open + 1, close).split(';')) {
        const i = part.indexOf(':')
        if (i < 0) continue
        out.set(part.slice(0, i).trim(), part.slice(i + 1).trim())
      }
    }
    from = close + 1
  }
  if (out.size === 0) throw new Error(`no rule for ${selector} in OverlayHeader.css`)
  return out
}
const px = (value: string) => {
  const token = value.match(/var\((--[a-z0-9-]+)\)/i)
  return parseFloat(token ? resolveToken(token[1], ENV) : value)
}

/** Figma 249:177: every variant of the component set is 375 wide. */
const FIGMA_WIDTH = 375
/** Figma 249:177: every variant is 64 tall. */
const FIGMA_HEIGHT = 64

const header = rule('.mn-overlay-header')
const side = rule('.mn-overlay-header__side')
const title = rule('.mn-overlay-header__title')

const tracks = (header.get('grid-template-columns') ?? '').split(/\s+(?![^(]*\))/).filter(Boolean)
const [padTop, padSide, padBottom] = (header.get('padding') ?? '').split(/\s+(?![^(]*\))/)

/** Where the title track's midpoint falls, relative to the header's own
 *  midpoint, at a given header width.
 *
 *  The two edges are computed SEPARATELY and from their own track — the left
 *  from `padding-left + track 1`, the right from `padding-right + track 3`.
 *  That is what makes this sensitive: written as
 *  `pad + slot + (W - 2*pad - 2*slot) / 2 - W / 2` it cancels to 0 for every
 *  input and asserts nothing at all. This form is 0 only while the two sides
 *  genuinely reserve the same space, which is the property R2 depends on. */
const offsetAt = (width: number) => {
  const left = px(padSide) + px(tracks[0])
  const right = px(padSide) + px(tracks[2])
  const titleCentre = (left + (width - right)) / 2
  return Math.abs(titleCentre - width / 2)
}

describe('OverlayHeader', () => {
  it('has no at-rules, which is what the flat CSS scan above assumes', () => {
    expect(CSS).not.toContain('@')
  })

  // R2 — the four icon combinations. Driven through the built-in controls,
  // because those are what the overlays actually pass.
  const COMBINATIONS: Array<[string, { onBack?: () => void; onClose?: () => void }]> = [
    ['neither icon', {}],
    ['left only', { onBack: () => {} }],
    ['right only', { onClose: () => {} }],
    ['both icons', { onBack: () => {}, onClose: () => {} }],
  ]

  describe('centring (R2)', () => {
    it.each(COMBINATIONS)('renders both side slots with %s', (_name, props) => {
      const { container } = render(<OverlayHeader title="Select a Merchant" {...props} />)
      expect(container.querySelector('.mn-overlay-header__side--start')).not.toBeNull()
      expect(container.querySelector('.mn-overlay-header__side--end')).not.toBeNull()
    })

    it('reserves the same fixed width on both sides, so the title track is centred', () => {
      expect(tracks).toHaveLength(3)
      const [start, middle, end] = tracks
      // Fixed, not flexible: `1fr auto 1fr` would read as equal here and still
      // drift, because `1fr` is `minmax(auto, 1fr)` and falls back to each
      // side's own min-content when space runs out.
      expect(start).not.toContain('fr')
      expect(end).not.toContain('fr')
      expect(start).toBe(end)
      expect(middle).toBe('minmax(0, 1fr)')

      expect(offsetAt(FIGMA_WIDTH)).toBeLessThanOrEqual(1)
    })

    it('holds that offset at the width the picker view actually renders at', () => {
      // The DS component set is 375 wide; the picker instance 1488:19175 is
      // 343. Both centre exactly in Figma (187.5 and 171.5), so the mechanism
      // must be width-independent.
      for (const width of [343, 375, 600]) {
        expect(offsetAt(width)).toBeLessThanOrEqual(1)
      }
    })
  })

  describe('the empty side slot (R2)', () => {
    it('is inert: hidden from assistive tech, with nothing focusable and no name', () => {
      const { container } = render(<OverlayHeader title="Filter" />)
      for (const selector of ['--start', '--end']) {
        const slot = container.querySelector(`.mn-overlay-header__side${selector}`)!
        expect(slot).toHaveAttribute('aria-hidden', 'true')
        expect(slot.querySelector('button, a[href], input, [tabindex]')).toBeNull()
        expect(slot.textContent).toBe('')
      }
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    it('drops aria-hidden from whichever side receives a control', () => {
      const { container } = render(
        <OverlayHeader title="Filter" onBack={() => {}} onClose={() => {}} />,
      )
      expect(container.querySelector('.mn-overlay-header__side--start')).not.toHaveAttribute(
        'aria-hidden',
      )
      expect(container.querySelector('.mn-overlay-header__side--end')).not.toHaveAttribute(
        'aria-hidden',
      )
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  describe('truncation and height (R3)', () => {
    it('truncates a long title on one line instead of wrapping', () => {
      expect(title.get('overflow')).toBe('hidden')
      expect(title.get('text-overflow')).toBe('ellipsis')
      expect(title.get('white-space')).toBe('nowrap')
      // Without this the ellipsis never engages: the track would be sized by
      // the title's min-content instead of clamping it.
      expect(title.get('min-width')).toBe('0')
      expect(tracks[1]).toBe('minmax(0, 1fr)')
    })

    it('stays 64 tall, which is what `nowrap` above is protecting', () => {
      // One line at the row height, plus Figma's 24/16 vertical padding.
      expect(px(padTop) + px(side.get('height')!) + px(padBottom)).toBe(FIGMA_HEIGHT)
    })

    it('renders a long title in the same single element as a short one', () => {
      const long = 'Select a Merchant from a very long list of merchant names'
      const { container } = render(<OverlayHeader title={long} onBack={() => {}} onClose={() => {}} />)
      const el = container.querySelector('.mn-overlay-header__title')!
      expect(el.tagName).toBe('H2')
      expect(el.textContent).toBe(long)
      expect(container.querySelectorAll('.mn-overlay-header__title')).toHaveLength(1)
    })
  })

  describe('neutral icons (R4)', () => {
    it('paints both controls with the default icon token, never the primary blue', () => {
      const control = rule('.mn-overlay-header__control')
      // Figma 249:177 binds both icon slots to `icon/default/default`.
      expect(control.get('color')).toBe('var(--mapped-icon-default-default)')
      expect(control.get('background')).toBe('none')
      expect(control.get('color')).not.toContain('primary')
    })
  })

  describe('composition', () => {
    it('centres a leading node with the title, and puts slot content at the edges', () => {
      const { container } = render(
        <OverlayHeader
          title="Filter"
          titleLeading={<span>lead</span>}
          leading={<span>L</span>}
          trailing={<button>Reset</button>}
          onClose={() => {}}
        />,
      )
      expect(container.querySelector('.mn-overlay-header__title-group')!.textContent).toBe(
        'leadFilter',
      )
      expect(container.querySelector('.mn-overlay-header__side--start')!.textContent).toBe('L')
      const end = container.querySelector('.mn-overlay-header__side--end')!
      expect(
        Array.from(end.querySelectorAll('button')).map(b => b.textContent || b.getAttribute('aria-label')),
      ).toEqual(['Reset', 'Close'])
    })

    it('renders no h2 when there is no title, so a dialog cannot dangle a reference at one', () => {
      const { container } = render(<OverlayHeader onClose={() => {}} />)
      expect(container.querySelector('.mn-overlay-header__title')).toBeNull()
      expect(container.querySelector('.mn-overlay-header__title-group')).not.toBeNull()
    })

    it('has no axe violations', async () => {
      const { container } = render(
        <OverlayHeader title="Select a Merchant" onBack={() => {}} onClose={() => {}} />,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
