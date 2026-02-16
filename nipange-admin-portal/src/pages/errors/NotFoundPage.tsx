/**
 * 404 Not Found Page
 * Displayed when user navigates to a non-existent route
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-6">
            <svg
              className="w-16 h-16 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. The page might have been removed, 
            renamed, or doesn't exist.
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
              className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-600">
          If you believe this is a mistake, please{' '}
          <a href="/support" className="text-purple-600 hover:text-purple-700 font-medium">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
};