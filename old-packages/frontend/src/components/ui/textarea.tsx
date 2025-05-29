import * as React from 'react';

import { cn } from '@/lib/utils';

// Update the prop types
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => (
  <textarea className={cn('textarea', className)} {...props} />
);

Textarea.displayName = 'Textarea';

export { Textarea };
