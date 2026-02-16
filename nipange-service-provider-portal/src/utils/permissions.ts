/**
 * Permission constants and utilities
 */

// Permission categories
export const PERMISSIONS = {
  // User permissions
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
    MANAGE: 'users:manage',
  },

  // Event permissions
  EVENTS: {
    READ: 'events:read',
    CREATE: 'events:create',
    UPDATE: 'events:update',
    DELETE: 'events:delete',
    PUBLISH: 'events:publish',
  },

  // Analytics permissions
  ANALYTICS: {
    VIEW: 'analytics:view',
    EXPORT: 'analytics:export',
  },

  // Settings permissions
  SETTINGS: {
    VIEW: 'settings:view',
    MANAGE: 'settings:manage',
  },

  // System permissions
  SYSTEM: {
    ADMIN: 'system:admin',
    CONFIG: 'system:config',
    LOGS: 'system:logs',
  },

  // Service Provider specific
  PROVIDER: {
    MANAGE_EVENTS: 'provider:manage-events',
    VIEW_ANALYTICS: 'provider:view-analytics',
    MANAGE_PROFILE: 'provider:manage-profile',
  },
} as const;

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  userPermissions: string[],
  permission: string
): boolean => {
  return userPermissions.includes(permission);
};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = (
  userPermissions: string[],
  permissions: string[]
): boolean => {
  return permissions.every((permission) => userPermissions.includes(permission));
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  userPermissions: string[],
  permissions: string[]
): boolean => {
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Get all permissions as a flat array
 */
export const getAllPermissions = (): string[] => {
  const allPermissions: string[] = [];

  Object.values(PERMISSIONS).forEach((category) => {
    Object.values(category).forEach((permission) => {
      allPermissions.push(permission);
    });
  });

  return allPermissions;
};

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = (
  category: keyof typeof PERMISSIONS
): string[] => {
  return Object.values(PERMISSIONS[category]);
};

/**
 * Default permissions for each role
 */
export const ROLE_PERMISSIONS = {
  ADMIN: getAllPermissions(),
  SERVICE_PROVIDER: [
    PERMISSIONS.EVENTS.READ,
    PERMISSIONS.EVENTS.CREATE,
    PERMISSIONS.EVENTS.UPDATE,
    PERMISSIONS.EVENTS.DELETE,
    PERMISSIONS.EVENTS.PUBLISH,
    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.PROVIDER.MANAGE_EVENTS,
    PERMISSIONS.PROVIDER.VIEW_ANALYTICS,
    PERMISSIONS.PROVIDER.MANAGE_PROFILE,
  ],
  USER: [
    PERMISSIONS.EVENTS.READ,
    PERMISSIONS.ANALYTICS.VIEW,
  ],
};