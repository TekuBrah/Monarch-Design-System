import React from 'react'
import { Icon } from '../Icon'
import { Avatar } from '../Avatar'
import { Field } from '../Field'
import { Badge } from '../Badge'
import { StatusBar } from '../StatusBar'
import './HeaderBg.css'

export type HeaderBgVariant = 'default' | 'noSearchBar' | 'compact'

export interface HeaderBgProps {
  variant?: HeaderBgVariant
  /** Full-bleed background — swappable slot (image, gradient, video, etc). */
  background: React.ReactNode
  /** Shown in `default`/`noSearchBar`. */
  greeting?: string
  /** Shown in `compact`. */
  title?: string
  avatarSrc?: string
  avatarName?: string
  statusBarTime?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  hasNotification?: boolean
  onNotificationsClick?: () => void
  className?: string
}

export function HeaderBg({
  variant = 'default',
  background,
  greeting = 'Hi, Margaret👋',
  title = 'Finance',
  avatarSrc,
  avatarName,
  statusBarTime = '09:30',
  searchValue,
  onSearchChange,
  hasNotification = true,
  onNotificationsClick,
  className,
}: HeaderBgProps) {
  const isCompact = variant === 'compact'
  const showSearch = variant === 'default'

  const notifyButton = (
    <button
      type="button"
      className="header-bg__notify"
      aria-label="Notifications"
      onClick={onNotificationsClick}
    >
      <Icon name="notifications" size="l" />
      {hasNotification && (
        <span className="header-bg__notify-dot">
          <Badge type="dot" appearance="important" />
        </span>
      )}
    </button>
  )

  return (
    <header
      className={['header-bg', isCompact && 'header-bg--compact', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="header-bg__background" aria-hidden="true">
        {background}
      </div>
      {isCompact && <div className="header-bg__scrim" aria-hidden="true" />}

      <div className="header-bg__content">
        <StatusBar mode="Dark" time={statusBarTime} />

        {isCompact ? (
          <div className="header-bg__row header-bg__row--title">
            <Avatar size="m" src={avatarSrc} name={avatarName} />
            <span className="header-bg__title type-body-m-semibold">{title}</span>
            {notifyButton}
          </div>
        ) : (
          <div className="header-bg__row header-bg__row--greeting">
            <div className="header-bg__greeting-group">
              <Avatar size="m" src={avatarSrc} name={avatarName} />
              <span className="header-bg__greeting type-header-h6">{greeting}</span>
            </div>
            {notifyButton}
          </div>
        )}

        {showSearch && (
          <div className="header-bg__search">
            <Field
              leadingIcon={<Icon name="search" size="m" />}
              placeholder="Search"
              value={searchValue}
              onChange={onSearchChange}
              ariaLabel="Search"
            />
          </div>
        )}
      </div>
    </header>
  )
}
