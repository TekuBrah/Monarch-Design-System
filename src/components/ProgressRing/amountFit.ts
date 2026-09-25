/**
 * Picks the type step for a formatted amount from its STRING LENGTH, never
 * from a DOM measurement. A measurement changes once the web font loads, which
 * makes the layout jump and flakes screenshot baselines; a length does not.
 *
 * Every `maxLength` below is the longest string whose WIDEST possible form
 * fits the slot's width limit. "Widest" is what the en-MY RM formatter can
 * produce at that length: `RM ` + every digit `4` (the widest digit) + the
 * grouping commas `Intl` inserts + `.dd`, with or without a leading `-`,
 * whichever is wider. Design ceiling: |amount| <= RM 999,999.99, i.e. 14
 * characters with the sign. Longer strings take the last step and are not
 * promised to fit.
 *
 * Widths are advance sums, no kerning, from the installed font — Gate 68:
 *   node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2
 *   @fontsource/poppins 5.2.7, SHA-256
 *   f4e80d9dfd374d02989b87a27b5ed4cb78fbb177c27f1478e9a8b0afb7513149
 * Advances per 1000 em: `4` 661, `R` 641, `M` 899, space/NBSP 238, `,` 254,
 * `.` 260, `-` 583. A font change invalidates every constant here.
 *
 * Widest string per length, in font units:
 *   9  "RM 444.44"        5343      12  "RM 44,444.44"    6919
 *   10 "-RM 444.44"       5926      13  "RM 444,444.44"   7580
 *   11 "RM 4,444.44"      6258      14  "-RM 444,444.44"  8163
 *
 * Width limit = inner stroke diameter (0.9 x ring width - 8px stroke) minus
 * 2 x --brand-scale-100 (4px): m 137.8 - 8 = 129.8px, l 190 - 8 = 182px.
 *
 * The resting step is Figma's (235:5710 medium draws h6, 235:5712 large draws
 * h5 — Teku's ruling, Gate 68 correction). Neither has a desktop override, so
 * every threshold holds at every viewport.
 *
 * m (162px ring):
 *   h6 20px: 11 -> 125.16 fits, 12 -> 138.38 does not       -> maxLength 11
 *   body-m-semibold 16px: 13 -> 121.28 fits, 14 -> 130.61 (last step; the
 *     widest 14 clears the inner edge by (137.8 - 130.61) / 2 = 3.60 >= 2)
 * l (220px ring):
 *   h5 24px: 13 -> 181.92 fits, 14 -> 195.91 does not       -> maxLength 13
 *   h6 20px: 14 -> 163.26 fits (last step)
 */

export interface AmountStep {
  /** The existing `.type-*` class this step renders with. */
  className: string
  /** Longest string this step takes. The last step takes everything longer. */
  maxLength: number
}

export const PROGRESS_RING_AMOUNT_LADDERS = {
  m: [
    { className: 'type-header-h6', maxLength: 11 },
    { className: 'type-body-m-semibold', maxLength: 14 },
  ],
  l: [
    { className: 'type-header-h5', maxLength: 13 },
    { className: 'type-header-h6', maxLength: 14 },
  ],
} as const satisfies Record<string, readonly AmountStep[]>

/** The class of the first step whose `maxLength` holds `amount`, else the last step's. */
export function fitAmountClass(amount: string, ladder: readonly AmountStep[]): string {
  const step = ladder.find(s => amount.length <= s.maxLength) ?? ladder[ladder.length - 1]
  return step.className
}
