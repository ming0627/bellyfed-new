import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;
  /**
   * Optional page description
   */
  description?: string;
  /**
   * Optional icon to display next to the title
   */
  icon?: ReactNode;
  /**
   * Optional actions to display in the header (buttons, links, etc.)
   */
  actions?: ReactNode;
  /**
   * Optional breadcrumbs to display above the title
   */
  breadcrumbs?: ReactNode;
  /**
   * Optional className to apply to the component
   */
  className?: string;
  /**
   * Optional size variant
   * @default 'default'
   */
  size?: 'small' | 'default' | 'large';
  /**
   * Optional alignment
   * @default 'left'
   */
  align?: 'left' | 'center';
  /**
   * Optional bottom divider
   * @default false
   */
  withDivider?: boolean;
}

/**
 * PageHeader component for consistent page headers
 * Provides a title, optional description, icon, and actions
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  breadcrumbs,
  className,
  size = 'default',
  align = 'left',
  withDivider = false,
}) => {
  // Get size classes based on size prop
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-4';
      case 'default':
        return 'py-6';
      case 'large':
        return 'py-8';
      default:
        return 'py-6';
    }
  };

  // Get alignment classes
  const getAlignmentClasses = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'left':
      default:
        return 'text-left';
    }
  };

  return (
    <div
      className={cn(
        'w-full',
        getSizeClasses(),
        getAlignmentClasses(),
        withDivider && 'border-b border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title with optional icon */}
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white truncate">
              {title}
            </h1>
          </div>

          {/* Description */}
          {description && (
            <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400 max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0 flex items-center mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
