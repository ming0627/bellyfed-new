import { toast as hotToast } from 'react-hot-toast';
import type { Toast, ToastOptions } from 'react-hot-toast';

/**
 * Interface for toast notification options
 */
export interface ToastNotificationOptions {
  /**
   * The duration of the toast in milliseconds
   */
  duration?: number;
  /**
   * The position of the toast
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  /**
   * Custom icon to display in the toast
   */
  icon?: React.ReactNode;
  /**
   * Custom styles for the toast
   */
  style?: React.CSSProperties;
  /**
   * Custom class name for the toast
   */
  className?: string;
}

/**
 * Interface for toast notification functions
 */
export interface ToastFunctions {
  /**
   * Show a success toast notification
   * @param message - The message to display
   * @param options - Toast notification options
   * @returns The toast ID
   */
  success: (message: string, options?: ToastNotificationOptions) => string;

  /**
   * Show an error toast notification
   * @param message - The message to display
   * @param options - Toast notification options
   * @returns The toast ID
   */
  error: (message: string, options?: ToastNotificationOptions) => string;

  /**
   * Show a loading toast notification
   * @param message - The message to display
   * @param options - Toast notification options
   * @returns The toast ID
   */
  loading: (message: string, options?: ToastNotificationOptions) => string;

  /**
   * Show a custom toast notification
   * @param message - The message to display
   * @param options - Toast notification options
   * @returns The toast ID
   */
  custom: (message: string | React.ReactNode, options?: ToastNotificationOptions) => string;

  /**
   * Dismiss a toast notification by ID
   * @param toastId - The ID of the toast to dismiss
   */
  dismiss: (toastId?: string) => void;

  /**
   * Update an existing toast notification
   * @param toastId - The ID of the toast to update
   * @param message - The new message to display
   * @param options - The new toast options
   * @returns The toast ID
   */
  update: (toastId: string, message: string, options?: ToastNotificationOptions) => string;

  /**
   * Promise handler that shows loading, success, and error toasts based on promise state
   * @param promise - The promise to handle
   * @param messages - Object containing loading, success, and error messages
   * @param options - Toast notification options
   * @returns The promise result
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastNotificationOptions
  ) => Promise<T>;
}

/**
 * Custom hook for displaying toast notifications
 *
 * @returns Toast notification functions
 */
export function useToast(): ToastFunctions {
  /**
   * Show a success toast notification
   */
  const success = (message: string, options?: ToastNotificationOptions): string => {
    return hotToast.success(message, {
      duration: 3000,
      position: 'bottom-right',
      ...options,
    } as ToastOptions);
  };

  /**
   * Show an error toast notification
   */
  const error = (message: string, options?: ToastNotificationOptions): string => {
    return hotToast.error(message, {
      duration: 4000,
      position: 'bottom-right',
      ...options,
    } as ToastOptions);
  };

  /**
   * Show a loading toast notification
   */
  const loading = (message: string, options?: ToastNotificationOptions): string => {
    return hotToast.loading(message, {
      duration: 5000,
      position: 'bottom-right',
      ...options,
    } as ToastOptions);
  };

  /**
   * Show a custom toast notification
   */
  const custom = (message: string | React.ReactNode, options?: ToastNotificationOptions): string => {
    return hotToast(message as string, {
      duration: 3000,
      position: 'bottom-right',
      ...options,
    } as ToastOptions);
  };

  /**
   * Dismiss a toast notification by ID
   */
  const dismiss = (toastId?: string): void => {
    if (toastId) {
      hotToast.dismiss(toastId);
    } else {
      hotToast.dismiss();
    }
  };

  /**
   * Update an existing toast notification
   */
  const update = (toastId: string, message: string, options?: ToastNotificationOptions): string => {
    return hotToast.custom(
      message as any,
      {
        id: toastId,
        ...options,
      } as ToastOptions
    );
  };

  /**
   * Promise handler that shows loading, success, and error toasts based on promise state
   */
  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastNotificationOptions
  ): Promise<T> => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        duration: 3000,
        position: 'bottom-right',
        ...options,
      } as ToastOptions
    );
  };

  return {
    success,
    error,
    loading,
    custom,
    dismiss,
    update,
    promise,
  };
}
