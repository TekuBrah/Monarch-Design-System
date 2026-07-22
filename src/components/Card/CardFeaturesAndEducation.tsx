import React from 'react'
import './CardFeaturesAndEducation.css'

export type CardFeaturesVariant = 'blue' | 'orange' | 'green' | 'purple' | 'outline'

export interface CardFeaturesAndEducationProps {
  variant?: CardFeaturesVariant
  icon: React.ReactNode
  title: string
  onClick?: () => void
  className?: string
}

export function CardFeaturesAndEducation({
  variant = 'blue',
  icon,
  title,
  onClick,
  className,
}: CardFeaturesAndEducationProps) {
  const classes = [
    'card-features',
    `card-features--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="card-features__icon">{icon}</span>
      <span className="card-features__title type-body-caption-medium">{title}</span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={classes}>{content}</div>
}
