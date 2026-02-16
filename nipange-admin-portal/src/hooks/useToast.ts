/**
 * useToast Hook
 * Hook for showing toast notifications
 */

import { useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Create toast event
    const event = new CustomEvent('show-toast', {
      detail: { message, type },
    });
    window.dispatchEvent(event);
  }, []);

  return { showToast };
}