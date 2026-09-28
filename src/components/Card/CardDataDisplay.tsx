import './CardDataDisplay.css'

export interface CardDataDisplayProps {
  info: string
  content: string
  /** A second value line. Supported in both orientations. Figma's horizontal
   *  row (`886:7320`) draws only one value; in `'horizontal'` a `content2`
   *  renders as a third item in the same wrapping row, so it follows the value
   *  and wraps under it when the row is too narrow. */
  content2?: string
  /** `'vertical'` (default) stacks the caption over the value — the
   *  `card/data display` component as Figma draws it. `'horizontal'` is the
   *  wide label-left, value-right row Flow 11 draws as a DETACHED copy of that
   *  component (casestudy_02 `886:7320`, 311×56): the label takes the value's
   *  `type-body-m-semibold` in subtle text and may wrap, the value stays on one
   *  line. Added v2.7.0 (Gate 73, G5). */
  orientation?: 'vertical' | 'horizontal'
  /** Width behaviour. `'fixed'` (default) keeps Figma's 164px box with its
   *  128–300px range, so every existing call site is unchanged. `'fill'`
   *  releases the width and the 300px cap so the card takes its container's
   *  width — Flow 11's 147.5, 163.5 and 311px tiles and rows. Same prop, value
   *  names and modifier shape as `CardBalance.sizing` and
   *  `CardFeaturesAndEducation.sizing`. Added v2.7.0 (Gate 73, G5). */
  sizing?: 'fixed' | 'fill'
  className?: string
}

export function CardDataDisplay({
  info,
  content,
  content2,
  orientation = 'vertical',
  sizing = 'fixed',
  className,
}: CardDataDisplayProps) {
  const isHorizontal = orientation === 'horizontal'
  return (
    <div
      className={[
        'mn-card-data-display',
        isHorizontal && 'mn-card-data-display--horizontal',
        sizing === 'fill' && 'mn-card-data-display--fill',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={`mn-card-data-display__info ${
          isHorizontal ? 'type-body-m-semibold' : 'type-body-caption-semibold'
        }`}
      >
        {info}
      </span>
      <span className="mn-card-data-display__content type-body-m-semibold">{content}</span>
      {content2 && (
        <span className="mn-card-data-display__content type-body-m-semibold">{content2}</span>
      )}
    </div>
  )
}
