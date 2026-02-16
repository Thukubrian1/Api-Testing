/**
 * Protected Route Component
 * 
 * PERMISSIONS BYPASSED — auth-only gate while permissions are disabled.
 * To restore, uncomment the permission block below.
 * 
 * Depends on: authSlice
 * Used by: App.tsx routes
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';
// Keep these imports so restoring permissions later is a single block:
// import { checkPermissions } from '../../utils/permissions';
import type { Module, Permission } from '../../types/permissions.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredModule?: Module;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  // Props kept in signature so App.tsx doesn't need to change when you restore:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requiredPermissions: _requiredPermissions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requiredModule: _requiredModule,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Only gate: are you logged in?
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── RESTORE THIS BLOCK when permissions are ready ──────────────────────
  // if (requiredPermissions || requiredModule) {
  //   const permissionCheck = checkPermissions(requiredPermissions, requiredModule);
  //   if (!permissionCheck.hasPermission) {
  //     return <Navigate to="/forbidden" replace />;
  //   }
  // }
  // ────────────────────────────────────────────────────────────────────────

  return <>{children}</>;
};