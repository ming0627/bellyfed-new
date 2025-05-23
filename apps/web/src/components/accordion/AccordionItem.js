/**
 * Accordion Item Component
 * 
 * Collapsible content sections with smooth animations.
 * 
 * Features:
 * - Smooth expand/collapse animations
 * - Keyboard navigation
 * - Customizable styling
 * - Icon indicators
 * - Analytics tracking
 */

import React, { useState } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const AccordionItem = ({
  title,
  children,
  defaultOpen = false,
  icon,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { trackUserEngagement } = useAnalyticsContext();

  const handleToggle = () => {
    if (disabled) return;
    
    const newState = !isOpen;
    setIsOpen(newState);
    
    trackUserEngagement('accordion', 'toggle', newState ? 'open' : 'close', {
      title,
      wasOpen: isOpen
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left flex items-center justify-between
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500'}
          transition-colors
        `}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title}`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        
        <span className={`
          text-gray-500 transition-transform duration-200
          ${isOpen ? 'rotate-180' : 'rotate-0'}
        `}>
          ▼
        </span>
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${title}`}
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 pb-3 pt-1 text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
