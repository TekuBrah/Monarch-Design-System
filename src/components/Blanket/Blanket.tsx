import './Blanket.css'

export interface BlanketProps {
  onClick?: () => void
}

export function Blanket({ onClick }: BlanketProps) {
  return <div className="mn-blanket" onClick={onClick} />
}
