import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { DashboardLayout } from './layouts/dashboard/DashboardLayout';
import { SignupContainer } from './pages/auth/SignupContainer';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ToastContainer } from './components/common/ToastContainer/ToastContainer';
import { ToastProvider } from './contexts/ToastContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthLayoutSplit } from './layouts/auth/AuthLayoutSplit';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProfileAndWalletSettings } from './pages/settings/ProfileAndWalletSettings';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ToastContainer />
        <Routes>
          {/* Public Auth Routes */}
          <Route
            element={
              <AuthGuard requireAuth={false} redirectTo="/dashboard">
                <AuthLayoutSplit />
              </AuthGuard>
            }
          >
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupContainer />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="events" element={<div className="p-8"><h1 className="text-2xl font-bold">Events - Coming Soon</h1></div>} />
            <Route path="wallet" element={<div className="p-8"><h1 className="text-2xl font-bold">Wallet - Coming Soon</h1></div>} />
            <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
            <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold">Users - Coming Soon</h1></div>} />
            <Route path="profile" element= { <ProfileAndWalletSettings />} />
            <Route path="support" element={<div className="p-8"><h1 className="text-2xl font-bold">Support - Coming Soon</h1></div>} />
          </Route>

          {/* Forbidden Route */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;