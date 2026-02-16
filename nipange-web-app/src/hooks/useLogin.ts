import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/endpoints/auth.api';
import { useAuthStore } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

/**
 * Custom hook for login mutation using React Query
 * 
 * CRITICAL FIX: Does NOT auto-refresh or redirect on error
 * Instead, errors are handled gracefully and user stays on login page
 */
export const useLogin = (): UseMutationResult<AuthResponse, Error, LoginCredentials> => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setError, clearError } = useAuthStore();
  const { success, error: showError } = useToast();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => {
      console.log('🚀 [USE LOGIN HOOK] Calling login API...');
      clearError(); // Clear previous errors
      return authApi.login(credentials);
    },
    onSuccess: (response: AuthResponse) => {
      console.log('✅ [USE LOGIN HOOK] Login successful');
      console.log('👤 [USER INFO]', {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      });
      
      // Store auth data
      setAuth(response.user, response.accessToken, response.refreshToken);
      
      // Show personalized success message with user's NAME (not email)
      const userName = response.user.name || 'User';
      success(`Welcome back to Nipange, ${userName}!`);
      
      console.log('🎉 [USE LOGIN HOOK] Redirecting user...');
      
      // Redirect to previous page or home
      const from = (location.state?.from?.pathname as string) || '/';
      
      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    },
    onError: (error: Error) => {
      console.error('❌ [USE LOGIN HOOK] Login failed:', error);
      
      const message = error.message || 'Login failed. Please try again.';
      
      // CRITICAL FIX: Set error but DO NOT auto-refresh or redirect
      // User should stay on login page to correct their credentials
      setError(message);
      showError(message);
      
      console.log('⚠️ [USE LOGIN HOOK] User remains on login page to retry');
      
      // DO NOT call navigate() here - user should see error and retry
    },
  });
};