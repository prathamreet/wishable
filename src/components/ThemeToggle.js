'use client';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  if (!mounted) return null;
  
  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className={`relative p-2 rounded-lg bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 transition-all duration-300 transform hover:scale-105 shadow-lg ${isAnimating ? 'scale-110' : ''}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon - Show when dark theme is active (button shows sun to switch to light) */}
        <div className={`absolute inset-0 transition-all duration-500 transform ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
          <div className="w-5 h-5 bg-gradient-to-r from-amber-400/80 to-yellow-500/80 rounded-full flex items-center justify-center shadow-inner">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-3 h-3 text-white drop-shadow-sm"
            >
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          </div>
        </div>
        
        {/* Moon icon - Show when light theme is active (button shows moon to switch to dark) */}
        <div className={`absolute inset-0 transition-all duration-500 transform ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}>
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
      
      {/* Visual indicator for current theme */}
      <span className="sr-only">{theme === 'light' ? 'Dark' : 'Light'} mode</span>
      
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none ${
        theme === 'light' 
          ? 'from-indigo-500/30 to-purple-600/30' 
          : 'from-amber-400/30 to-yellow-500/30'
      }`}></div>
    </button>
  );
}
