/**
 * Confirmation Modal Component
 * 
 * Provides a reusable confirmation dialog for destructive actions
 * and important user decisions with customizable content and styling.
 * 
 * Features:
 * - Customizable title, message, and buttons
 * - Different severity levels (info, warning, danger)
 * - Keyboard navigation and accessibility
 * - Auto-focus management
 * - Backdrop click handling
 * - Animation and transitions
 * - Loading states for async actions
 */

import React, { useEffect, useRef } from 'react';
import { Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';

const ConfirmationModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'info', // 'info', 'warning', 'danger'
  loading = false,
  showIcon = true,
  preventBackdropClose = false,
  autoFocus = true,
  className = ''
}) => {
  // Refs
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Context
  const { trackUserEngagement } = useAnalyticsContext();

  // Severity configurations
  const severityConfigs = {
    info: {
      icon: 'ℹ️',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      confirmButton: 'bg-blue-600 hover:bg-blue-700',
      borderColor: 'border-blue-200'
    },
    warning: {
      icon: '⚠️',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
      borderColor: 'border-yellow-200'
    },
    danger: {
      icon: '🚨',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmButton: 'bg-red-600 hover:bg-red-700',
      borderColor: 'border-red-200'
    }
  };

  const config = severityConfigs[severity] || severityConfigs.info;

  // Handle confirm
  const handleConfirm = async () => {
    trackUserEngagement('modal', 'confirmation', 'confirm', {
      severity,
      title
    });

    if (onConfirm) {
      await onConfirm();
    }
  };

  // Handle cancel/close
  const handleCancel = () => {
    trackUserEngagement('modal', 'confirmation', 'cancel', {
      severity,
      title
    });

    if (onClose) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (preventBackdropClose || loading) return;
    
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          if (!preventBackdropClose && !loading) {
            handleCancel();
          }
          break;
        case 'Enter':
          if (e.target === cancelButtonRef.current) {
            handleCancel();
          } else {
            handleConfirm();
          }
          break;
        case 'Tab':
          // Trap focus within modal
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, preventBackdropClose]);

  // Auto-focus management
  useEffect(() => {
    if (isOpen && autoFocus) {
      // Focus the appropriate button based on severity
      const targetButton = severity === 'danger' ? cancelButtonRef.current : confirmButtonRef.current;
      if (targetButton) {
        setTimeout(() => targetButton.focus(), 100);
      }
    }
  }, [isOpen, autoFocus, severity]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      trackUserEngagement('modal', 'confirmation', 'open', {
        severity,
        title
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className={`
          relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all duration-200
          ${config.borderColor} border-2 ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            {showIcon && (
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                ${config.iconBg}
              `}>
                <span className="text-2xl" role="img" aria-hidden="true">
                  {config.icon}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 
                id="modal-title"
                className="text-lg font-semibold text-gray-900 mb-2"
              >
                {title}
              </h3>
              <p 
                id="modal-description"
                className="text-sm text-gray-600 leading-relaxed"
              >
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex gap-3 justify-end">
            <Button
              ref={cancelButtonRef}
              onClick={handleCancel}
              variant="outline"
              disabled={loading}
              className="min-w-[80px]"
            >
              {cancelText}
            </Button>
            
            <Button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              disabled={loading}
              className={`min-w-[80px] text-white ${config.confirmButton}`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;
