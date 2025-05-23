/**
 * Progress Bar Component
 * 
 * Displays progress with customizable styling and animations.
 */

import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'default', // 'small', 'default', 'large'
  color = 'blue', // 'blue', 'green', 'red', 'yellow', 'purple'
  showLabel = true,
  label,
  animated = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-2';
      case 'large':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-700 mb-1">
          <span>{label || 'Progress'}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getSizeClasses()}`}>
        <div
          className={`
            ${getSizeClasses()} rounded-full transition-all duration-300 
            ${getColorClasses()}
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
