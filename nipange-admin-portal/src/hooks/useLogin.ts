import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/endpoints/auth.api';
import { useAuthStore } from '../store/slices/authSlice';
import { useToast } from '../contexts/ToastContext';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

/**
 * Custom hook for login mutation using React Query
 */
export const useLogin = (): UseMutationResult<AuthResponse, Error, LoginCredentials> => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setError } = useAuthStore();
  const { success, error: showError } = useToast();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response: AuthResponse) => {
      setAuth(response.serviceProvider, response.accessToken, response.refreshToken);
      
      // Show success message with user's fullName
      success(`Welcome back, ${response.serviceProvider.name}!`);
      
      // Redirect to previous page or home
      const from = (location.state?.from?.pathname as string) || '/';
      
      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    },
    onError: (error: Error) => {
      const message = error.message || 'Login failed';
      setError(message);
      showError(message);
    },
  });
};