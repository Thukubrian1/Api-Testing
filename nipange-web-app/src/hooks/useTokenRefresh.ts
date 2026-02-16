import { useCallback } from 'react';
import { useAuthStore } from '../store/slices/authSlice';
import { refreshAccessToken } from '../utils/tokenManager';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for token refresh operations
 */
export const useTokenRefresh = () => {
  const { setAuth, logout, user } = useAuthStore();
  const { error } = useToast();

  const refresh = useCallback(async () => {
    try {
      const newToken = await refreshAccessToken();
      
      // Update auth state with new token
      if (user) {
        setAuth(user, newToken);
      }
      
      return newToken;
    } catch (err) {
      error('Your session has expired. Please login again.');
      logout();
      throw err;
    }
  }, [setAuth, logout, user, error]);

  return { refresh };
};