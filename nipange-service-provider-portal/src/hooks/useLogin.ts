import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/endpoints/auth.api';
import { useAuthStore } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';
import type { AuthResponse, LoginCredentials } from '../types/auth.types';

/**
 * Custom hook for login mutation using React Query
 * IMPROVED: No auto-redirect on error, personalized welcome message
 */
export const useLogin = (): UseMutationResult<AuthResponse, Error, LoginCredentials> => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setError, clearError } = useAuthStore();
  const { success, error: showError } = useToast();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response: AuthResponse) => {
      console.log('✅ [USE LOGIN] Login successful');
      
      // Clear any previous errors
      clearError();
      
      // Set auth state
      setAuth(response.serviceProvider, response.accessToken, response.refreshToken);
      
      // Extract user's name for personalized message
      const userName = response.serviceProvider.name || 'User';
      
      // Show personalized success message
      success(`Welcome to Nipange, ${userName}!`);
      
      console.log('🎉 [USE LOGIN] Welcome message shown for:', userName);
      
      // Redirect to previous page or home
      const from = (location.state?.from?.pathname as string) || '/';
      
      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    },
    onError: (error: Error) => {
      // CRITICAL FIX: Don't redirect on error, just set error state
      const message = error.message || 'Login failed. Please try again.';
      
      console.error('❌ [USE LOGIN] Login failed:', message);
      
      // Set error in store
      setError(message);
      
      // DO NOT show toast here - LoginForm will display the error inline
      // This prevents double error display
      console.log('🚫 [USE LOGIN] Error set, NOT redirecting (staying on page)');
      
      // CRITICAL: Do NOT navigate away - let user retry
    },
  });
};