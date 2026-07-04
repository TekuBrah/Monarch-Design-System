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
}

export function Tabs({ tabs, selectedId, onChange, ariaLabel }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // The single tabbable tab (roving tabindex): the selected one, or the first
  // if selection is absent/unmatched — a tablist must always have one tab stop.
  const activeId = tabs.some(t => t.id === selectedId) ? selectedId : tabs[0]?.id

  const focusTab = (id: string) => {
    listRef.current
      ?.querySelector<HTMLButtonElement>(`#tab-${id}`)
      ?.focus()
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
      className="tabs"
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
