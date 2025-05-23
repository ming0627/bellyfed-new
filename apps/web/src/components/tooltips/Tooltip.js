/**
 * Tooltip Component
 * 
 * Displays contextual information on hover or focus.
 * 
 * Features:
 * - Multiple positioning options
 * - Hover and focus triggers
 * - Customizable styling
 * - Accessibility support
 * - Analytics tracking
 */

import React, { useState, useRef } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const Tooltip = ({
  content,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  trigger = 'hover', // 'hover', 'click', 'focus'
  children,
  className = ''
}) => {
  const [visible, setVisible] = useState(false);
  const { trackUserEngagement } = useAnalyticsContext();
  const timeoutRef = useRef(null);

  const getPositionClasses = () => {
    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };
    return positions[position] || positions.top;
  };

  const getArrowClasses = () => {
    const arrows = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
    };
    return arrows[position] || arrows.top;
  };

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
    trackUserEngagement('tooltip', 'show', trigger, { content: typeof content === 'string' ? content : 'complex' });
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setVisible(!visible);
    }
  };

  const triggerProps = {
    ...(trigger === 'hover' && {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip
    }),
    ...(trigger === 'focus' && {
      onFocus: showTooltip,
      onBlur: hideTooltip
    }),
    ...(trigger === 'click' && {
      onClick: handleClick
    })
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div {...triggerProps}>
        {children}
      </div>
      
      {visible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            ${getPositionClasses()}
          `}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={hideTooltip}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${getArrowClasses()}
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
