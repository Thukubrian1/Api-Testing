import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useUIStore } from '../../store/slices/uiSlice';
import { useAuthStore } from '../../store/slices/authSlice';
import { navigationConfig } from '../../config/navigation';
import type { NavigationItem } from '../../types/navigation.types';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setMobileSidebarOpen } = useUIStore();
  const admin = useAuthStore((state) => state.admin);

  /**
   * Permissions bypass — every item is accessible while permissions are disabled.
   * When you re-enable permissions, restore to:
   *
   *   const hasModule = hasModuleAccess(item.module);
   *   const hasPerms  = hasAllPermissions(item.requiredPermissions);
   *   return hasModule && hasPerms;
   */
  const isItemAccessible = (_item: NavigationItem): boolean => {
    return true;
  };

  const isItemActive = (item: NavigationItem): boolean => {
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const handleMobileClose = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-screen bg-[#E8E8E8] border-r border-gray-300 transition-all duration-300',
          'flex flex-col',
          {
            'w-64': !sidebarCollapsed,
            'w-20': sidebarCollapsed,
            'translate-x-0': sidebarMobileOpen,
            '-translate-x-full lg:translate-x-0': !sidebarMobileOpen,
          }
        )}
      >
        {/* Logo & Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-300">
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xs text-gray-800 tracking-wide leading-tight">
                CONTENT MANAGEMENT
              </span>
              <span className="font-bold text-xs text-gray-800 tracking-wide leading-tight">
                SYSTEM
              </span>
            </div>
          )}

          {/* Hamburger menu button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded hover:bg-gray-300 transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigationConfig.map((section) => {
            const accessibleItems = section.items.filter(isItemAccessible);
            if (accessibleItems.length === 0) return null;

            return (
              <div key={section.id}>
                {accessibleItems.map((item) => {
                  const active = isItemActive(item);

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={handleMobileClose}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group mb-1',
                        {
                          'bg-white text-gray-900 font-medium shadow-sm': active,
                          'text-gray-700 hover:bg-gray-200': !active,
                          'justify-center': sidebarCollapsed,
                        }
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className={clsx('flex-shrink-0', {
                        'text-gray-900': active,
                        'text-gray-600 group-hover:text-gray-900': !active
                      })}>
                        {item.icon}
                      </span>

                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Logout button at bottom */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-300 p-4">
            <Link
              to="/login"
              onClick={() => useAuthStore.getState().logout()}
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">Logout</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};