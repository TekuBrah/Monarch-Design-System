import { Icon } from '../Icon'
import { Link } from '../Link'
import { ProgressStepper } from '../ProgressStepper'
import './HeaderDefault.css'

export interface HeaderDefaultProps {
  title?: string
  subtitle?: string
  hasSubtitle?: boolean
  isProgressStepper?: boolean
  currentStep?: number
  totalSteps?: number
  actionLabel?: string
  onAction?: () => void
  onBack?: () => void
  className?: string
}

export function HeaderDefault({
  title = 'Title',
  subtitle = 'Subtitle',
  hasSubtitle = true,
  isProgressStepper = false,
  currentStep = 1,
  totalSteps = 7,
  actionLabel,
  onAction,
  onBack,
  className,
}: HeaderDefaultProps) {
  return (
    <header className={['mn-header-default', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="mn-header-default__back"
        aria-label="Back"
        onClick={onBack}
      >
        <Icon name="arrow_back" size="m" />
      </button>

      <div className="mn-header-default__center">
        {isProgressStepper ? (
          <>
            {hasSubtitle && (
              <span className="mn-header-default__subtitle type-body-caption-semibold">
                {subtitle}
              </span>
            )}
            <ProgressStepper totalSteps={totalSteps} currentStep={currentStep} />
          </>
        ) : (
          <>
            <span className="mn-header-default__title type-body-m-semibold">{title}</span>
            {hasSubtitle && (
              <span className="mn-header-default__subtitle type-body-caption">{subtitle}</span>
            )}
          </>
        )}
      </div>

      <div className="mn-header-default__action">
        {actionLabel && (
          <Link
            label={actionLabel}
            appearance="default"
            size="m"
            iconBefore={null}
            iconAfter={null}
            onClick={e => {
              e.preventDefault()
              onAction?.()
            }}
          />
        )}
      </div>
    </header>
  )
}
