import { useAuthStore } from '../store/slices/authSlice';
import { UserRole } from '../types/auth.types';

/**
 * Custom hook for checking user role
 */
export const useRole = (role: UserRole | UserRole[]): boolean => {
  const { user } = useAuthStore();

  if (!user) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
};

/**
 * Custom hook to check if user is an admin
 */
export const useIsAdmin = (): boolean => {
  return useRole(UserRole.ADMIN);
};

/**
 * Custom hook to check if user is a service provider
 */
export const useIsServiceProvider = (): boolean => {
  return useRole(UserRole.SERVICE_PROVIDER);
};

/**
 * Custom hook to check if user is a regular user
 */
export const useIsUser = (): boolean => {
  return useRole(UserRole.USER);
};

/**
 * Custom hook to get current user role
 */
export const useCurrentRole = (): UserRole | null => {
  const { user } = useAuthStore();
  return user?.role || null;
};