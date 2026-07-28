import { Icon } from '../Icon'
import './StatusBar.css'

export type StatusBarMode = 'Light' | 'Dark'

export interface StatusBarProps {
  /** Fixed per-mode OS-chrome styling — not tied to the app's own light/dark theme. */
  mode?: StatusBarMode
  time?: string
  className?: string
}

export function StatusBar({ mode = 'Light', time = '9:41', className }: StatusBarProps) {
  return (
    <div
      className={['mn-status-bar', `mn-status-bar--${mode.toLowerCase()}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="mn-status-bar__time type-body-m-semibold">{time}</span>
      <div className="mn-status-bar__icons">
        <Icon name="signal_cellular_alt" size="m" />
        <Icon name="wifi" size="m" />
        <Icon name="icon_battery_horizontal" size="m" />
      </div>
    </div>
  )
}
