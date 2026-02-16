import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Service Provider Authentication Layout - Split Design
 */
export const AuthLayoutSplit: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ni-Pange</h1>
              <p className="text-sm text-blue-100">Service Provider Portal</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-4xl font-bold mb-6">
            Grow your event business with powerful tools
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Everything you need to create, manage, and analyze events across Kenya—all in one place.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Event Creation & Management</h3>
                <p className="text-sm text-blue-100">Create unlimited events with rich descriptions, ticketing, and scheduling</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">User & Attendee Management</h3>
                <p className="text-sm text-blue-100">Track registrations, manage attendees, and control access</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Real-Time Analytics</h3>
                <p className="text-sm text-blue-100">Track performance, attendance, revenue, and engagement metrics</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Multi-Platform Support</h3>
                <p className="text-sm text-blue-100">Manage your events from web, mobile, or tablet devices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-100">
          © {new Date().getFullYear()} Ni-Pange. All rights reserved.
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">N</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">Ni-Pange</h1>
                <p className="text-xs text-gray-500">Service Provider Portal</p>
              </div>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};