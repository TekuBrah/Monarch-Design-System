import React from 'react'
import './Blanket.css'

export interface BlanketProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

export function Blanket({ onClick }: BlanketProps) {
  return <div className="blanket" onClick={onClick} />
}
