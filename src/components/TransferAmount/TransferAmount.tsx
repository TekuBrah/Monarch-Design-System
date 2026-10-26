import './TransferAmount.css'

export type TransferAmountType = 'currency' | 'crypto'

export interface TransferAmountItem {
  /** Figma `Title`. Also the row's React key, so keep titles unique within one list. */
  title: string
  /** Figma `Amount`. */
  amount: string
  /** Figma `Amount details`, drawn before the amount with a `•` separator.
   *  Crypto only: ignored by the currency type, which Figma draws without it. */
  amountDetails?: string
}

export interface TransferAmountProps {
  /** Figma `Type`. `currency`: each row hugs its content, left-aligned.
   *  `crypto`: each row fills the width, title left and amount right. */
  type: TransferAmountType
  /** One row per item. Figma's `Rows` axis (Single / Multiple, the latter drawn
   *  with 4 identical rows) is derived from the count rather than set. */
  items: TransferAmountItem[]
}

/* Figma `<Transfer amount>` (191:12003). A description list: each row is a
   `<div>` holding a `<dt>` title and a `<dd>` amount, which is the valid way
   to group name-value pairs inside a `<dl>`.

   The `•` separator (U+2022) is decorative and `aria-hidden`, so a screen
   reader reads the details and the amount as two words, not three. */
export function TransferAmount({ type, items }: TransferAmountProps) {
  return (
    <dl className={`mn-transfer-amount mn-transfer-amount--${type}`}>
      {items.map(item => (
        <div key={item.title} className="mn-transfer-amount__row">
          <dt className="mn-transfer-amount__title type-body-caption">{item.title}</dt>
          <dd className="mn-transfer-amount__value">
            {type === 'crypto' && item.amountDetails && (
              <>
                <span className="mn-transfer-amount__details type-body-sm-semibold">{item.amountDetails}</span>
                <span className="mn-transfer-amount__separator type-body-caption" aria-hidden="true">
                  •
                </span>
              </>
            )}
            <span className="mn-transfer-amount__amount type-body-sm-semibold">{item.amount}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
