import React from 'react';
import { CheckCircle, AlertCircle, Upload, X } from 'lucide-react';

/**
 * Progress Indicator Component
 * 
 * Displays upload progress with visual feedback including progress bars,
 * status icons, and file information. Supports multiple states and animations.
 * 
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.status - Current status ('idle', 'uploading', 'success', 'error', 'cancelled')
 * @param {string} props.fileName - Name of the file being uploaded
 * @param {number} props.fileSize - Size of the file in bytes
 * @param {string} props.message - Custom message to display
 * @param {Function} props.onCancel - Callback for cancel action
 * @param {Function} props.onRetry - Callback for retry action
 * @param {Function} props.onRemove - Callback for remove action
 * @param {boolean} props.showDetails - Whether to show file details
 * @param {string} props.className - Additional CSS classes
 */
export default function ProgressIndicator({
  progress = 0,
  status = 'idle',
  fileName = '',
  fileSize = 0,
  message = '',
  onCancel,
  onRetry,
  onRemove,
  showDetails = true,
  className = ''
}) {
  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get status icon based on current status
   * @returns {React.ReactNode} Status icon
   */
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
        );
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-500" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  /**
   * Get status color classes
   * @returns {string} CSS classes for status styling
   */
  const getStatusColors = () => {
    switch (status) {
      case 'uploading':
        return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20';
      case 'cancelled':
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20';
    }
  };

  /**
   * Get progress bar color
   * @returns {string} CSS classes for progress bar
   */
  const getProgressBarColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-orange-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  /**
   * Get status message
   * @returns {string} Status message
   */
  const getStatusMessage = () => {
    if (message) return message;

    switch (status) {
      case 'uploading':
        return `Uploading... ${Math.round(progress)}%`;
      case 'success':
        return 'Upload completed successfully';
      case 'error':
        return 'Upload failed';
      case 'cancelled':
        return 'Upload cancelled';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${getStatusColors()} ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* File Information */}
        <div className="flex-1 min-w-0">
          {showDetails && fileName && (
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {fileName}
              </p>
              {fileSize > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>
          )}

          {/* Status Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getStatusMessage()}
          </p>

          {/* Progress Bar */}
          {(status === 'uploading' || (status === 'success' && progress === 100)) && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {status === 'uploading' && onCancel && (
            <button
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Cancel upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
              title="Retry upload"
            >
              Retry
            </button>
          )}

          {(status === 'success' || status === 'error' || status === 'cancelled') && onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple Progress Indicators Component
 * 
 * Displays multiple progress indicators in a list format.
 * Useful for batch uploads or multiple file operations.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of progress items
 * @param {Function} props.onCancel - Callback for cancel action
 * @param {Function} props.onRetry - Callback for retry action
 * @param {Function} props.onRemove - Callback for remove action
 * @param {string} props.className - Additional CSS classes
 */
export function MultipleProgressIndicators({
  items = [],
  onCancel,
  onRetry,
  onRemove,
  className = ''
}) {
  if (items.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <ProgressIndicator
          key={item.id || index}
          progress={item.progress}
          status={item.status}
          fileName={item.fileName}
          fileSize={item.fileSize}
          message={item.message}
          onCancel={onCancel ? () => onCancel(item, index) : undefined}
          onRetry={onRetry ? () => onRetry(item, index) : undefined}
          onRemove={onRemove ? () => onRemove(item, index) : undefined}
          showDetails={item.showDetails !== false}
        />
      ))}
    </div>
  );
}

/**
 * Compact Progress Indicator Component
 * 
 * A smaller version of the progress indicator for use in tight spaces.
 * 
 * @param {Object} props - Component props (same as ProgressIndicator)
 */
export function CompactProgressIndicator(props) {
  return (
    <ProgressIndicator
      {...props}
      showDetails={false}
      className={`p-2 ${props.className || ''}`}
    />
  );
}
