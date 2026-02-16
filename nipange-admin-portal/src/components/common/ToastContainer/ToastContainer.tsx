/**
 * Toast Container Component
 * Renders all active toast notifications.
 *
 * Depends on: toastSlice, Toast component
 * Used by: App.tsx (global)
 */

import React from 'react';
import { useToastStore } from '../../../store/slices/toastSlice'; // was '../../..//store/…' (double slash)
import { Toast } from '../Toast/Toast';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col gap-3 pointer-events-auto max-w-sm w-full">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
};