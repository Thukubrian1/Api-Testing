/**
 * Main Layout
 * Primary layout wrapper with sidebar and topbar
 * 
 * Depends on: Sidebar, Topbar, useUIStore
 * Used by: Protected routes in App.tsx
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { useUIStore } from '../store/slices/uiSlice';

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={clsx(
          'transition-all duration-300',
          {
            'lg:pl-64': !sidebarCollapsed,
            'lg:pl-20': sidebarCollapsed,
          }
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};