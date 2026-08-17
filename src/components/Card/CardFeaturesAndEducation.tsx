import React from 'react'
import './CardFeaturesAndEducation.css'

export type CardFeaturesVariant = 'blue' | 'orange' | 'green' | 'purple' | 'outline'

export interface CardFeaturesAndEducationProps {
  variant?: CardFeaturesVariant
  icon: React.ReactNode
  title: string
  onClick?: () => void
  className?: string
  /** 'fixed' (default) keeps the 109px Figma cap. 'fill' drops width and
      max-width so the parent's flex track decides. `min-width: 90px` is
      retained in BOTH modes. */
  sizing?: 'fixed' | 'fill'
}

export function CardFeaturesAndEducation({
  variant = 'blue',
  icon,
  title,
  onClick,
  className,
  sizing = 'fixed',
}: CardFeaturesAndEducationProps) {
  const classes = [
    'mn-card-features',
    `mn-card-features--${variant}`,
    sizing === 'fill' && 'mn-card-features--fill',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="mn-card-features__icon">{icon}</span>
      <span className="mn-card-features__title type-body-caption-medium">{title}</span>
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
