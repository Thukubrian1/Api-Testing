/**
 * Permission hooks — TEMPORARILY BYPASSED
 *
 * The Admin type does not carry a `permissions` array (those come from a
 * separate permissions endpoint you haven't wired up yet).  Every hook here
 * returns the permissive default so nothing blocks login → dashboard.
 *
 * When you're ready to re-enable, fetch permissions into the store and
 * replace the stub bodies with real checks against that data.
 */

import { useAuthStore } from '../store/slices/authSlice';

/**
 * Returns true if the user has ANY of the given permission(s).
 * Bypassed: always true while permissions are disabled.
 */
export const usePermission = (_permission: string | string[]): boolean => {
  const { admin } = useAuthStore();
  // No admin at all → not authenticated → deny
  return !!admin;
};

/**
 * Returns true if the user has ALL of the given permissions.
 * Bypassed: always true while permissions are disabled.
 */
export const useHasAllPermissions = (_permissions: string[]): boolean => {
  const { admin } = useAuthStore();
  return !!admin;
};

/**
 * Returns the user's permission list.
 * Bypassed: returns empty array until permissions are fetched.
 */
export const usePermissions = (): string[] => {
  return [];
};