/**
 * 403 Forbidden Page
 * Displayed when user doesn't have permission to access a route
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/slices/authSlice';
import { getUserRole } from '../../utils/permissions';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRole = getUserRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 403 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-6">
            <svg
              className="w-16 h-16 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
            403
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            Sorry, you don't have permission to access this page. This area is restricted to users 
            with specific permissions.
          </p>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Logged in as:</span> {user?.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Your role:</span>{' '}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {userRole}
              </span>
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            If you need access to this area, please contact your administrator to request the necessary permissions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-600">
          Need help?{' '}
          <a href="/support" className="text-red-600 hover:text-red-700 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};