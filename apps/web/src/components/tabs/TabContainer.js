/**
 * Tab Container Component
 * 
 * Provides tabbed interface with customizable styling and content.
 * 
 * Features:
 * - Multiple tab styles
 * - Keyboard navigation
 * - Active state management
 * - Responsive design
 * - Analytics tracking
 */

import React, { useState } from 'react';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const TabContainer = ({
  tabs = [],
  defaultTab = 0,
  variant = 'default', // 'default', 'pills', 'underline'
  size = 'default', // 'small', 'default', 'large'
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { trackUserEngagement } = useAnalyticsContext();

  const getTabClasses = (index, isActive) => {
    const baseClasses = 'px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500';
    
    const sizeClasses = {
      small: 'text-sm px-3 py-1',
      default: 'text-base px-4 py-2',
      large: 'text-lg px-6 py-3'
    };

    const variantClasses = {
      default: isActive 
        ? 'bg-orange-100 text-orange-700 border-b-2 border-orange-500'
        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300',
      pills: isActive
        ? 'bg-orange-500 text-white rounded-lg'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg',
      underline: isActive
        ? 'text-orange-600 border-b-2 border-orange-500'
        : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  const handleTabClick = (index, tab) => {
    setActiveTab(index);
    trackUserEngagement('tabs', 'switch', 'click', {
      fromTab: activeTab,
      toTab: index,
      tabLabel: tab.label
    });
  };

  const handleKeyDown = (e, index, tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabClick(index, tab);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      handleTabClick(index - 1, tabs[index - 1]);
    } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
      e.preventDefault();
      handleTabClick(index + 1, tabs[index + 1]);
    }
  };

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`
        flex border-b border-gray-200
        ${variant === 'pills' ? 'border-0 bg-gray-100 rounded-lg p-1' : ''}
      `}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index, tab)}
            onKeyDown={(e) => handleKeyDown(e, index, tab)}
            className={getTabClasses(index, activeTab === index)}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs.map((tab, index) => (
          <div
            key={index}
            id={`tabpanel-${index}`}
            role="tabpanel"
            aria-labelledby={`tab-${index}`}
            className={activeTab === index ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabContainer;
