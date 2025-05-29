import * as React from 'react';
import { cn } from '@/lib/utils';

// Extending HTMLAttributes without adding new properties is fine for this component
// as it's just a wrapper around a div with some styling
const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('slider-container', className)} {...props}>
    {/* ... existing component code ... */}
  </div>
));

Slider.displayName = 'Slider';

export { Slider };
