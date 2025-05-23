/**
 * Step Indicator Component
 * 
 * Displays progress through a multi-step process.
 * 
 * Features:
 * - Visual step progression
 * - Clickable steps
 * - Status indicators
 * - Responsive design
 * - Analytics tracking
 */

import React from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const StepIndicator = ({
  steps = [],
  currentStep = 0,
  onStepClick,
  allowClickPrevious = true,
  showLabels = true,
  orientation = 'horizontal', // 'horizontal', 'vertical'
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();

  const handleStepClick = (stepIndex, step) => {
    if (!onStepClick) return;
    
    // Allow clicking on previous steps or current step
    if (allowClickPrevious && stepIndex <= currentStep) {
      trackUserEngagement('steps', 'navigate', 'click', {
        fromStep: currentStep,
        toStep: stepIndex,
        stepLabel: step.label
      });
      onStepClick(stepIndex);
    }
  };

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (index) => {
    const status = getStepStatus(index);
    const isClickable = allowClickPrevious && index <= currentStep && onStepClick;
    
    const baseClasses = `
      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
      ${isClickable ? 'cursor-pointer' : 'cursor-default'}
    `;

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500 text-white`;
      case 'current':
        return `${baseClasses} bg-orange-500 text-white`;
      case 'upcoming':
        return `${baseClasses} bg-gray-200 text-gray-600`;
      default:
        return baseClasses;
    }
  };

  const getConnectorClasses = (index) => {
    const isCompleted = index < currentStep;
    
    if (orientation === 'vertical') {
      return `
        w-0.5 h-8 mx-auto
        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
      `;
    }
    
    return `
      flex-1 h-0.5
      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
    `;
  };

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            {/* Step Circle */}
            <div
              onClick={() => handleStepClick(index, step)}
              className={getStepClasses(index)}
            >
              {getStepStatus(index) === 'completed' ? (
                '✓'
              ) : (
                index + 1
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              {showLabels && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 mt-8">
                <div className={getConnectorClasses(index)} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => handleStepClick(index, step)}
              className={getStepClasses(index)}
            >
              {getStepStatus(index) === 'completed' ? (
                '✓'
              ) : (
                index + 1
              )}
            </div>
            
            {showLabels && (
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-600 mt-1 max-w-24">
                    {step.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div className={`mx-4 ${getConnectorClasses(index)}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
