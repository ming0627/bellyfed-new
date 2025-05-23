/**
 * Skeleton Loader Component
 * 
 * Provides loading placeholders with customizable shapes and animations.
 * 
 * Features:
 * - Multiple skeleton types
 * - Customizable dimensions
 * - Smooth animations
 * - Responsive design
 * - Accessibility support
 */

import React from 'react';

const SkeletonLoader = ({
  type = 'text', // 'text', 'circle', 'rectangle', 'card'
  width = 'full',
  height = 'auto',
  lines = 3,
  animated = true,
  className = ''
}) => {
  const getBaseClasses = () => {
    return `
      bg-gray-200 rounded
      ${animated ? 'animate-pulse' : ''}
    `;
  };

  const getWidthClass = () => {
    if (typeof width === 'string') {
      return width === 'full' ? 'w-full' : `w-${width}`;
    }
    return '';
  };

  const getHeightClass = () => {
    if (typeof height === 'string') {
      return height === 'auto' ? '' : `h-${height}`;
    }
    return '';
  };

  const renderTextSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`
            ${getBaseClasses()}
            h-4
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );

  const renderCircleSkeleton = () => (
    <div
      className={`
        ${getBaseClasses()}
        rounded-full
        ${width === 'full' ? 'w-12 h-12' : `w-${width} h-${width}`}
      `}
    />
  );

  const renderRectangleSkeleton = () => (
    <div
      className={`
        ${getBaseClasses()}
        ${getWidthClass()}
        ${getHeightClass() || 'h-32'}
      `}
    />
  );

  const renderCardSkeleton = () => (
    <div className="space-y-4">
      {/* Image placeholder */}
      <div className={`${getBaseClasses()} w-full h-48`} />
      
      {/* Title placeholder */}
      <div className={`${getBaseClasses()} h-6 w-3/4`} />
      
      {/* Text placeholders */}
      <div className="space-y-2">
        <div className={`${getBaseClasses()} h-4 w-full`} />
        <div className={`${getBaseClasses()} h-4 w-5/6`} />
        <div className={`${getBaseClasses()} h-4 w-2/3`} />
      </div>
      
      {/* Button placeholder */}
      <div className={`${getBaseClasses()} h-10 w-24`} />
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'circle':
        return renderCircleSkeleton();
      case 'rectangle':
        return renderRectangleSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'text':
      default:
        return renderTextSkeleton();
    }
  };

  return (
    <div className={className} role="status" aria-label="Loading...">
      {renderSkeleton()}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonLoader;
