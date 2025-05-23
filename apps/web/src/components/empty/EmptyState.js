/**
 * Empty State Component
 * 
 * Displays empty state messages with actions and illustrations.
 * 
 * Features:
 * - Customizable illustrations
 * - Action buttons
 * - Multiple layouts
 * - Responsive design
 * - Analytics tracking
 */

import React from 'react';
import { Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const EmptyState = ({
  icon = '📭',
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  actions = [],
  illustration,
  size = 'default', // 'small', 'default', 'large'
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'py-8',
          icon: 'text-4xl',
          title: 'text-lg',
          description: 'text-sm'
        };
      case 'large':
        return {
          container: 'py-16',
          icon: 'text-8xl',
          title: 'text-2xl',
          description: 'text-lg'
        };
      default:
        return {
          container: 'py-12',
          icon: 'text-6xl',
          title: 'text-xl',
          description: 'text-base'
        };
    }
  };

  const handleActionClick = (action) => {
    trackUserEngagement('empty_state', 'action', action.id || 'unknown', {
      title,
      actionLabel: action.label
    });
    
    if (action.onClick) {
      action.onClick();
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`
      text-center ${sizeClasses.container} ${className}
    `}>
      {/* Illustration or Icon */}
      <div className="mb-6">
        {illustration ? (
          <div className="mx-auto max-w-sm">
            {illustration}
          </div>
        ) : (
          <div className={`${sizeClasses.icon} mb-4`}>
            {icon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        <h3 className={`
          font-semibold text-gray-900 mb-2
          ${sizeClasses.title}
        `}>
          {title}
        </h3>
        
        <p className={`
          text-gray-600 mb-6
          ${sizeClasses.description}
        `}>
          {description}
        </p>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={() => handleActionClick(action)}
                variant={action.variant || (index === 0 ? 'default' : 'outline')}
                size={action.size || 'default'}
                disabled={action.disabled}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
