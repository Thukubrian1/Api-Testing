import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header/Header';
import { Footer } from '../components/common/Footer/Footer';


/**
 * Landing Layout for Guest Users
 * Shows "User Login" and "Provider Login" buttons
 */
export const LandingLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header for Guests */}
      <Header isAuthenticated={false} />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};