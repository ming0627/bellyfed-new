import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LucideClientIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  'aria-label'?: string;
}

export function LucideClientIcon({
  icon: Icon,
  className,
  size,
  color,
  strokeWidth,
  'aria-label': ariaLabel,
  ...props
}: LucideClientIconProps): JSX.Element {
  return (
    <Icon
      className={className}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}
      {...props}
    />
  );
}
