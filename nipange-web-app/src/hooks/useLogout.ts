import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints/auth.api';
import { useAuthStore } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for logout mutation using React Query
 * 
 * WORKAROUND MODE: Since backend returns 500, we handle it gracefully
 * The backend has a bug in LogoutController where it's trying to cast
 * authentication.getPrincipal() to UserPrincipal but getting a Jwt object instead.
 * 
 * This workaround allows users to logout locally even when backend fails.
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout: clearAuth, token, refreshToken } = useAuthStore();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🚪 [LOGOUT HOOK] Starting logout process...');
      
      if (!token || !refreshToken) {
        console.error('❌ [LOGOUT HOOK] Missing tokens');
        throw new Error('No authentication tokens found.');
      }
      
      console.log('📡 [LOGOUT HOOK] Calling authApi.logout');
      console.log('🔒 [LOGOUT HOOK] Access token:', token.substring(0, 20) + '...');
      console.log('🔄 [LOGOUT HOOK] Refresh token:', refreshToken.substring(0, 20) + '...');
      
      try {
        await authApi.logout(token, refreshToken);
        console.log('✅ [LOGOUT HOOK] Backend logout successful');
        return { success: true, method: 'backend' };
      } catch (error: any) {
        console.error('❌ [LOGOUT HOOK] Backend logout failed:', error);
        console.error('📋 [LOGOUT HOOK] Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        
        // Check if this is a 500 error (backend bug)
        if (error.response?.status === 500) {
          console.warn('⚠️ [LOGOUT HOOK] Backend returned 500 (likely ClassCastException in LogoutController)');
          console.warn('⚠️ [LOGOUT HOOK] The backend is trying to cast Jwt to UserPrincipal');
          console.warn('⚠️ [LOGOUT HOOK] Proceeding with local logout as workaround');
          return { success: true, method: 'local', warning: 'backend_500' };
        }
        
        // Check if this is a 401 error (token already invalid)
        if (error.response?.status === 401) {
          console.warn('⚠️ [LOGOUT HOOK] Token already invalid, proceeding with local logout');
          return { success: true, method: 'local', warning: 'token_invalid' };
        }
        
        // For other errors, throw to be handled by onError
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('✅ [LOGOUT HOOK] onSuccess triggered');
      console.log('📊 [LOGOUT HOOK] Result:', result);
      console.log('🗑️ [LOGOUT HOOK] Clearing local auth state');
      
      // Clear local state regardless of how logout happened
      clearAuth();
      
      // Show appropriate message based on how logout occurred
      if (result.warning === 'backend_500') {
        console.warn('⚠️ [LOGOUT HOOK] Logout completed with backend 500 error');
        console.warn('ℹ️ [LOGOUT HOOK] User is logged out locally, but tokens may not be blacklisted on backend');
        console.warn('ℹ️ [LOGOUT HOOK] To fix: Update LogoutController to use @AuthenticationPrincipal Jwt jwt');
        showError('Logged out locally (server encountered an error)');
      } else if (result.warning === 'token_invalid') {
        console.log('ℹ️ [LOGOUT HOOK] Token was already invalid');
        success('Logged out successfully');
      } else if (result.method === 'backend') {
        console.log('✅ [LOGOUT HOOK] Complete backend logout successful');
        success('You have been logged out successfully');
      } else {
        console.log('✅ [LOGOUT HOOK] Local logout successful');
        success('Logged out successfully');
      }
      
      console.log('🔀 [LOGOUT HOOK] Navigating to /login');
      navigate('/login', { replace: true });
    },
    onError: (error: any) => {
      console.error('❌ [LOGOUT HOOK] onError triggered');
      console.error('📋 [LOGOUT HOOK] Error object:', error);
      
      const errorMessage = error?.response?.data?.customerMessage 
        || error?.response?.data?.message
        || error?.message 
        || 'Logout failed. Please try again.';
      
      console.error('💬 [LOGOUT HOOK] Showing error to user:', errorMessage);
      showError(errorMessage);
      
      // User stays logged in - DO NOT clear auth state
      console.log('🔒 [LOGOUT HOOK] User remains logged in due to logout failure');
    },
  });
};