/**
 * Permission Utilities
 * Helper functions for permission and role checking with backend format support
 * 
 * Backend permissions format: view_dashboard, edit_user, create_event, etc.
 * Pattern: {action}_{resource}
 * 
 * Depends on: permissions.types.ts, authSlice.ts
 * Used by: Protected routes, conditional UI rendering
 */

import type { 
  Permission, 
  Module, 
  PermissionCheckResult,
} from '../types/permissions.types';

import { 
  getModuleFromPermission 
} from '../types/permissions.types';

import { getPermissions } from '../store/slices/authSlice';

/**
 * Check if user has a specific permission
 * Supports both backend format (view_dashboard) and any format
 * 
 * @param permission Permission to check (e.g., "view_dashboard", "create_event")
 * @returns true if user has permission
 */
export const hasPermission = (permission: Permission): boolean => {
  const permissions = getPermissions();
  if (!permissions) return false;
  
  // Direct match with backend permissions
  return permissions.permissions.includes(permission);
};

/**
 * Check if user has ALL of the specified permissions
 * 
 * @param requiredPermissions Array of permissions to check
 * @returns true if user has all permissions
 */
export const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  const permissions = getPermissions();
  if (!permissions) return false;
  
  return requiredPermissions.every((permission) =>
    permissions.permissions.includes(permission)
  );
};

/**
 * Check if user has ANY of the specified permissions
 * 
 * @param requiredPermissions Array of permissions to check
 * @returns true if user has at least one permission
 */
export const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  const permissions = getPermissions();
  if (!permissions) return false;
  
  return requiredPermissions.some((permission) =>
    permissions.permissions.includes(permission)
  );
};

/**
 * Check if user has access to a specific module
 * Module access is determined by having at least one permission for that module
 * 
 * @param module Module to check
 * @returns true if user has access to module
 */
export const hasModuleAccess = (module: Module): boolean => {
  const permissions = getPermissions();
  if (!permissions) return false;
  
  // Check if module is in allowed modules list
  if (permissions.allowedModules && permissions.allowedModules.includes(module)) {
    return true;
  }
  
  // Fallback: Check if user has any permission for this module
  return permissions.permissions.some(permission => {
    const permModule = getModuleFromPermission(permission);
    return permModule === module;
  });
};

/**
 * Get missing permissions from required list
 * 
 * @param requiredPermissions Permissions to check
 * @returns Array of missing permissions
 */
export const getMissingPermissions = (requiredPermissions: Permission[]): Permission[] => {
  const permissions = getPermissions();
  if (!permissions) return requiredPermissions;
  
  return requiredPermissions.filter(
    (permission) => !permissions.permissions.includes(permission)
  );
};

/**
 * Comprehensive permission check with detailed result
 * 
 * @param requiredPermissions Optional array of required permissions
 * @param requiredModule Optional required module
 * @returns Detailed permission check result
 */
export const checkPermissions = (
  requiredPermissions?: Permission[],
  requiredModule?: Module
): PermissionCheckResult => {
  // If no requirements, allow access
  if (!requiredPermissions && !requiredModule) {
    return { hasPermission: true };
  }

  const permissions = getPermissions();
  
  // No permissions data means not authenticated
  if (!permissions) {
    return {
      hasPermission: false,
      redirectPath: '/login',
    };
  }

  // Check module access
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return {
      hasPermission: false,
      redirectPath: '/forbidden',
    };
  }

  // Check specific permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const missing = getMissingPermissions(requiredPermissions);
    if (missing.length > 0) {
      return {
        hasPermission: false,
        missingPermissions: missing,
        redirectPath: '/forbidden',
      };
    }
  }

  return { hasPermission: true };
};

/**
 * Get user's permissions for a specific module
 * 
 * @param module Module to get permissions for
 * @returns Array of permissions for the module
 */
export const getModulePermissions = (module: Module): Permission[] => {
  const permissions = getPermissions();
  if (!permissions) return [];
  
  return permissions.permissions.filter((permission) => {
    const permModule = getModuleFromPermission(permission);
    return permModule === module;
  });
};

/**
 * Check if user can perform a specific action on a module
 * Works with backend permission format
 * 
 * Examples:
 * - canPerformAction('dashboard', 'view') checks for 'view_dashboard'
 * - canPerformAction('events', 'create') checks for 'create_event'
 * 
 * @param resource Resource/module name (lowercase)
 * @param action Action name (lowercase)
 * @returns true if user has permission
 */
export const canPerformAction = (resource: string, action: string): boolean => {
  const permission = `${action}_${resource}`;
  return hasPermission(permission);
};

/**
 * Get all modules user has access to
 * 
 * @returns Array of accessible modules
 */
export const getAccessibleModules = (): Module[] => {
  const permissions = getPermissions();
  if (!permissions) return [];
  
  if (permissions.allowedModules) {
    return permissions.allowedModules;
  }
  
  // Derive from permissions
  const modules = new Set<Module>();
  permissions.permissions.forEach(permission => {
    const module = getModuleFromPermission(permission);
    if (module) {
      modules.add(module);
    }
  });
  
  return Array.from(modules);
};

/**
 * Check if user has permission by pattern matching
 * Useful for checking multiple related permissions
 * 
 * Example: hasPermissionPattern('view_') returns true if user has any view permission
 * 
 * @param pattern Pattern to match (e.g., 'view_', 'edit_user')
 * @returns true if user has any permission matching pattern
 */
export const hasPermissionPattern = (pattern: string): boolean => {
  const permissions = getPermissions();
  if (!permissions) return false;
  
  return permissions.permissions.some(permission =>
    permission.includes(pattern)
  );
};

/**
 * Get user's role
 * 
 * @returns UserRole or null
 */
export const getUserRole = (): string | null => {
  const permissions = getPermissions();
  return permissions?.role || null;
};

/**
 * Check if user is Super Admin
 * 
 * @returns true if user is SUPER_ADMIN
 */
export const isSuperAdmin = (): boolean => {
  return getUserRole() === 'SUPER_ADMIN';
};

/**
 * Check if user is Admin or Super Admin
 * 
 * @returns true if user is ADMIN or SUPER_ADMIN
 */
export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};