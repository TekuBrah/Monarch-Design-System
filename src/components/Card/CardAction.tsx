import React from 'react'
import './CardAction.css'

export interface CardActionProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  className?: string
}

export function CardAction({ icon, title, description, onClick, className }: CardActionProps) {
  const classes = ['mn-card-action', className].filter(Boolean).join(' ')
  const content = (
    <>
      <span className="mn-card-action__icon">{icon}</span>
      <div className="mn-card-action__text">
        <span className="mn-card-action__title type-body-m-semibold">{title}</span>
        <p className="mn-card-action__description type-body-caption">{description}</p>
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
