'use client';
import { useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if the current path matches the given pattern
  const isActivePath = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  if (!mounted) return null;

  return (
    <nav 
      className={`bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md backdrop-blur-sm bg-light-card/90 dark:bg-dark-card/90' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-light-text dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <span className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-6 h-6 mr-2 text-primary-500"
                >
                  <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM20.25 5.507v11.561L5.853 2.671c.15-.043.306-.075.467-.094a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93zM3.75 21V9.406c0-1.524 1.162-2.807 2.67-2.934a48.774 48.774 0 013.36-.187c1.437.025 2.883.084 4.328.175l-9.508 9.508a.75.75 0 00-.22.53V21c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-5.25a.75.75 0 00-.75-.75h-2.625l-1.59 1.59c-.2.2-.47.312-.75.312h-2.25a.75.75 0 01-.53-.22l-1.06-1.06a.75.75 0 01.53-1.28h1.5v-1.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V18a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V18a.75.75 0 01-.75.75H3.75z" />
                </svg>
                WishAble
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className={`transition-colors px-3 py-2 rounded-md ${
                    isActivePath('/dashboard') && !isActivePath('/dashboard/profile')
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-light-accent dark:hover:bg-dark-accent'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`transition-colors px-3 py-2 rounded-md ${
                    isActivePath('/profile')
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-light-accent dark:hover:bg-dark-accent'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`transition-colors px-3 py-2 rounded-md ${
                    isActivePath('/dashboard/profile')
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-light-accent dark:hover:bg-dark-accent'
                  }`}
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="text-light-text/80 dark:text-dark-text/80 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-light-accent dark:hover:bg-dark-accent transition-colors px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className={`transition-colors px-3 py-2 rounded-md ${
                    isActivePath('/login')
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-light-accent dark:hover:bg-dark-accent'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
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
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-light-text/60 dark:text-dark-text/60 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-light-accent dark:hover:bg-dark-accent focus:outline-none transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
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
        <div className="md:hidden bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/dashboard') && !isActivePath('/dashboard/profile')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:bg-light-accent dark:hover:bg-dark-accent hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/profile')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:bg-light-accent dark:hover:bg-dark-accent hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/dashboard/profile')
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:bg-light-accent dark:hover:bg-dark-accent hover:text-primary-600 dark:hover:text-primary-400'
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
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-light-text/80 dark:text-dark-text/80 hover:bg-light-accent dark:hover:bg-dark-accent hover:text-primary-600 dark:hover:text-primary-400"
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
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-light-text/80 dark:text-dark-text/80 hover:bg-light-accent dark:hover:bg-dark-accent hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
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