import React from 'react'
import './ProgressStepper.css'

export interface ProgressStepperProps {
  totalSteps?: number
  currentStep?: number
}

export function ProgressStepper({ totalSteps = 7, currentStep = 1 }: ProgressStepperProps) {
  return (
    <div className="progress-stepper" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          // Steps are anonymous positional dots — no data exists beyond their
          // position, and the list never reorders/inserts, so there's no
          // stable id to key on. Prefixed rather than a bare index per house
          // convention, though the underlying stability guarantee is the same.
          key={`step-${i}`}
          className={`progress-stepper__step${i < currentStep ? ' progress-stepper__step--active' : ''}`}
        />
      ))}
    </div>
  )
}
