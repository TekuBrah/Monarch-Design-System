import { Icon } from '../Icon'
import { Link } from '../Link'
import { ProgressStepper } from '../ProgressStepper'
import './HeaderDefault.css'

export interface HeaderDefaultProps {
  title?: string
  /** Gate 97 (G65, Decision 32 = A): a second run of the title, drawn in
   *  `--mapped-text-primary-default` (Figma `text/primary/default`) after
   *  `title` with exactly one space between: `title="Send"
   *  titleAccent="Ethereum"` reads "Send Ethereum". It sits inside the title
   *  span, so the ellipsis still applies to the whole line. Ignored by the
   *  `isProgressStepper` variant, which renders no title. */
  titleAccent?: string
  subtitle?: string
  hasSubtitle?: boolean
  isProgressStepper?: boolean
  currentStep?: number
  totalSteps?: number
  /** Forwarded to the nested `ProgressStepper`, alongside `currentStep`/
   *  `totalSteps`. Omit to use its `Step X of Y` fallback. */
  stepperAriaLabel?: string
  actionLabel?: string
  onAction?: () => void
  onBack?: () => void
  className?: string
}

export function HeaderDefault({
  title = 'Title',
  titleAccent,
  subtitle = 'Subtitle',
  hasSubtitle = true,
  isProgressStepper = false,
  currentStep = 1,
  totalSteps = 7,
  stepperAriaLabel,
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
            <ProgressStepper totalSteps={totalSteps} currentStep={currentStep} ariaLabel={stepperAriaLabel} />
          </>
        ) : (
          <>
            <span className="mn-header-default__title type-body-m-semibold">
              {title}
              {titleAccent ? (
                <>
                  {' '}
                  <span className="mn-header-default__title-accent">{titleAccent}</span>
                </>
              ) : null}
            </span>
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
