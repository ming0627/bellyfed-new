/**
 * Status Badge Component
 * 
 * Displays status information with color-coded styling.
 * 
 * Features:
 * - Multiple status types
 * - Customizable colors
 * - Icon support
 * - Pulse animation
 * - Accessibility support
 */

import React from 'react';

const StatusBadge = ({
  status = 'default',
  label,
  icon,
  pulse = false,
  size = 'default', // 'small', 'default', 'large'
  variant = 'filled', // 'filled', 'outline', 'dot'
  className = ''
}) => {
  const statusConfigs = {
    success: {
      filled: 'bg-green-100 text-green-800 border-green-200',
      outline: 'border-green-300 text-green-700',
      dot: 'bg-green-500'
    },
    warning: {
      filled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      outline: 'border-yellow-300 text-yellow-700',
      dot: 'bg-yellow-500'
    },
    error: {
      filled: 'bg-red-100 text-red-800 border-red-200',
      outline: 'border-red-300 text-red-700',
      dot: 'bg-red-500'
    },
    info: {
      filled: 'bg-blue-100 text-blue-800 border-blue-200',
      outline: 'border-blue-300 text-blue-700',
      dot: 'bg-blue-500'
    },
    default: {
      filled: 'bg-gray-100 text-gray-800 border-gray-200',
      outline: 'border-gray-300 text-gray-700',
      dot: 'bg-gray-500'
    }
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-2.5 py-1.5 text-sm',
    large: 'px-3 py-2 text-base'
  };

  const config = statusConfigs[status] || statusConfigs.default;

  if (variant === 'dot') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`
          w-2 h-2 rounded-full
          ${config.dot}
          ${pulse ? 'animate-pulse' : ''}
        `} />
        {label && (
          <span className="text-sm text-gray-700">{label}</span>
        )}
      </div>
    );
  }

  return (
    <span className={`
      inline-flex items-center gap-1 font-medium rounded-full border
      ${sizeClasses[size]}
      ${variant === 'outline' ? `bg-white ${config.outline}` : config.filled}
      ${pulse ? 'animate-pulse' : ''}
      ${className}
    `}>
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
};

export default StatusBadge;
