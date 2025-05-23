/**
 * Breadcrumb Navigation Component
 * 
 * Provides hierarchical navigation breadcrumbs with customizable
 * separators, icons, and interactive elements.
 * 
 * Features:
 * - Hierarchical navigation display
 * - Customizable separators and icons
 * - Interactive breadcrumb items
 * - Responsive design
 * - Accessibility support
 * - Analytics tracking
 */

import React from 'react';
import Link from 'next/link.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const Breadcrumb = ({
  items = [],
  separator = '/',
  showHome = true,
  homeIcon = '🏠',
  homeLabel = 'Home',
  homeHref = '/',
  maxItems = 5,
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();

  const handleItemClick = (item, index) => {
    trackUserEngagement('navigation', 'breadcrumb_click', 'item', {
      label: item.label,
      href: item.href,
      index,
      totalItems: items.length
    });
  };

  // Truncate items if too many
  const displayItems = items.length > maxItems 
    ? [
        ...items.slice(0, 2),
        { label: '...', href: null, isEllipsis: true },
        ...items.slice(-2)
      ]
    : items;

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home Link */}
      {showHome && (
        <>
          <Link 
            href={homeHref}
            className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
            onClick={() => handleItemClick({ label: homeLabel, href: homeHref }, -1)}
          >
            <span>{homeIcon}</span>
            <span>{homeLabel}</span>
          </Link>
          {displayItems.length > 0 && (
            <span className="text-gray-400">{separator}</span>
          )}
        </>
      )}

      {/* Breadcrumb Items */}
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {item.isEllipsis ? (
            <span className="text-gray-400 px-1">...</span>
          ) : item.href ? (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-orange-600 transition-colors"
              onClick={() => handleItemClick(item, index)}
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          )}
          
          {index < displayItems.length - 1 && (
            <span className="text-gray-400">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
