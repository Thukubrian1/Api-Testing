import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Changed from UserRole[] to string[] since ServiceProvider doesn't have roles
  redirectTo?: string;
}

/**
 * Role Guard Component
 * Restricts access to routes based on user roles/types
 * Redirects to 403 Forbidden page if user doesn't have required role
 * 
 * Note: Currently ServiceProvider doesn't have a role field.
 * This component can check serviceProviderType or status instead.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/forbidden',
}) => {
  const { serviceProvider, isAuthenticated, isLoading } = useAuthStore();

  console.log('🛡️ [ROLE GUARD] Checking role access:', {
    isAuthenticated,
    hasServiceProvider: !!serviceProvider,
    serviceProviderType: serviceProvider?.serviceProviderType,
    allowedRoles,
    isLoading,
  });

  // Show loading state while auth is being rehydrated
  if (isLoading) {
    console.log('⏳ [ROLE GUARD] Auth state loading, showing loader');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !serviceProvider) {
    console.log('❌ [ROLE GUARD] User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If no roles specified, allow access (role check disabled)
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('✅ [ROLE GUARD] No role restrictions, allowing access');
    return <>{children}</>;
  }

  // Check if service provider type matches allowed roles
  // You can customize this logic based on your needs
  const hasRequiredRole = allowedRoles.includes(serviceProvider.serviceProviderType);

  if (!hasRequiredRole) {
    console.log('❌ [ROLE GUARD] User does not have required role, redirecting to:', redirectTo);
    console.log('📋 [ROLE GUARD] User type:', serviceProvider.serviceProviderType);
    console.log('📋 [ROLE GUARD] Required types:', allowedRoles);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ [ROLE GUARD] User has required role, allowing access');
  return <>{children}</>;
};