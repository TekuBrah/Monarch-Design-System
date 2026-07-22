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
  const classes = ['card-action', className].filter(Boolean).join(' ')
  const content = (
    <>
      <span className="card-action__icon">{icon}</span>
      <div className="card-action__text">
        <span className="card-action__title type-body-m-semibold">{title}</span>
        <p className="card-action__description type-body-caption">{description}</p>
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
