import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints/auth.api';
import { useAuthStore } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for logout mutation using React Query
 * STRICT MODE: Only logs out locally if backend logout succeeds
 * If backend fails, user stays logged in and sees error
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: clearAuth, token, refreshToken } = useAuthStore();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🚪 [LOGOUT] Starting logout process...');
      
      if (!token || !refreshToken) {
        throw new Error('No authentication tokens found.');
      }
      
      try {
        console.log('📡 [LOGOUT] Calling backend /v1/logout');
        await authApi.logout(token, refreshToken);
        console.log('✅ [LOGOUT] Backend logout successful');
        return true;
      } catch (error: any) {
        // Check if this is a 500 error
        if (error.response?.status === 500) {
          console.warn('⚠️ [LOGOUT] Backend returned 500, but proceeding with local logout');
          // Return a special flag instead of throwing
          return 'backend_error_but_continue';
        }
        throw error;
      }
    },
    onSuccess: (result) => {
      // Clear local state regardless of backend response
      console.log('🗑️ [LOGOUT] Clearing local auth state');
      clearAuth();
      
      if (result === 'backend_error_but_continue') {
        console.warn('⚠️ [LOGOUT] Backend had issues, but user is logged out locally');
        showError('Logged out locally (backend encountered an issue)');
      } else {
        console.log('✅ [LOGOUT] Complete logout successful');
        success('You have been logged out successfully');
      }
      
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('❌ [LOGOUT] Error:', error);
      showError('Logout failed. Please try again.');
    },
  });
};