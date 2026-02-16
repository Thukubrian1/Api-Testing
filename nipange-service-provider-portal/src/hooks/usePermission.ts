import { useAuthStore } from '../store/slices/authSlice';

/**
 * Custom hook for checking user permissions
 */
export const usePermission = (permission: string | string[]): boolean => {
  const { user } = useAuthStore();

  if (!user || !user.permissions) {
    return false;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((p) => user.permissions.includes(p));
};

/**
 * Custom hook for checking if user has all specified permissions
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { user } = useAuthStore();

  if (!user || !user.permissions) {
    return false;
  }

  return permissions.every((permission) => user.permissions.includes(permission));
};

/**
 * Custom hook to get all user permissions
 */
export const usePermissions = (): string[] => {
  const { user } = useAuthStore();
  return user?.permissions || [];
};