/**
 * Alert Banner Component
 * 
 * Displays alert messages with different severity levels and actions.
 * 
 * Features:
 * - Multiple severity levels (info, success, warning, error)
 * - Dismissible alerts
 * - Action buttons
 * - Icons and styling
 * - Analytics tracking
 */

import React, { useState } from 'react';
import { Button } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const AlertBanner = ({
  type = 'info', // 'info', 'success', 'warning', 'error'
  title,
  message,
  dismissible = true,
  actions = [],
  onDismiss,
  className = ''
}) => {
  const [visible, setVisible] = useState(true);
  const { trackUserEngagement } = useAnalyticsContext();

  const configs = {
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      titleColor: 'text-blue-900'
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      titleColor: 'text-green-900'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      titleColor: 'text-yellow-900'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      titleColor: 'text-red-900'
    }
  };

  const config = configs[type] || configs.info;

  const handleDismiss = () => {
    setVisible(false);
    trackUserEngagement('alert', 'dismiss', type, { title, message });
    if (onDismiss) onDismiss();
  };

  const handleActionClick = (action) => {
    trackUserEngagement('alert', 'action', action.id || 'unknown', { type, title });
    if (action.onClick) action.onClick();
  };

  if (!visible) return null;

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} ${config.textColor} 
      border rounded-lg p-4 ${className}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{config.icon}</span>
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm">{message}</p>
          )}
          
          {actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className={`
                -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 
                ${config.textColor} hover:bg-black hover:bg-opacity-10 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
              `}
            >
              <span className="sr-only">Dismiss</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
