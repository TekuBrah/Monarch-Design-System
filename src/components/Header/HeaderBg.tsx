import React from 'react'
import { Icon } from '../Icon'
import { Avatar } from '../Avatar'
import { Field } from '../Field'
import { Badge } from '../Badge'
import { StatusBar } from '../StatusBar'
import './HeaderBg.css'

export type HeaderBgVariant = 'default' | 'noSearchBar' | 'compact'

interface HeaderBgBaseProps {
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

/** The avatar tap hook (v2.9.0). Both props or neither — a handler with no
 *  accessible name, or a name with nothing to name, is a type error. */
type HeaderBgAvatarTapProps =
  | {
      onAvatarClick?: undefined
      avatarAriaLabel?: undefined
    }
  | {
      /** Renders the avatar inside a native `<button type="button">`. Omit it and
       *  the avatar renders exactly as it did before this prop existed. */
      onAvatarClick: () => void
      /** The button's accessible name. Required with `onAvatarClick`; the
       *  consumer supplies the words. The avatar image inside is `alt=""`, so
       *  the name is announced once. */
      avatarAriaLabel: string
    }

export type HeaderBgProps = HeaderBgBaseProps & HeaderBgAvatarTapProps

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
  onAvatarClick,
  avatarAriaLabel,
  className,
}: HeaderBgProps) {
  const isCompact = variant === 'compact'
  const showSearch = variant === 'default'

  // No handler, no button: the bare Avatar below is the v2.8.0 markup exactly.
  const avatar = onAvatarClick ? (
    <button
      type="button"
      className="mn-header-bg__avatar"
      aria-label={avatarAriaLabel}
      onClick={onAvatarClick}
    >
      <Avatar size="m" src={avatarSrc} name={avatarName} alt="" />
    </button>
  ) : (
    <Avatar size="m" src={avatarSrc} name={avatarName} />
  )

  const notifyButton = (
    <button
      type="button"
      className="mn-header-bg__notify"
      aria-label="Notifications"
      onClick={onNotificationsClick}
    >
      <Icon name="notifications" size="l" />
      {hasNotification && (
        <span className="mn-header-bg__notify-dot">
          <Badge type="dot" appearance="important" />
        </span>
      )}
    </button>
  )

  return (
    <header
      className={['mn-header-bg', isCompact && 'mn-header-bg--compact', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mn-header-bg__background" aria-hidden="true">
        {background}
      </div>
      {isCompact && <div className="mn-header-bg__scrim" aria-hidden="true" />}

      <div className="mn-header-bg__content">
        <StatusBar mode="Dark" time={statusBarTime} />

        {isCompact ? (
          <div className="mn-header-bg__row mn-header-bg__row--title">
            {avatar}
            <span className="mn-header-bg__title type-body-m-semibold">{title}</span>
            {notifyButton}
          </div>
        ) : (
          <div className="mn-header-bg__row mn-header-bg__row--greeting">
            <div className="mn-header-bg__greeting-group">
              {avatar}
              <span className="mn-header-bg__greeting type-header-h6">{greeting}</span>
            </div>
            {notifyButton}
          </div>
        )}

        {showSearch && (
          <div className="mn-header-bg__search">
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
