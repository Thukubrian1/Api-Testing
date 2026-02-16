import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header/Header';
import { Footer } from '../components/common/Footer/Footer';

/**
 * Main Layout for Authenticated Users
 * Shows profile, notifications, and user menu
 */
export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header for Authenticated Users */}
      <Header isAuthenticated={true} />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};