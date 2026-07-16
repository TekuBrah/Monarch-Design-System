import React, { useRef, useState } from 'react'
import './RangeSlider.css'
import { Field } from '../Field'

type Thumb = 'min' | 'max'

export interface RangeSliderProps {
  /** Current lower value (left thumb). */
  minValue: number
  /** Current upper value (right thumb). */
  maxValue: number
  /** Scale bounds. */
  min?: number
  max?: number
  step?: number
  onChange?: (minValue: number, maxValue: number) => void
  /** Formats a value for the tooltip and the Field inputs (e.g. `v => \`RM ${v}\``). */
  formatValue?: (value: number) => string
  showTooltip?: boolean
  showInputs?: boolean
  disabled?: boolean
  id?: string
  className?: string
  ariaLabelMin?: string
  ariaLabelMax?: string
}

const parseNum = (s: string): number | null => {
  const cleaned = s.replace(/[^0-9.-]/g, '')
  if (cleaned === '' || cleaned === '-') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function RangeSlider({
  minValue,
  maxValue,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatValue = v => String(v),
  showTooltip = true,
  showInputs = true,
  disabled = false,
  id,
  className,
  ariaLabelMin = 'Minimum',
  ariaLabelMax = 'Maximum',
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const minRef = useRef<HTMLDivElement>(null)
  const maxRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Thumb | null>(null)

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const snap = (v: number) => Math.round((v - min) / step) * step + min
  const toPct = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100)

  const commit = (which: Thumb, raw: number) => {
    const v = snap(raw)
    if (which === 'min') onChange?.(clamp(v, min, maxValue), maxValue)
    else onChange?.(minValue, clamp(v, minValue, max))
  }

  const valueFromClientX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect()
    return min + ((clientX - rect.left) / rect.width) * (max - min)
  }

  const startDrag = (which: Thumb) => (e: React.PointerEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setActive(which)
    ;(which === 'min' ? minRef : maxRef).current?.focus()
    const move = (ev: PointerEvent) => commit(which, valueFromClientX(ev.clientX))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // Clicking the track moves the nearest thumb.
  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (disabled) return
    const raw = valueFromClientX(e.clientX)
    const which: Thumb = Math.abs(raw - minValue) <= Math.abs(raw - maxValue) ? 'min' : 'max'
    setActive(which)
    ;(which === 'min' ? minRef : maxRef).current?.focus()
    commit(which, raw)
  }

  const handleKeyDown = (which: Thumb) => (e: React.KeyboardEvent) => {
    if (disabled) return
    const current = which === 'min' ? minValue : maxValue
    let next = current
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown': next = current - step; break
      case 'ArrowRight':
      case 'ArrowUp': next = current + step; break
      case 'Home': next = min; break
      case 'End': next = max; break
      default: return
    }
    e.preventDefault()
    commit(which, next)
  }

  const renderThumb = (which: Thumb) => {
    const value = which === 'min' ? minValue : maxValue
    const lo = which === 'min' ? min : minValue
    const hi = which === 'min' ? maxValue : max
    return (
      <div
        className="range-slider__thumb"
        ref={which === 'min' ? minRef : maxRef}
        style={{ left: `${toPct(value)}%` }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={value}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuetext={formatValue(value)}
        aria-label={which === 'min' ? ariaLabelMin : ariaLabelMax}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown(which)}
        onPointerDown={startDrag(which)}
        onFocus={() => setActive(which)}
        onBlur={() => setActive(a => (a === which ? null : a))}
      >
        <span className="range-slider__halo" aria-hidden="true" />
        {showTooltip && active === which && (
          <span className="range-slider__tooltip type-body-sm-semibold" role="status">
            {formatValue(value)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={['range-slider', disabled && 'range-slider--disabled', className].filter(Boolean).join(' ')} id={id}>
      <div className="range-slider__track" ref={trackRef} onPointerDown={handleTrackPointerDown}>
        <div
          className="range-slider__fill"
          style={{ left: `${toPct(minValue)}%`, width: `${toPct(maxValue) - toPct(minValue)}%` }}
        />
        {renderThumb('min')}
        {renderThumb('max')}
      </div>

      {showInputs && (
        <div className="range-slider__inputs">
          <div className="range-slider__input">
            <Field
              value={formatValue(minValue)}
              ariaLabel={ariaLabelMin}
              isDisabled={disabled}
              onChange={s => {
                const n = parseNum(s)
                if (n != null) commit('min', n)
              }}
            />
          </div>
          <div className="range-slider__input">
            <Field
              value={formatValue(maxValue)}
              ariaLabel={ariaLabelMax}
              isDisabled={disabled}
              onChange={s => {
                const n = parseNum(s)
                if (n != null) commit('max', n)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
