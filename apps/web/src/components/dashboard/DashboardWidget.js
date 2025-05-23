/**
 * Dashboard Widget Component
 * 
 * Reusable widget component for dashboard layouts with customizable
 * content, actions, and styling options.
 * 
 * Features:
 * - Flexible content rendering
 * - Header with title and actions
 * - Loading and error states
 * - Responsive design
 * - Customizable styling
 * - Analytics tracking
 */

import React from 'react';
import { Card, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const DashboardWidget = ({
  title,
  subtitle,
  icon,
  children,
  actions = [],
  loading = false,
  error = null,
  onRefresh,
  size = 'default', // 'small', 'default', 'large'
  variant = 'default', // 'default', 'highlighted', 'minimal'
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-4';
      case 'large':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'highlighted':
        return 'border-orange-200 bg-orange-50';
      case 'minimal':
        return 'border-0 shadow-none bg-transparent';
      default:
        return '';
    }
  };

  const handleActionClick = (action) => {
    trackUserEngagement('dashboard', 'widget_action', action.id, {
      widgetTitle: title
    });
    
    if (action.onClick) {
      action.onClick();
    }
  };

  const handleRefresh = () => {
    trackUserEngagement('dashboard', 'widget_refresh', 'click', {
      widgetTitle: title
    });
    
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card className={`${getSizeClasses()} ${getVariantClasses()} ${className}`}>
      {/* Header */}
      {(title || actions.length > 0 || onRefresh) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <div className="flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {(actions.length > 0 || onRefresh) && (
            <div className="flex items-center gap-2 ml-4">
              {onRefresh && (
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  🔄
                </Button>
              )}
              
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  variant={action.variant || 'outline'}
                  size={action.size || 'sm'}
                  disabled={loading || action.disabled}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            {onRefresh && (
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Try Again
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
};

export default DashboardWidget;
