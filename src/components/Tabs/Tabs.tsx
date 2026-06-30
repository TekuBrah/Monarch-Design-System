import React from 'react'
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
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map(t => (
        <Tab
          key={t.id}
          id={`tab-${t.id}`}
          label={t.label}
          isSelected={t.id === selectedId}
          ariaControls={`panel-${t.id}`}
          onClick={() => onChange?.(t.id)}
        />
      ))}
    </div>
  )
}
