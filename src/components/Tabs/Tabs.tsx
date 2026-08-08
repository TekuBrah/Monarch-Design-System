import React, { useRef } from 'react'
import { Tab } from '../Tab'
import './Tabs.css'

export interface TabItem {
  id: string
  label: string
}

export interface TabsProps {
  tabs: TabItem[]
  selectedId?: string
  onChange?: (id: string) => void
  ariaLabel?: string
  /** Overflow horizontally instead of shrinking, for bars wider than their
   *  container. The scrollbar indicator is hidden; scrolling still works. */
  isScrollable?: boolean
}

export function Tabs({ tabs, selectedId, onChange, ariaLabel, isScrollable = false }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // The single tabbable tab (roving tabindex): the selected one, or the first
  // if selection is absent/unmatched — a tablist must always have one tab stop.
  const activeId = tabs.some(t => t.id === selectedId) ? selectedId : tabs[0]?.id

  const focusTab = (id: string) => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(`#tab-${id}`)
    el?.focus()
    // Only Tabs knows which tab is selected, so keeping it on screen belongs
    // here rather than in a consumer wrapper. Optional call: jsdom does not
    // implement scrollIntoView.
    if (isScrollable) el?.scrollIntoView?.({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const base = Math.max(0, tabs.findIndex(t => t.id === activeId))
    const delta = e.key === 'ArrowRight' ? 1 : -1
    const nextId = tabs[(base + delta + tabs.length) % tabs.length].id
    onChange?.(nextId)
    focusTab(nextId)
  }

  return (
    <div
      className={['mn-tabs', isScrollable && 'mn-tabs--is-scrollable'].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={ariaLabel}
      ref={listRef}
      onKeyDown={handleKeyDown}
    >
      {tabs.map(t => (
        <Tab
          key={t.id}
          id={`tab-${t.id}`}
          label={t.label}
          isSelected={t.id === selectedId}
          tabIndex={t.id === activeId ? 0 : -1}
          onClick={() => onChange?.(t.id)}
        />
      ))}
    </div>
  )
}
