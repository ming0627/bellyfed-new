/**
 * useToast Hook
 *
 * A hook for displaying toast notifications.
 * Based on react-hot-toast.
 */

import { toast as hotToast } from 'react-hot-toast';

/**
 * Toast hook props interface
 */
export interface ToastHookProps {
  /**
   * The message to display
   */
  message: string;

  /**
   * The type of toast
   */
  type?: 'success' | 'error' | 'loading' | 'background' | 'foreground';

  /**
   * The duration of the toast in milliseconds
   */
  duration?: number;

  /**
   * Whether to show the toast on the top of the screen
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

  /**
   * Callback when the toast is dismissed
   */
  onDismiss?: () => void;

  /**
   * Additional options for the toast
   */
  options?: Parameters<typeof hotToast>[1] & {
    onClose?: () => void;
  };
}

/**
 * useToast hook
 *
 * @returns An object with a toast function
 */
export function useToast() {
  /**
   * Show a toast notification
   *
   * @param props - Toast props
   * @returns The toast ID
   */
  const showToast = ({
    message,
    type = 'success',
    duration = 3000,
    position,
    onDismiss,
    options,
  }: ToastHookProps) => {
    const toastOptions = {
      duration,
      position,
      ...options,
      onClose: () => {
        onDismiss?.();
        options?.onClose?.();
      },
    };

    switch (type) {
      case 'success':
        return hotToast.success(message, toastOptions);
      case 'error':
        return hotToast.error(message, toastOptions);
      case 'loading':
        return hotToast.loading(message, toastOptions);
      case 'background':
      case 'foreground':
      default:
        return hotToast(message, toastOptions);
    }
  };

  return { toast: showToast };
}

/**
 * Toast object for direct usage
 */
export const toast = {
  /**
   * Show a success toast
   *
   * @param message - The message to display
   * @param options - Additional options for the toast
   * @returns The toast ID
   */
  success: (message: string, options?: Parameters<typeof hotToast>[1]) => {
    return hotToast.success(message, options);
  },

  /**
   * Show an error toast
   *
   * @param message - The message to display
   * @param options - Additional options for the toast
   * @returns The toast ID
   */
  error: (message: string, options?: Parameters<typeof hotToast>[1]) => {
    return hotToast.error(message, options);
  },

  /**
   * Show a loading toast
   *
   * @param message - The message to display
   * @param options - Additional options for the toast
   * @returns The toast ID
   */
  loading: (message: string, options?: Parameters<typeof hotToast>[1]) => {
    return hotToast.loading(message, options);
  },

  /**
   * Show a default toast
   *
   * @param message - The message to display
   * @param options - Additional options for the toast
   * @returns The toast ID
   */
  default: (message: string, options?: Parameters<typeof hotToast>[1]) => {
    return hotToast(message, options);
  },

  /**
   * Dismiss a toast
   *
   * @param toastId - The ID of the toast to dismiss
   */
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    hotToast.dismiss();
  },
};
