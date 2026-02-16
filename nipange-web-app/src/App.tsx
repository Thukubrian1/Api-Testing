import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './contexts/ToastContext';
import { LandingLayout } from './layouts/LandingLayout';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayoutSplit} from './layouts/AuthLayoutSplit';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { useAuthStore } from './store/slices/authSlice';
import { ToastContainer } from './components/common/ToastContainer/ToastContainer';
import { OAuthCallbackPage } from './pages/auth/0AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { SignupContainer } from './pages/auth/SignupContainer';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth Guard for public auth routes (redirects authenticated users)
const PublicAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ToastContainer />
        <Routes>
          {/* Auth Routes - Card Layout (No Navigation) */}
          <Route element={<AuthLayoutSplit />}>
            <Route 
              path="/login" 
              element={
                <PublicAuthRoute>
                  <LoginPage />
                </PublicAuthRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicAuthRoute>
                  <SignupContainer />
                </PublicAuthRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicAuthRoute>
                  <ForgotPasswordPage />
                </PublicAuthRoute>
              } 
            />
            
            {/* Provider Auth Routes */}
            <Route 
              path="/provider/login" 
              element={
                <PublicAuthRoute>
                  <LoginPage isProvider />
                </PublicAuthRoute>
              } 
            />
            <Route 
              path="/provider/signup" 
              element={
                <PublicAuthRoute>
                  <SignupContainer isProvider />
                </PublicAuthRoute>
              } 
            />
          </Route>

          {/* OAuth Callback Route - Silent, no UI */}
          <Route path="/oauth-success" element={<OAuthCallbackPage />} />

          {/* Guest Routes - Landing Layout */}
          {!isAuthenticated && (
            <Route element={<LandingLayout />}>
              <Route 
                path="/" 
                element={
                  <GuestRoute>
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <h1 className="text-3xl font-bold mb-6">Discover Events & Venues</h1>
                      <p className="text-gray-600">Browse our collection of amazing events and venues...</p>
                    </div>
                  </GuestRoute>
                } 
              />
              
              <Route 
                path="/events" 
                element={
                  <GuestRoute>
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <h1 className="text-3xl font-bold mb-6">Events</h1>
                      <p className="text-gray-600">Browse all events...</p>
                    </div>
                  </GuestRoute>
                } 
              />
              
              <Route path="/events/:id" element={<GuestRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Event Details</h1></div></GuestRoute>} />
              <Route path="/venues" element={<GuestRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Venues</h1></div></GuestRoute>} />
              <Route path="/venues/:id" element={<GuestRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Venue Details</h1></div></GuestRoute>} />
              <Route path="/categories" element={<GuestRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Categories</h1></div></GuestRoute>} />
              <Route path="/about" element={<GuestRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">About Ni-Pange</h1></div></GuestRoute>} />
            </Route>
          )}

          {/* Authenticated Routes - Main Layout */}
          {isAuthenticated && (
            <Route element={<MainLayout />}>
              <Route path="/" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Welcome Back!</h1></div>} />
              <Route path="/events" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Events</h1></div>} />
              <Route path="/events/:id" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Event Details</h1><button className="bg-blue-600 text-white px-6 py-3 rounded-lg">Book Now</button></div>} />
              <Route path="/venues" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Venues</h1></div>} />
              <Route path="/venues/:id" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Venue Details</h1><button className="bg-blue-600 text-white px-6 py-3 rounded-lg">Reserve Now</button></div>} />
              <Route path="/categories" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Categories</h1></div>} />
              <Route path="/profile" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">My Profile</h1></div></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">My Bookings</h1></div></ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">My Reservations</h1></div></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">My Favorites</h1></div></ProtectedRoute>} />
              <Route path="/bookmarks" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">My Bookmarks</h1></div></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Notifications</h1></div></ProtectedRoute>} />
              <Route path="/book/:eventId" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Book Event</h1></div></ProtectedRoute>} />
              <Route path="/reserve/:venueId" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold mb-6">Reserve Venue</h1></div></ProtectedRoute>} />
            
            </Route>
          )}
          <Route path='/dashboard' element = { <DashboardPage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;