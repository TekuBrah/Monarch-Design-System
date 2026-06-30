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
          key={i}
          className={`progress-stepper__step${i < currentStep ? ' progress-stepper__step--active' : ''}`}
        />
      ))}
    </div>
  )
}
