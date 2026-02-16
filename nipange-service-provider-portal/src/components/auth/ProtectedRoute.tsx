import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Ensures user is authenticated before accessing the route
 * If not authenticated, redirects to login page with return URL
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, token, serviceProvider } = useAuthStore();
  const location = useLocation();
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

  console.log('🔒 [PROTECTED ROUTE]', {
    isFullyAuthenticated,
    hasToken: !!token,
    hasServiceProvider: !!serviceProvider,
    currentPath: location.pathname,
    isChecking,
  });

  // Show minimal loading state during initial check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isFullyAuthenticated) {
    console.log('❌ [PROTECTED ROUTE] User not authenticated, redirecting to login');
    console.log('📍 [PROTECTED ROUTE] Saving attempted location:', location.pathname);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Allow access
  console.log('✅ [PROTECTED ROUTE] User authenticated, allowing access');
  return <>{children}</>;
};