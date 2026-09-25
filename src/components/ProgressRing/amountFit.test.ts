import { describe, it, expect } from 'vitest'
import { PROGRESS_RING_AMOUNT_LADDERS, fitAmountClass } from './amountFit'

const M = PROGRESS_RING_AMOUNT_LADDERS.m
const L = PROGRESS_RING_AMOUNT_LADDERS.l

// Poppins 600 advances per 1000 em, read from the installed woff2 at Gate 68
// (file and hash in amountFit.ts). Used only to re-derive the constants.
const ADV: Record<string, number> = { '4': 661, '9': 626, R: 641, M: 899, ' ': 238, ',': 254, '.': 260, '-': 583 }
const width = (s: string, px: number) => ([...s].reduce((t, c) => t + ADV[c], 0) * px) / 1000

/** Widest string the en-MY RM formatter produces at each length, |amount| <= 999,999.99. */
function widestByLength(): Map<number, string> {
  const fmt = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const out = new Map<number, string>()
  for (let d = 1; d <= 6; d++) {
    const pos = `RM ${fmt.format(Number(`${'4'.repeat(d)}.44`))}`
    for (const s of [pos, `-${pos}`]) {
      const prev = out.get(s.length)
      if (!prev || width(s, 1) > width(prev, 1)) out.set(s.length, s)
    }
  }
  return out
}

/** A string of exactly `n` characters, for boundary checks. */
const ofLength = (n: number) => 'x'.repeat(n)

describe('fitAmountClass', () => {
  it.each([
    // The ladder goes LAST: it.each fills the title's placeholders in row order,
    // and a ladder in second place rendered the title as "length NaN takes 11".
    ['m', 11, 'type-header-h6', 'type-body-m-semibold', M],
    ['l', 13, 'type-header-h5', 'type-header-h6', L],
  ] as const)('%s: length %i takes %s, one more takes %s', (_size, n, at, above, ladder) => {
    expect(fitAmountClass(ofLength(n), ladder)).toBe(at)
    expect(fitAmountClass(ofLength(n + 1), ladder)).toBe(above)
  })

  it.each([
    ['RM 999,999.99', 'type-body-m-semibold', 'type-header-h5'],
    ['-RM 999,999.99', 'type-body-m-semibold', 'type-header-h6'],
  ])('places the ceiling string %s at %s (m) and %s (l)', (s, m, l) => {
    expect(fitAmountClass(s, M)).toBe(m)
    expect(fitAmountClass(s, L)).toBe(l)
  })

  it('gives strings over the 14-character ceiling the last step', () => {
    expect(fitAmountClass('RM 4,444,444.44', M)).toBe('type-body-m-semibold')
    expect(fitAmountClass('-RM 44,444,444.44', L)).toBe('type-header-h6')
  })

  it('gives an empty string and RM 0.00 the resting step', () => {
    for (const s of ['', 'RM 0.00']) {
      expect(fitAmountClass(s, M)).toBe('type-header-h6')
      expect(fitAmountClass(s, L)).toBe('type-header-h5')
    }
  })

  // Gate 68 floors: the ceiling strings clear the inner stroke edge by >= 4px a
  // side at their step; the widest 14-character string by >= 2px at the floor.
  it.each([
    ['m', M, 162, [20, 16]],
    ['l', L, 220, [24, 20]],
  ] as const)('%s clears the inner edge at the ceiling and at the floor', (_size, ladder, w, sizes) => {
    const inner = 0.9 * w - 8
    const clearance = (s: string) => {
      const i = ladder.findIndex(step => step.className === fitAmountClass(s, ladder))
      return (inner - width(s, sizes[i])) / 2
    }
    expect(clearance('RM 999,999.99')).toBeGreaterThanOrEqual(4)
    expect(clearance('-RM 999,999.99')).toBeGreaterThanOrEqual(4)
    expect(clearance(widestByLength().get(14)!)).toBeGreaterThanOrEqual(2)
  })

  // The committed constants are re-derived here from the font advances, so an
  // edit to one without the arithmetic fails. Limit = inner stroke diameter
  // (0.9w - 8) minus 2 x 4px. No step on either ladder has a desktop override.
  it.each([
    ['m', M, 162, [20, 16]],
    ['l', L, 220, [24, 20]],
  ] as const)('the %s thresholds are the longest widest-strings that fit', (_size, ladder, w, sizes) => {
    const limit = 0.9 * w - 8 - 2 * 4
    const widest = widestByLength()
    ladder.slice(0, -1).forEach((step, i) => {
      expect(width(widest.get(step.maxLength)!, sizes[i])).toBeLessThanOrEqual(limit)
      expect(width(widest.get(step.maxLength + 1)!, sizes[i])).toBeGreaterThan(limit)
    })
  })
})
