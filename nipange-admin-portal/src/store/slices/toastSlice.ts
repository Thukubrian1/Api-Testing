/**
 * Toast Store (Zustand)
 * 
 * Single source of truth for all toast notifications.
 * ToastContainer and Toast.tsx import from here.
 * 
 * Usage anywhere in the app:
 *   import { useToast } from '../store/slices/toastSlice';
 *   const { success, error, warning, info } = useToast();
 *   success('Saved!');
 *   error('Something went wrong', 'Details here', 7000);
 */

import { create } from 'zustand';

// ── Types (exported — Toast.tsx imports Toast from here) ──────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;       // optional heading shown above the message
  message: string;
  duration?: number;    // ms until auto-dismiss; 0 = stay forever
}

// ── Store ─────────────────────────────────────────────────────────────────
interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// ── Convenience hook ─────────────────────────────────────────────────────
// Call this from any component or hook:
//   const { success, error, warning, info } = useToast();
//
// Each helper: (message, title?, duration?)
//   - message  : shown as the body text
//   - title    : optional bold heading
//   - duration : ms (default 5000); pass 0 to keep it on screen

const DEFAULT_DURATION = 5000;

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  const success = (message: string, title?: string, duration: number = DEFAULT_DURATION) => {
    addToast({ type: 'success', message, title, duration });
  };

  const error = (message: string, title?: string, duration: number = DEFAULT_DURATION) => {
    addToast({ type: 'error', message, title, duration });
  };

  const warning = (message: string, title?: string, duration: number = DEFAULT_DURATION) => {
    addToast({ type: 'warning', message, title, duration });
  };

  const info = (message: string, title?: string, duration: number = DEFAULT_DURATION) => {
    addToast({ type: 'info', message, title, duration });
  };

  return { success, error, warning, info };
};