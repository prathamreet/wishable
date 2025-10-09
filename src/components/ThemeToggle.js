'use client';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  // We're always in dark mode, but keeping the component for UI consistency
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Return a non-functional dark mode indicator instead of a toggle
  return (
    <div
      className="relative p-2 rounded-lg bg-gray-700/50 border border-gray-600/30 transition-all duration-300 shadow-lg"
      title="Dark mode enabled"
    >
      <div className="relative w-5 h-5">
        {/* Moon icon - Always show as we're always in dark mode */}
        <div className="absolute inset-0">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500/80 to-purple-600/80 rounded-full flex items-center justify-center shadow-inner">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-3 h-3 text-white drop-shadow-sm"
            >
              <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Visual indicator for dark mode */}
      <span className="sr-only">Dark mode</span>
    </div>
  );
}
