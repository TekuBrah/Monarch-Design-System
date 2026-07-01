import React from 'react'
import './Loader.css'

export interface LoaderProps {
  ariaLabel?: string
}

export function Loader({ ariaLabel = 'Loading' }: LoaderProps) {
  return <span className="loader" role="status" aria-label={ariaLabel} />
}
