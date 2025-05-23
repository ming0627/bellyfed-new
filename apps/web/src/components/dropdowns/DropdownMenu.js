/**
 * Dropdown Menu Component
 * 
 * Customizable dropdown menu with keyboard navigation and positioning.
 * 
 * Features:
 * - Multiple positioning options
 * - Keyboard navigation
 * - Click outside to close
 * - Customizable trigger
 * - Analytics tracking
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const DropdownMenu = ({
  trigger,
  items = [],
  position = 'bottom-left', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { trackUserEngagement } = useAnalyticsContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getPositionClasses = () => {
    const positions = {
      'bottom-left': 'top-full left-0 mt-1',
      'bottom-right': 'top-full right-0 mt-1',
      'top-left': 'bottom-full left-0 mb-1',
      'top-right': 'bottom-full right-0 mb-1'
    };
    return positions[position] || positions['bottom-left'];
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    trackUserEngagement('dropdown', 'toggle', newState ? 'open' : 'close', {
      itemCount: items.length
    });
  };

  const handleItemClick = (item) => {
    setIsOpen(false);
    trackUserEngagement('dropdown', 'item_click', 'select', {
      label: item.label,
      hasAction: !!item.onClick
    });
    if (item.onClick) {
      item.onClick();
    }
  };

  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={handleToggle}>
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute z-50 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1
          ${getPositionClasses()}
        `}>
          {items.map((item, index) => (
            <div key={index}>
              {item.type === 'divider' ? (
                <hr className="my-1 border-gray-200" />
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  disabled={item.disabled}
                  className={`
                    w-full text-left px-4 py-2 text-sm transition-colors
                    ${item.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none'
                    }
                    ${item.danger ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <span className="text-lg">{item.icon}</span>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.shortcut && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
