/**
 * Permission type definitions
 */

export type Permission = string;

export interface PermissionCheck {
  permission: Permission;
  granted: boolean;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export const enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  MANAGE = 'manage',
}