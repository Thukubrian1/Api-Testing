import { useAuthStore } from '../store/slices/authSlice';

/**
 * Custom hook for accessing authentication state
 */
export const useAuth = () => {
  const {
    admin,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  } = useAuthStore();

  return {
    admin,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
  };
};