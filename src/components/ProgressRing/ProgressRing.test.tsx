import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ProgressRing } from './ProgressRing'
import type { ProgressRingSize } from './ProgressRing'
import { PROGRESS_RING_AMOUNT_LADDERS } from './amountFit'
import { environment, readGlobals, resolveValue } from '../../test/tokenCss'

const SIZES: ProgressRingSize[] = ['m', 'l']

describe('ProgressRing', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProgressRing value={65} />)
    expect(container.firstChild).toHaveClass('mn-progress-ring')
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<ProgressRing value={65} size={size} />)
    expect(container.firstChild).toHaveClass(`mn-progress-ring--${size}`)
  })

  it('exposes its value through the progressbar role', () => {
    render(<ProgressRing value={65} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '65')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<ProgressRing value={65} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// Gate 68 — the amount steps down to fit inside the stroke; its slot does not.
// ---------------------------------------------------------------------------

const RING_CSS = readFileSync(resolve(process.cwd(), 'src/components/ProgressRing/ProgressRing.css'), 'utf8')
const TYPE_CSS = readFileSync(resolve(process.cwd(), 'src/styles/typography.css'), 'utf8')

/** The declarations of the one rule whose selector is exactly `selector`. */
function ruleDecls(css: string, selector: string): Record<string, string> {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const hit = [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(m => m[1].trim() === selector)
  if (!hit) throw new Error(`no rule ${selector}`)
  return Object.fromEntries(
    hit[2].split(';').map(d => d.trim()).filter(Boolean).map(d => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]),
  )
}

/** Token values below and from 768px — the @media block overrides :root. */
function tokenEnv(desktop: boolean): Map<string, string> {
  const blocks = readGlobals()
  const env = environment(blocks, 'light')
  if (desktop) {
    for (const b of blocks) {
      if (b.selector === ':root' && b.context.some(c => c.includes('min-width: 768px'))) {
        for (const [n, v] of b.declarations) env.set(n, v)
      }
    }
  }
  return env
}

const px = (value: string, env: Map<string, string>) => parseFloat(resolveValue(value, env))

// Figma's fixed amount frames: 28px medium, 40px large (h4's line height at
// Figma's scale; 32px below 768px). Bound to tokens, not to the resting step.
const SLOT_HEIGHT: Record<ProgressRingSize, string> = {
  m: 'var(--responsive-font-headings-h5-line-height)',
  l: 'var(--responsive-font-headings-h4-line-height)',
}

// The resting class v2.5.0 rendered, and the one Figma rests at now. Mapping the
// second back to the first is the ONLY normalisation the v2.5.0 hashes allow.
const V250_REST: Record<ProgressRingSize, [now: string, then: string]> = {
  m: ['type-header-h6', 'type-header-h5'],
  l: ['type-header-h5', 'type-header-h4'],
}
const asV250 = (html: string, size: ProgressRingSize) =>
  html.replace(`mn-progress-ring__amount ${V250_REST[size][0]}"`, `mn-progress-ring__amount ${V250_REST[size][1]}"`)

describe('ProgressRing amount fit (Gate 68)', () => {
  const amountClass = (container: HTMLElement) =>
    container.querySelector('.mn-progress-ring__amount')!.className.replace('mn-progress-ring__amount ', '')

  it.each([
    ['m', 'RM 0.00', 'type-header-h6'],
    ['m', 'RM 876.24', 'type-header-h6'],
    ['m', 'RM 4,140.33', 'type-header-h6'],
    ['m', 'RM 999,999.99', 'type-body-m-semibold'],
    ['m', '-RM 999,999.99', 'type-body-m-semibold'],
    ['l', 'RM 0.00', 'type-header-h5'],
    ['l', 'RM 876.24', 'type-header-h5'],
    ['l', 'RM 4,140.33', 'type-header-h5'],
    ['l', 'RM 999,999.99', 'type-header-h5'],
    ['l', '-RM 999,999.99', 'type-header-h6'],
  ] as const)('size %s renders %s with %s', (size, amount, cls) => {
    const { container } = render(<ProgressRing value={50} size={size} amount={amount} />)
    expect(amountClass(container)).toBe(cls)
  })

  // Static, because jsdom applies no stylesheet. The slot's height is Figma's
  // fixed frame, bound to a line-height token, and every step's line height
  // fits inside it below AND from 768px, so each step centres in the same box.
  it.each(SIZES)('size %s: the slot is fixed at the Figma frame height and holds every step', size => {
    const slot = ruleDecls(RING_CSS, `.mn-progress-ring--${size} .mn-progress-ring__amount`)
    const base = ruleDecls(RING_CSS, '.mn-progress-ring__amount')
    expect(slot.height).toBe(SLOT_HEIGHT[size])
    expect(base['align-items']).toBe('center')
    for (const desktop of [false, true]) {
      const env = tokenEnv(desktop)
      const slotPx = px(slot.height, env)
      for (const step of PROGRESS_RING_AMOUNT_LADDERS[size]) {
        expect(px(ruleDecls(TYPE_CSS, `.${step.className}`)['line-height'], env)).toBeLessThanOrEqual(slotPx)
      }
    }
  })

  // The caption and the pill are measured identical across all three steps in
  // a real browser (Gate 68, CLAUDE.md). What jsdom can prove is the other
  // half: stepping changes ONLY the amount's class — nothing around it.
  it.each(SIZES)('size %s: stepping changes nothing but the amount class', size => {
    const strip = (html: string) =>
      html.replace(/_r_[0-9a-z]+_/g, '_r_ID_').replace(/(mn-progress-ring__amount) [\w-]+">[^<]*/, '$1">')
    const renders = PROGRESS_RING_AMOUNT_LADDERS[size].map(step =>
      strip(render(<ProgressRing value={50} size={size} amount={'x'.repeat(step.maxLength)} />).container.innerHTML),
    )
    expect(new Set(renders).size).toBe(1)
  })

  // Hashes captured from the untouched v2.5.0 tree before the first Gate 68
  // edit. An amount that fits the resting step renders byte-identically to
  // v2.5.0 except for that step's class, which now follows Figma (h6 / h5).
  it.each([
    ['m', 'RM 0.00', '8eb7b0c5cabb53e44cd794d0fcea850c11eb3aaa4f4eb0e7b75d6f0955dfd4b3'],
    ['m', 'RM 700', '446e6e100052562aa1d55c4ebc4c3ed01dff25af81e9608c13b288a175c2edcf'],
    ['m', 'RM 876.24', '2818b14b5799df0c96cfb14d01344f1f23094007822fc37eccfb7476b3b2d5c0'],
    ['l', 'RM 0.00', '0a6dd45471999afbcf4d3f87ca45af5bb43cc51760e92eaf78b3ba34c20a7a26'],
    ['l', 'RM 700', '19f4cb15e8619377c3a430002b81fa1ccafe1ebf46a700615e8bf152da2181e9'],
    ['l', 'RM 876.24', 'c38f2c8c50a44c9e0c4bbadd473aaac9ca1ff753371fa79ff5e83c0d9c0658c7'],
  ] as const)('size %s renders %s as v2.5.0 did but for the resting class', (size, amount, hash) => {
    const html = asV250(render(<ProgressRing value={50} size={size} amount={amount} />).container.innerHTML, size)
    expect(createHash('sha256').update(html.replace(/_r_[0-9a-z]+_/g, '_r_ID_')).digest('hex')).toBe(hash)
  })
})
