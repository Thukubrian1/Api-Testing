/**
 * Toast Component
 * Individual toast notification with auto-dismiss.
 *
 * Depends on: toastSlice (type only)
 * Used by: ToastContainer
 */

import React, { useEffect } from 'react';
import clsx from 'clsx';
import type { Toast as ToastType } from '../../../store/slices/toastSlice';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onDismiss]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          title: 'text-green-900',
          message: 'text-green-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          title: 'text-red-900',
          message: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-100',
          title: 'text-amber-900',
          message: 'text-amber-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          title: 'text-blue-900',
          message: 'text-blue-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-100',
          title: 'text-gray-900',
          message: 'text-gray-700',
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-right-full',
        styles.bg,
        styles.border
      )}
      role="alert"
    >
      {/* Icon */}
      <div className={clsx('flex-shrink-0 p-1.5 rounded-lg', styles.iconBg, styles.icon)}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={clsx('text-sm font-semibold mb-1', styles.title)}>
            {toast.title}
          </h4>
        )}
        <p className={clsx('text-sm', styles.message)}>
          {toast.message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};