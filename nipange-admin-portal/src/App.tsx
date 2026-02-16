/**
 * App Component
 * Main application router matching CMS structure with backend permission format
 * 
 * Depends on: All pages, layouts, ProtectedRoute, ToastContainer
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayoutSplit } from './layouts/AuthLayoutSplit';


// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Main Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { EventsPage } from './pages/events/EventsPage';
import { WalletPage } from './pages/wallet/WalletPage';
import { UsersPage } from './pages/users/UsersPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SystemPage } from './pages/system/SystemPage';
import { MessagingPage } from './pages/messaging/MessagingPage';
import { SupportPage } from './pages/support/SupportPage';

// Error Pages
import { NotFoundPage } from './pages/errors/NotFoundPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';

// Components
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Store
import { useAuthStore } from './store/slices/authSlice';
import { Module } from './types/permissions.types';
import { ToastContainer } from './components/common/ToastContainer/ToastContainer';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <ToastContainer />
      
      <Routes>

        {/* Auth Routes - Redirect to dashboard if already authenticated */}
        <Route element={<AuthLayoutSplit />}>
          <Route 
            index 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          
          <Route 
            path="/forgot-password" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} 
          />
        </Route>

        {/* Protected Routes - Require authentication and specific permissions */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredModule={Module.DASHBOARD} requiredPermissions={['view_dashboard']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Events & Bookings */}
          <Route
            path="/events"
            element={
              <ProtectedRoute requiredModule={Module.EVENTS} requiredPermissions={['view_events']}>
                <EventsPage />
              </ProtectedRoute>
            }
          />

          {/* Wallet */}
          <Route
            path="/wallet"
            element={
              <ProtectedRoute requiredModule={Module.WALLET} requiredPermissions={['view_wallet']}>
                <WalletPage />
              </ProtectedRoute>
            }
          />

          {/* Users & Service Providers */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredModule={Module.USERS} requiredPermissions={['view_users']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Platform Settings & Billing */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredModule={Module.PLATFORM_SETTINGS} requiredPermissions={['view_settings']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Analytics & Reporting */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredModule={Module.ANALYTICS} requiredPermissions={['view_analytics']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* System Role & Reasons */}
          <Route
            path="/system"
            element={
              <ProtectedRoute requiredModule={Module.SYSTEM} requiredPermissions={['view_system']}>
                <SystemPage />
              </ProtectedRoute>
            }
          />

          {/* Messaging Center */}
          <Route
            path="/messaging"
            element={
              <ProtectedRoute requiredModule={Module.MESSAGING} requiredPermissions={['view_messages']}>
                <MessagingPage />
              </ProtectedRoute>
            }
          />

          {/* Support Center */}
          <Route
            path="/support"
            element={
              <ProtectedRoute requiredModule={Module.SUPPORT} requiredPermissions={['view_support']}>
                <SupportPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Error Routes */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch all - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;