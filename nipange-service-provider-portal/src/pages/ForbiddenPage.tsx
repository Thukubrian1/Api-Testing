import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button/Button';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 403 Icon */}
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, you don't have permission to access this page. Please contact
          your administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate(-1)}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            Go Back
          </Button>

          <Link to="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900">Need Help?</p>
              <p className="text-sm text-blue-700 mt-1">
                If you believe you should have access to this page, please
                contact your system administrator or check your account
                permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};