// This file re-exports the useToast hook from an existing library
// or implements a basic toast hook functionality

import { toast } from 'react-hot-toast';

// Custom toast
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'loading' | 'background' | 'foreground';
  duration?: number;
}

export function useToast() {
  const showToast = ({
    message,
    type = 'success',
    duration = 3000,
  }: ToastProps) => {
    switch (type) {
      case 'success':
        return toast.success(message, { duration });
      case 'error':
        return toast.error(message, { duration });
      case 'loading':
        return toast.loading(message, { duration });
      case 'background':
      case 'foreground':
        return toast(message, { duration });
      default:
        return toast(message, { duration });
    }
  };

  return { toast: showToast };
}

export { toast };
