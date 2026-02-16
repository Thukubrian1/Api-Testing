import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/slices/authSlice';

export const Footer: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-gray-900 font-bold">i</span>
              </div>
              <span className="text-lg font-bold">Ni - Pange</span>
            </div>
            <p className="text-gray-400 text-sm">
              Discover and book amazing events and venues across Kenya
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="text-gray-400 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/venues" className="text-gray-400 hover:text-white transition-colors">
                  Browse Venues
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">
              {isAuthenticated ? 'My Account' : 'For Providers'}
            </h4>
            <ul className="space-y-2 text-sm">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/bookings" className="text-gray-400 hover:text-white transition-colors">
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="text-gray-400 hover:text-white transition-colors">
                      Favorites
                    </Link>
                  </li>
                  <li>
                    <Link to="/bookmarks" className="text-gray-400 hover:text-white transition-colors">
                      Bookmarks
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/provider/login" className="text-gray-400 hover:text-white transition-colors">
                      Provider Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/provider/signup" className="text-gray-400 hover:text-white transition-colors">
                      Become a Provider
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Ni-Pange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};