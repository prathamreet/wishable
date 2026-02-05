'use client';
import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfileDropdown() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        className="flex items-center justify-center w-8 h-8 border border-neutral-900 hover:bg-neutral-950 transition-colors focus:outline-none"
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
            className="w-full h-full object-cover"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-neutral-950 flex items-center justify-center text-xs font-bold text-white">
            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-900 z-50">
          
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt="Profile picture"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover border border-neutral-900"
                    priority={false}
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-950 flex items-center justify-center text-sm font-bold text-white border border-neutral-900">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.displayName || user.username || 'User'}
                </p>
                <p className="text-xs text-neutral-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Settings */}
            <Link
              href="/dashboard/profile"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm hover:bg-neutral-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>

            {/* Divider */}
            <div className="border-t border-neutral-200 my-1"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
