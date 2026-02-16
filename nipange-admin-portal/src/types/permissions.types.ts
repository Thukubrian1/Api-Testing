/**
 * Permission Types
 * Defines the RBAC (Role-Based Access Control) structure for Ni-Pange CMS
 * 
 * Supports backend permission format: view_dashboard, edit_user, create_event, etc.
 * Pattern: {action}_{resource}
 * 
 * Used by: Permission guards, route protection, UI visibility control
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ORGANIZER = 'ORGANIZER',
  SUPPORT = 'SUPPORT',
  VIEWER = 'VIEWER',
}

export enum Module {
  DASHBOARD = 'DASHBOARD',
  EVENTS = 'EVENTS',
  WALLET = 'WALLET',
  USERS = 'USERS',
  PLATFORM_SETTINGS = 'PLATFORM_SETTINGS',
  ANALYTICS = 'ANALYTICS',
  SYSTEM = 'SYSTEM',
  MESSAGING = 'MESSAGING',
  SUPPORT = 'SUPPORT',
}

/**
 * Permission from backend
 * Backend format: "view_dashboard", "edit_user", "create_event", "delete_wallet", etc.
 * Pattern: {action}_{resource}
 */
export type BackendPermission = string;

/**
 * Permission type used internally
 * Can be either backend format or normalized format
 */
export type Permission = string;

/**
 * Role-based permission mapping
 * Defines what each role can do across modules
 */
export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  modules: Module[];
}

/**
 * User permission state from backend
 */
export interface UserPermissions {
  role: UserRole;
  permissions: BackendPermission[]; // Raw permissions from backend
  allowedModules: Module[];
}

/**
 * Module-specific permissions
 * Used for detailed access control within each module
 */
export interface ModulePermissions {
  module: Module;
  permissions: Permission[];
  enabled: boolean;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  missingPermissions?: Permission[];
  redirectPath?: string;
}

/**
 * Permission mapping from backend format to module
 * Maps backend permissions like "view_dashboard" to modules
 */
export const PERMISSION_MODULE_MAP: Record<string, Module> = {
  // Dashboard permissions
  view_dashboard: Module.DASHBOARD,
  edit_dashboard: Module.DASHBOARD,
  manage_dashboard: Module.DASHBOARD,

  // Events permissions
  view_events: Module.EVENTS,
  create_event: Module.EVENTS,
  edit_event: Module.EVENTS,
  delete_event: Module.EVENTS,
  approve_event: Module.EVENTS,
  publish_event: Module.EVENTS,
  manage_events: Module.EVENTS,
  view_bookings: Module.EVENTS,
  edit_booking: Module.EVENTS,
  manage_bookings: Module.EVENTS,

  // Wallet permissions
  view_wallet: Module.WALLET,
  edit_wallet: Module.WALLET,
  manage_wallet: Module.WALLET,
  withdraw_wallet: Module.WALLET,
  view_transactions: Module.WALLET,

  // Users permissions
  view_users: Module.USERS,
  create_user: Module.USERS,
  edit_user: Module.USERS,
  delete_user: Module.USERS,
  manage_users: Module.USERS,
  view_providers: Module.USERS,
  edit_provider: Module.USERS,
  manage_providers: Module.USERS,

  // Platform Settings permissions
  view_settings: Module.PLATFORM_SETTINGS,
  edit_settings: Module.PLATFORM_SETTINGS,
  manage_settings: Module.PLATFORM_SETTINGS,
  view_billing: Module.PLATFORM_SETTINGS,
  edit_billing: Module.PLATFORM_SETTINGS,

  // Analytics permissions
  view_analytics: Module.ANALYTICS,
  export_analytics: Module.ANALYTICS,
  manage_analytics: Module.ANALYTICS,
  view_reports: Module.ANALYTICS,

  // System permissions
  view_system: Module.SYSTEM,
  edit_system: Module.SYSTEM,
  manage_system: Module.SYSTEM,
  view_roles: Module.SYSTEM,
  edit_roles: Module.SYSTEM,
  manage_roles: Module.SYSTEM,

  // Messaging permissions
  view_messages: Module.MESSAGING,
  create_message: Module.MESSAGING,
  edit_message: Module.MESSAGING,
  delete_message: Module.MESSAGING,
  manage_messages: Module.MESSAGING,

  // Support permissions
  view_support: Module.SUPPORT,
  create_ticket: Module.SUPPORT,
  edit_ticket: Module.SUPPORT,
  close_ticket: Module.SUPPORT,
  manage_support: Module.SUPPORT,
};

