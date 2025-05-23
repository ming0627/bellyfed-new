import React from 'react';
import { cn } from '../utils.js';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
}

/**
 * PageHeader component for consistent page headers
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  children,
  className,
  size = 'md',
  align = 'left',
}) => {
  const sizeClasses = {
    sm: {
      title: 'text-2xl',
      description: 'text-sm',
      spacing: 'space-y-2',
    },
    md: {
      title: 'text-3xl',
      description: 'text-base',
      spacing: 'space-y-3',
    },
    lg: {
      title: 'text-4xl',
      description: 'text-lg',
      spacing: 'space-y-4',
    },
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
  };

  return (
    <div
      className={cn(
        'py-8',
        sizeClasses[size].spacing,
        alignClasses[align],
        className
      )}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h1
          className={cn(
            'font-heading font-bold text-neutral-900 dark:text-neutral-100',
            sizeClasses[size].title
          )}
        >
          {title}
        </h1>
      </div>
      
      {description && (
        <p
          className={cn(
            'text-neutral-600 dark:text-neutral-400 max-w-2xl',
            sizeClasses[size].description,
            align === 'center' ? 'mx-auto' : ''
          )}
        >
          {description}
        </p>
      )}
      
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};

export { PageHeader };
