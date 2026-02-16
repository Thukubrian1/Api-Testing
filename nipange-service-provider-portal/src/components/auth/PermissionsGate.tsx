import React from 'react';
import { useAuthStore } from '../../store/slices/authSlice';

interface PermissionGateProps {
  children: React.ReactNode;
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 * Useful for hiding/showing UI elements based on permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { user } = useAuthStore();

  if (!user || !user.permissions) {
    return <>{fallback}</>;
  }

  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  const userPermissions = user.permissions;

  const hasPermission = requireAll
    ? requiredPermissions.every((permission) => userPermissions.includes(permission))
    : requiredPermissions.some((permission) => userPermissions.includes(permission));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};