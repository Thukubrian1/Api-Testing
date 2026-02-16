import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useLogout } from "../../../hooks/useLogout";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated = false }) => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    // This will only logout if API call succeeds
    logoutMutation.mutate();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xl">i</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Ni - Pange</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/events"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Events
            </Link>
            <Link
              to="/venues"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Venues
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/bookings"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  My Bookings
                </Link>
                <Link
                  to="/favorites"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Favorites
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/categories"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Categories
                </Link>
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  About
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button className="text-gray-700 hover:text-blue-600 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.fullName?.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Favorites
                      </Link>
                      <Link
                        to="/bookmarks"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Bookmarks
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                      </button>
                      
                      {/* Show error if logout fails */}
                      {logoutMutation.isError && (
                        <div className="px-4 py-2 text-xs text-red-600 bg-red-50">
                          Logout failed. Please try again.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  User Login
                </Link>
                <Link
                  to="/provider/login"
                  className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium shadow-md"
                >
                  Provider Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/events"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/venues"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Venues
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/bookings"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/notifications"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Notifications
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-left text-red-600 hover:text-red-700 transition-colors font-medium px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                  
                  {/* Show error if logout fails */}
                  {logoutMutation.isError && (
                    <div className="px-2 py-2 text-xs text-red-600 bg-red-50 rounded">
                      Logout failed. Please try again.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/categories"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    to="/about"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    User Login
                  </Link>
                  <Link
                    to="/provider/login"
                    className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Provider Login
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};