import { useAuthStore } from '../store/slices/authSlice';
import { UserRole } from '../types/permissions.types'; // ← was incorrectly pointing to auth.types

/**
 * Returns true if the current admin's role matches any of the given role(s).
 *
 * NOTE: The admin object returned by the token does not currently carry a
 * `role` field.  This will always return false until you either:
 *   a) add `role` to the Admin type and populate it from the token / a
 *      dedicated endpoint, or
 *   b) wire up the permissions store that already has `role`.
 *
 * The hook is structurally correct and ready for either approach.
 */
export const useRole = (role: UserRole | UserRole[]): boolean => {
  const { admin } = useAuthStore(); // was `user` — store key is `admin`

  if (!admin) {
    return false;
  }

  // admin.role doesn't exist yet on the type; cast to any so this compiles
  // until you add the field.  Replace with the real field when available.
  const adminRole = (admin as any).role as string | undefined;
  if (!adminRole) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(adminRole as UserRole);
};

/**
 * Returns true if the current user holds the ADMIN role.
 */
export const useIsAdmin = (): boolean => {
  return useRole(UserRole.ADMIN);
};

/**
 * Returns true if the current user holds the SUPER_ADMIN role.
 */
export const useIsSuperAdmin = (): boolean => {
  return useRole(UserRole.SUPER_ADMIN);
};

/**
 * Returns true if the current user holds the MANAGER role.
 */
export const useIsManager = (): boolean => {
  return useRole(UserRole.MANAGER);
};

/**
 * Returns the current admin's role, or null if not authenticated / no role set.
 */
export const useCurrentRole = (): UserRole | null => {
  const { admin } = useAuthStore(); // was `user`
  return (admin as any)?.role || null;
};