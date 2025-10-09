'use client';
import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfileDropdown() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm border border-gray-600/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transform hover:scale-105 shadow-lg"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.profilePicture ? (
          <Image
            src={user.profilePicture}
            alt="Profile picture"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
            priority={false}
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-400/60 to-purple-500/60 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-inner">
            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 sm:w-64 bg-gray-800/50 backdrop-blur-md border border-gray-600/30 rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
          
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-600/30">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="Profile picture"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-gray-600/30"
                    priority={false}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400/60 to-purple-500/60 flex items-center justify-center text-lg font-bold text-white shadow-lg border-2 border-gray-600/30">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">
                  {user.displayName || user.username || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Settings */}
            <Link
              href="/dashboard/profile"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/30 hover:text-gray-100 transition-all duration-300 backdrop-blur-sm group"
            >
              <div className="w-5 h-5 mr-3 bg-gray-600/30 rounded-lg flex items-center justify-center group-hover:bg-gray-500/40 transition-all duration-300">
                <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Settings
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-600/20 my-2 mx-4"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-300 backdrop-blur-sm group"
            >
              <div className="w-5 h-5 mr-3 bg-red-500/30 rounded-lg flex items-center justify-center group-hover:bg-red-500/40 transition-all duration-300">
                <svg className="w-3 h-3 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
