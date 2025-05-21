import React from 'react';

export function LucideClientIcon({
  icon: Icon,
  className,
  size,
  color,
  strokeWidth,
  'aria-label': ariaLabel,
  ...props
}) {
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
