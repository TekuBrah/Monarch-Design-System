import './CardDataDisplay.css'

export interface CardDataDisplayProps {
  info: string
  content: string
  content2?: string
  className?: string
}

export function CardDataDisplay({ info, content, content2, className }: CardDataDisplayProps) {
  return (
    <div className={['mn-card-data-display', className].filter(Boolean).join(' ')}>
      <span className="mn-card-data-display__info type-body-caption-semibold">{info}</span>
      <span className="mn-card-data-display__content type-body-m-semibold">{content}</span>
      {content2 && (
        <span className="mn-card-data-display__content type-body-m-semibold">{content2}</span>
      )}
    </div>
  )
}
