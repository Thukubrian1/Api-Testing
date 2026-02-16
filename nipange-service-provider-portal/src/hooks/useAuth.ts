import { useAuthStore } from '../store/slices/authSlice';

/**
 * Custom hook for accessing authentication state
 */
export const useAuth = () => {
  const {
    serviceProvider,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  } = useAuthStore();

  return {
    serviceProvider,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  };
};