/**
 * Helper function to extract module from backend permission
 * @param permission Backend permission like "view_dashboard"
 * @returns Module enum or null
 */
export const getModuleFromPermission = (permission: BackendPermission): Module | null => {
  return PERMISSION_MODULE_MAP[permission] || null;
};

/**
 * Helper function to extract action from backend permission
 * @param permission Backend permission like "view_dashboard"
 * @returns Action string (e.g., "view")
 */
export const getActionFromPermission = (permission: BackendPermission): string => {
  const parts = permission.split('_');
  return parts[0] || '';
};

/**
 * Helper function to extract resource from backend permission
 * @param permission Backend permission like "view_dashboard"
 * @returns Resource string (e.g., "dashboard")
 */
export const getResourceFromPermission = (permission: BackendPermission): string => {
  const parts = permission.split('_');
  return parts.slice(1).join('_') || '';
};

/**
 * Default permission sets by role (for reference/testing)
 * These will be fetched from backend in production
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, BackendPermission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Dashboard
    'view_dashboard', 'edit_dashboard', 'manage_dashboard',
    // Events
    'view_events', 'create_event', 'edit_event', 'delete_event', 'approve_event', 'publish_event', 'manage_events',
    'view_bookings', 'edit_booking', 'manage_bookings',
    // Wallet
    'view_wallet', 'edit_wallet', 'manage_wallet', 'withdraw_wallet', 'view_transactions',
    // Users
    'view_users', 'create_user', 'edit_user', 'delete_user', 'manage_users',
    'view_providers', 'edit_provider', 'manage_providers',
    // Settings
    'view_settings', 'edit_settings', 'manage_settings', 'view_billing', 'edit_billing',
    // Analytics
    'view_analytics', 'export_analytics', 'manage_analytics', 'view_reports',
    // System
    'view_system', 'edit_system', 'manage_system', 'view_roles', 'edit_roles', 'manage_roles',
    // Messaging
    'view_messages', 'create_message', 'edit_message', 'delete_message', 'manage_messages',
    // Support
    'view_support', 'create_ticket', 'edit_ticket', 'close_ticket', 'manage_support',
  ],
  [UserRole.ADMIN]: [
    'view_dashboard', 'edit_dashboard',
    'view_events', 'create_event', 'edit_event', 'delete_event', 'approve_event', 'publish_event',
    'view_bookings', 'edit_booking', 'manage_bookings',
    'view_wallet', 'edit_wallet', 'manage_wallet',
    'view_users', 'create_user', 'edit_user', 'manage_users',
    'view_settings', 'edit_settings', 'view_billing',
    'view_analytics', 'view_reports',
    'view_system', 'view_roles',
    'view_messages', 'create_message', 'edit_message',
    'view_support', 'create_ticket', 'edit_ticket',
  ],
  [UserRole.MANAGER]: [
    'view_dashboard',
    'view_events', 'create_event', 'edit_event', 'approve_event',
    'view_bookings', 'edit_booking',
    'view_wallet',
    'view_users',
    'view_analytics',
    'view_messages', 'create_message',
    'view_support', 'create_ticket',
  ],
  [UserRole.ORGANIZER]: [
    'view_dashboard',
    'view_events', 'create_event', 'edit_event',
    'view_bookings',
    'view_wallet',
    'view_analytics',
    'view_messages',
    'view_support', 'create_ticket',
  ],
  [UserRole.SUPPORT]: [
    'view_dashboard',
    'view_events',
    'view_users',
    'view_messages', 'create_message', 'edit_message', 'manage_messages',
    'view_support', 'create_ticket', 'edit_ticket', 'close_ticket', 'manage_support',
  ],
  [UserRole.VIEWER]: [
    'view_dashboard',
    'view_events',
    'view_analytics',
  ],
};