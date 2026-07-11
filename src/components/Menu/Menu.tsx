import React from 'react'
import './Menu.css'
import { Field } from '../Field'
import { Icon } from '../Icon'

export interface MenuProps {
  /** Hide to use Menu as a plain option-list dropdown with no search field. */
  searchBar?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchAriaLabel?: string
  /** App-provided option list — typically a stack of `MenuItem` rows. */
  slotContent?: React.ReactNode
  id?: string
  className?: string
}

export function Menu({
  searchBar = true,
  searchPlaceholder = 'Placeholder',
  searchValue,
  onSearchChange,
  searchAriaLabel = 'Search',
  slotContent,
  id,
  className,
}: MenuProps) {
  return (
    <div id={id} className={['menu', className].filter(Boolean).join(' ')}>
      {searchBar && (
        <div className="menu__search">
          <Field
            leadingIcon={<Icon name="search" size="s" />}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            ariaLabel={searchAriaLabel}
          />
        </div>
      )}
      {slotContent}
    </div>
  )
}
