import React from 'react'
import { ProgressBar } from '../ProgressBar'
import './CardGoals.css'

export interface CardGoalsProps {
  /** Full-bleed banner image — swappable slot. */
  image?: React.ReactNode
  title: string
  percentage: number
  current: string
  total: string
  onClick?: () => void
  className?: string
}

export function CardGoals({
  image,
  title,
  percentage,
  current,
  total,
  onClick,
  className,
}: CardGoalsProps) {
  const classes = ['card-goals', className].filter(Boolean).join(' ')
  const content = (
    <>
      {image && <div className="card-goals__image">{image}</div>}
      <div className="card-goals__content">
        <span className="card-goals__title type-body-m-medium">{title}</span>
        <ProgressBar value={percentage} current={current} total={total} />
      </div>
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
