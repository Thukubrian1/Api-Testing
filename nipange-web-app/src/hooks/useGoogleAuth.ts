import { useCallback } from 'react';
import { getGoogleOAuthUrl } from '../config/config';
import { useAuthStore } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for Google OAuth authentication
 */
export const useGoogleAuth = () => {
  const { setError } = useAuthStore();
  const { error: showError } = useToast();

  /**
   * Initiate Google OAuth flow
   */
  const loginWithGoogle = useCallback(() => {
    try {
      const googleUrl = getGoogleOAuthUrl();
      console.log('Redirecting to Google OAuth:', googleUrl);
      
      // Redirect to backend Google OAuth endpoint
      // Backend will redirect to Google's OAuth page
      window.location.href = googleUrl;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to initiate Google sign-in';
      setError(message);
      showError(message);
    }
  }, [setError, showError]);

  return {
    loginWithGoogle,
  };
};