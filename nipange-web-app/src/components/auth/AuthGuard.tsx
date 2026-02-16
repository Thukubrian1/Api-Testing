import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Auth Guard Component
 * Can be used to protect routes or redirect authenticated users away from auth pages
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // User needs to be authenticated but isn't
        navigate(redirectTo, { replace: true });
      } else if (!requireAuth && isAuthenticated) {
        // User shouldn't be authenticated but is (e.g., on login page while logged in)
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};