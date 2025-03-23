'use client';
import { useContext, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if the current path matches the given pattern
  const isActivePath = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              WishAble
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className={`transition-colors ${
                    isActivePath('/dashboard') && !isActivePath('/dashboard/profile')
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`transition-colors ${
                    isActivePath('/profile')
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`transition-colors ${
                    isActivePath('/dashboard/profile')
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={`transition-colors ${
                    isActivePath('/login')
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/dashboard') && !isActivePath('/dashboard/profile')
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/profile')
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/dashboard/profile')
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/login')
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}