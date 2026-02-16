import { useAuthStore } from '../store/slices/authSlice';

/**
 * Custom hook for accessing authentication state
 */
export const useAuth = () => {
  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  } = useAuthStore();

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  };
};