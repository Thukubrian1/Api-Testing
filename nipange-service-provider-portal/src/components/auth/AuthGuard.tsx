import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children?: React.ReactNode;
  requireAuth: boolean;
  redirectTo: string;
}

/**
 * AuthGuard - Controls access to routes based on authentication status
 * 
 * Two modes:
 * 1. requireAuth = false (for public auth pages: /login, /signup, /forgot-password)
 *    - Allows unauthenticated users
 *    - Redirects authenticated users to dashboard
 * 
 * 2. requireAuth = true (for protected pages: /dashboard/*)
 *    - Requires authentication
 *    - Redirects unauthenticated users to login
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth, 
  redirectTo 
}) => {
  const { isAuthenticated, token, serviceProvider } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow zustand to rehydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Check if user is fully authenticated
  const isFullyAuthenticated = isAuthenticated && !!token && !!serviceProvider;

  console.log('🛡️ [AUTH GUARD]', {
    requireAuth,
    isFullyAuthenticated,
    hasToken: !!token,
    hasServiceProvider: !!serviceProvider,
    isChecking,
  });

  // Show minimal loading state during initial check
  if (isChecking) {
    return null; // Or a minimal spinner if you prefer
  }

  // CASE 1: Public routes (login, signup, forgot-password)
  // If user is already authenticated, redirect them to dashboard
  if (!requireAuth && isFullyAuthenticated) {
    console.log('✅ [AUTH GUARD] User authenticated on public route, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // CASE 2: Protected routes (dashboard)
  // If user is NOT authenticated, redirect to login
  if (requireAuth && !isFullyAuthenticated) {
    console.log('❌ [AUTH GUARD] User not authenticated on protected route, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Allow access
  console.log('✅ [AUTH GUARD] Access granted');
  return children ? <>{children}</> : <Outlet />;
};