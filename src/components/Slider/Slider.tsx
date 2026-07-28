import React, { useRef } from 'react'
import './Slider.css'

export interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  isDisabled?: boolean
  id?: string
  className?: string
  ariaLabel?: string
  /** Human-readable value for assistive tech (e.g. "RM 40"). */
  ariaValueText?: string
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  isDisabled = false,
  id,
  className,
  ariaLabel,
  ariaValueText,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const snap = (v: number) => clamp(Math.round((v - min) / step) * step + min)
  const pct = max === min ? 0 : ((clamp(value) - min) / (max - min)) * 100

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = (clientX - rect.left) / rect.width
    onChange?.(snap(min + ratio * (max - min)))
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDisabled) return
    e.preventDefault()
    setFromClientX(e.clientX)
    thumbRef.current?.focus()
    const move = (ev: PointerEvent) => setFromClientX(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      thumbRef.current?.removeAttribute('data-active')
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    thumbRef.current?.setAttribute('data-active', 'true')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return
    let next = value
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown': next = value - step; break
      case 'ArrowRight':
      case 'ArrowUp': next = value + step; break
      case 'Home': next = min; break
      case 'End': next = max; break
      default: return
    }
    e.preventDefault()
    onChange?.(snap(next))
  }

  return (
    <div className={['mn-slider', isDisabled && 'mn-slider--disabled', className].filter(Boolean).join(' ')} id={id}>
      <div className="mn-slider__track" ref={trackRef} onPointerDown={handlePointerDown}>
        <div className="mn-slider__fill" style={{ width: `${pct}%` }} />
        <div
          className="mn-slider__thumb"
          ref={thumbRef}
          style={{ left: `${pct}%` }}
          role="slider"
          tabIndex={isDisabled ? -1 : 0}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={ariaValueText}
          aria-label={ariaLabel}
          aria-disabled={isDisabled || undefined}
          onKeyDown={handleKeyDown}
        >
          <span className="mn-slider__halo" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
