import React from 'react';
import { useAuthStore } from '../../store/slices/authSlice';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Guest Route Component
 * Allows both authenticated and unauthenticated users to access routes
 * Used for public pages like event listings, venue browsing, etc.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to guest users (public pages)
  return <>{children}</>;
};