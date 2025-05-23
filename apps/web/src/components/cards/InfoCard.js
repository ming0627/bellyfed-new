/**
 * Info Card Component
 * 
 * Versatile information display card with customizable layout,
 * content, and interactive elements for various use cases.
 * 
 * Features:
 * - Flexible content layout
 * - Image/icon support
 * - Action buttons
 * - Status indicators
 * - Hover effects
 * - Responsive design
 */

import React from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button } from '../ui/index.js';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const InfoCard = ({
  title,
  subtitle,
  description,
  image,
  icon,
  status,
  badges = [],
  actions = [],
  href,
  onClick,
  layout = 'vertical', // 'vertical', 'horizontal'
  size = 'default', // 'small', 'default', 'large'
  hoverable = true,
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();

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

  const getLayoutClasses = () => {
    return layout === 'horizontal' 
      ? 'flex items-start gap-4' 
      : 'space-y-4';
  };

  const getImageClasses = () => {
    if (layout === 'horizontal') {
      return size === 'small' ? 'w-16 h-16' : 'w-24 h-24';
    }
    return 'w-full h-48';
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      trackUserEngagement('card', 'click', 'info_card', {
        title,
        hasHref: !!href
      });
      onClick();
    }
  };

  const handleActionClick = (action, e) => {
    e.stopPropagation();
    trackUserEngagement('card', 'action', action.id || 'unknown', {
      cardTitle: title
    });
    
    if (action.onClick) {
      action.onClick();
    }
  };

  const cardContent = (
    <Card 
      className={`
        ${getSizeClasses()} 
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${href || onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className={getLayoutClasses()}>
        {/* Image/Icon */}
        {(image || icon) && (
          <div className={`flex-shrink-0 ${layout === 'vertical' ? '' : ''}`}>
            {image ? (
              <img
                src={image}
                alt={title || 'Card image'}
                className={`${getImageClasses()} object-cover rounded-lg`}
              />
            ) : icon ? (
              <div className={`
                ${getImageClasses()} 
                flex items-center justify-center text-4xl bg-gray-100 rounded-lg
              `}>
                {icon}
              </div>
            ) : null}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {title && (
                <h3 className={`
                  font-semibold text-gray-900 
                  ${size === 'small' ? 'text-base' : size === 'large' ? 'text-xl' : 'text-lg'}
                `}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            {status && (
              <Badge 
                variant={status === 'active' ? 'default' : 'outline'}
                className="ml-2"
              >
                {status}
              </Badge>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className={`
              text-gray-700 mb-3
              ${size === 'small' ? 'text-sm' : 'text-base'}
              ${layout === 'horizontal' ? 'line-clamp-2' : 'line-clamp-3'}
            `}>
              {description}
            </p>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={(e) => handleActionClick(action, e)}
                  variant={action.variant || 'outline'}
                  size={action.size || 'sm'}
                  disabled={action.disabled}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // Wrap with Link if href is provided
  if (href && !onClick) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default InfoCard;
