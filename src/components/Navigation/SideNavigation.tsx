import React from 'react'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { Logo } from '../Logo'
import { Field } from '../Field'
import { Divider } from '../Divider'
import { Avatar } from '../Avatar'
import './SideNavigation.css'

export interface SideNavItem {
  id: string
  icon: IconName
  label: string
  isSelected?: boolean
  /** Optional divider + title rendered above this item (Figma `nav/<section header>`). */
  sectionTitle?: string
}

export interface SideNavigationProps {
  isCompact?: boolean
  items: SideNavItem[]
  utilityItems?: SideNavItem[]
  profileName?: string
  profileEmail?: string
  profileAvatarSrc?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSelect?: (id: string) => void
  /** Expand/collapse trigger — not in the Figma source, added for usability.
   *  Omit to hide the trigger entirely (e.g. when compact state is fixed). */
  onToggleCompact?: () => void
  className?: string
}

function SideNavTab({
  item,
  isCompact,
  onSelect,
}: {
  item: SideNavItem
  isCompact: boolean
  onSelect?: (id: string) => void
}) {
  return (
    <>
      {item.sectionTitle && (
        <div className="side-nav__section-header">
          <span className="side-nav__section-title type-body-caption-semibold">
            {item.sectionTitle}
          </span>
        </div>
      )}
      <button
        type="button"
        className={[
          'side-nav__tab',
          item.isSelected && 'side-nav__tab--selected',
          isCompact && 'side-nav__tab--compact',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-current={item.isSelected ? 'page' : undefined}
        onClick={() => onSelect?.(item.id)}
      >
        <Icon name={item.icon} size="l" />
        {!isCompact && (
          <span className="side-nav__tab-label type-body-m">{item.label}</span>
        )}
      </button>
    </>
  )
}

export function SideNavigation({
  isCompact = false,
  items,
  utilityItems,
  profileName,
  profileEmail,
  profileAvatarSrc,
  searchValue,
  onSearchChange,
  onSelect,
  onToggleCompact,
  className,
}: SideNavigationProps) {
  return (
    <aside
      className={[
        'side-nav',
        isCompact && 'side-nav--compact',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {onToggleCompact && (
        <button
          type="button"
          className="side-nav__toggle"
          onClick={onToggleCompact}
          aria-expanded={!isCompact}
          aria-label={isCompact ? 'Expand navigation' : 'Collapse navigation'}
        >
          <Icon name={isCompact ? 'chevron_right' : 'chevron_left'} size="s" />
        </button>
      )}

      <div className="side-nav__brand">
        <div className="side-nav__logo-row">
          <Logo name="monarch_logo_style_thick" size="xs" />
          {!isCompact && (
            <span className="side-nav__wordmark type-body-lg-medium">Monarch</span>
          )}
        </div>
        <Field
          isCompact={isCompact}
          leadingIcon={<Icon name="search" size="m" />}
          placeholder="Search"
          value={searchValue}
          onChange={onSearchChange}
          ariaLabel="Search"
        />
      </div>

      <nav className="side-nav__items" aria-label="Primary">
        {items.map(item => (
          <SideNavTab key={item.id} item={item} isCompact={isCompact} onSelect={onSelect} />
        ))}
      </nav>

      <div className="side-nav__footer">
        {utilityItems && utilityItems.length > 0 && (
          <nav className="side-nav__items" aria-label="Utility">
            {utilityItems.map(item => (
              <SideNavTab key={item.id} item={item} isCompact={isCompact} onSelect={onSelect} />
            ))}
          </nav>
        )}
        {profileName && (
          <>
            <Divider weight={1} orientation="horizontal" />
            <div className="side-nav__profile">
              <Avatar size="l" src={profileAvatarSrc} name={profileName} />
              {!isCompact && (
                <div className="side-nav__profile-text">
                  <p className="type-header-h6">{profileName}</p>
                  {profileEmail && <p className="type-body-caption">{profileEmail}</p>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
