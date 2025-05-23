'use client';

/**
 * Custom Toast Component
 * 
 * A customized toast component with different styles and an undo button.
 * Based on the sonner toast library.
 */

import * as React from 'react';
import { toast } from 'sonner';

/**
 * Toast type
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast styles for different types
 */
export const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

/**
 * Icon styles for different types
 */
export const iconStyles: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

/**
 * Custom toast props interface
 */
export interface CustomToastProps {
  /**
   * The message to display
   */
  message: string;
  
  /**
   * The type of toast
   */
  type?: ToastType;
  
  /**
   * Callback when the undo button is clicked
   */
  onUndo?: () => void;
  
  /**
   * Additional options for the toast
   */
  options?: Parameters<typeof toast>[1];
  
  /**
   * Keywords to highlight in the message
   */
  highlightKeywords?: string[];
  
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Custom undo button text
   */
  undoText?: string;
}

/**
 * Custom toast function
 * 
 * @param props - Custom toast props
 * @returns The toast ID
 */
export const customToast = ({
  message,
  type = 'info',
  onUndo,
  options,
  highlightKeywords = ['Top 5', 'Not Good', 'Might Give Another Chance', 'Plan to Visit'],
  icon,
  undoText = 'Undo',
}: CustomToastProps) => {
  // Create a regex pattern from the keywords
  const keywordPattern = highlightKeywords.length > 0
    ? new RegExp(`\\b(${highlightKeywords.join('|')})\\b`)
    : null;
  
  // Split the message to highlight keywords
  const parts = keywordPattern ? message.split(keywordPattern) : [message];
  const hasSplit = parts.length > 1;
  
  // Create the message with highlighted parts
  const formattedMessage = hasSplit ? (
    <>
      {parts.map((part, index) => {
        // Check if this part is a keyword
        const isKeyword = index % 2 === 1;
        return isKeyword ? (
          <span key={index} className="font-bold">{part.trim()}</span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </>
  ) : (
    message
  );

  // Show the toast
  return toast(
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <span className="font-bold mr-2">
          {icon || iconStyles[type]}
        </span>
        <span>{formattedMessage}</span>
      </div>
      {onUndo && (
        <button
          onClick={() => {
            toast.dismiss();
            onUndo();
          }}
          className="ml-4 px-2 py-1 bg-white text-black rounded-md text-sm hover:bg-gray-200"
        >
          {undoText}
        </button>
      )}
    </div>,
    {
      ...options,
      className: `${toastStyles[type]} text-white py-2 px-4 rounded-md shadow-md`,
    },
  );
};

/**
 * Success toast function
 * 
 * @param message - The message to display
 * @param onUndo - Callback when the undo button is clicked
 * @param options - Additional options for the toast
 * @returns The toast ID
 */
export const successToast = (
  message: string,
  onUndo?: () => void,
  options?: Parameters<typeof toast>[1],
) => {
  return customToast({
    message,
    type: 'success',
    onUndo,
    options,
  });
};

/**
 * Error toast function
 * 
 * @param message - The message to display
 * @param onUndo - Callback when the undo button is clicked
 * @param options - Additional options for the toast
 * @returns The toast ID
 */
export const errorToast = (
  message: string,
  onUndo?: () => void,
  options?: Parameters<typeof toast>[1],
) => {
  return customToast({
    message,
    type: 'error',
    onUndo,
    options,
  });
};

/**
 * Warning toast function
 * 
 * @param message - The message to display
 * @param onUndo - Callback when the undo button is clicked
 * @param options - Additional options for the toast
 * @returns The toast ID
 */
export const warningToast = (
  message: string,
  onUndo?: () => void,
  options?: Parameters<typeof toast>[1],
) => {
  return customToast({
    message,
    type: 'warning',
    onUndo,
    options,
  });
};

/**
 * Info toast function
 * 
 * @param message - The message to display
 * @param onUndo - Callback when the undo button is clicked
 * @param options - Additional options for the toast
 * @returns The toast ID
 */
export const infoToast = (
  message: string,
  onUndo?: () => void,
  options?: Parameters<typeof toast>[1],
) => {
  return customToast({
    message,
    type: 'info',
    onUndo,
    options,
  });
};
