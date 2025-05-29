import React from 'react';
import { toast } from 'sonner';

// Custom toast
type ToastType = 'success' | 'error' | 'warning' | 'info';

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

const iconStyles: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
};

export const customToast = (
  message: string,
  type: ToastType = 'info',
  onUndo?: () => void,
  options?: Parameters<typeof toast>[1],
) => {
  const [prefix, suffix] = message.split(
    /\b(Top 5|Not Good|Might Give Another Chance|Plan to Visit)\b/,
  );
  const boldedMessage = suffix ? (
    <>
      {prefix}
      <span className="font-bold">{suffix.trim()}</span>
    </>
  ) : (
    message
  );

  toast(
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <span className="font-bold mr-2">{iconStyles[type]}</span>
        <span>{boldedMessage}</span>
      </div>
      {onUndo && (
        <button
          onClick={() => {
            toast.dismiss();
            onUndo();
          }}
          className="ml-4 px-2 py-1 bg-white text-black rounded-md text-sm hover:bg-gray-200"
        >
          Undo
        </button>
      )}
    </div>,
    {
      ...options,
      className: `${toastStyles[type]} text-white py-2 px-4 rounded-md shadow-md`,
    },
  );
};
