/**
 * Stats Widget Component
 * 
 * Displays statistical information with visual indicators,
 * trends, and interactive elements for dashboard use.
 * 
 * Features:
 * - Multiple stat display formats
 * - Trend indicators
 * - Progress bars and charts
 * - Comparison values
 * - Interactive drill-down
 * - Responsive design
 */

import React from 'react';
import { Card } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const StatsWidget = ({
  title,
  value,
  previousValue,
  unit = '',
  format = 'number', // 'number', 'currency', 'percentage'
  showTrend = true,
  showProgress = false,
  progressMax = 100,
  icon,
  color = 'blue', // 'blue', 'green', 'red', 'yellow', 'purple'
  size = 'default', // 'small', 'default', 'large'
  onClick,
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();

  const formatValue = (val) => {
    if (!val && val !== 0) return '-';
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrend = () => {
    if (!showTrend || !previousValue || !value) return null;
    
    const change = value - previousValue;
    const percentChange = (change / previousValue) * 100;
    
    return {
      change,
      percentChange,
      isPositive: change > 0,
      isNegative: change < 0
    };
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[color] || colors.blue;
  };

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

  const handleClick = () => {
    if (onClick) {
      trackUserEngagement('widget', 'stats_click', 'interaction', {
        title,
        value
      });
      onClick();
    }
  };

  const trend = getTrend();
  const progressPercentage = showProgress ? Math.min((value / progressMax) * 100, 100) : 0;

  return (
    <Card 
      className={`
        ${getSizeClasses()} 
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className={`
            text-sm font-medium text-gray-600 mb-2
            ${size === 'small' ? 'text-xs' : ''}
          `}>
            {title}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-2 mb-2">
            <p className={`
              font-bold text-gray-900
              ${size === 'small' ? 'text-xl' : size === 'large' ? 'text-4xl' : 'text-3xl'}
            `}>
              {formatValue(value)}
              {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
            </p>
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`
                text-sm font-medium
                ${trend.isPositive ? 'text-green-600' : trend.isNegative ? 'text-red-600' : 'text-gray-600'}
              `}>
                {trend.isPositive ? '↗️' : trend.isNegative ? '↘️' : '➡️'}
                {Math.abs(trend.percentChange).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">
                vs previous period
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    color === 'green' ? 'bg-green-500' :
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'red' ? 'bg-red-500' :
                    color === 'yellow' ? 'bg-yellow-500' :
                    color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
            ${getColorClasses()}
          `}>
            <span className="text-xl">{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsWidget;
