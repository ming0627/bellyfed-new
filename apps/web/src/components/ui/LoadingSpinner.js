/**
 * LoadingSpinner Component
 *
 * A simple loading spinner component with customizable size and color.
 * Used to indicate loading states throughout the application.
 *
 * Consolidated from .js and .tsx versions - preserving best features from both.
 */

import { memo } from 'react';

/**
 * LoadingSpinner component
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg, xl)
 * @param {string} props.color - Color of the spinner (primary, secondary, white, gray, or custom color)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
}) {
  // Size classes - merged from both versions
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Color classes - enhanced from .js version
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    white: 'text-white',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  // Determine if color is a predefined class or custom color
  const isCustomColor = !colorClasses[color];
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = isCustomColor ? '' : (colorClasses[color] || colorClasses.primary);

  return (
    <div
      className={`inline-block ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg
        className={`animate-spin ${sizeClass} ${colorClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={isCustomColor ? color : "currentColor"}
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill={isCustomColor ? color : "currentColor"}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
});

export default LoadingSpinner;
