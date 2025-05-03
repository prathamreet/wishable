'use client';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';

export default function SettingsNotFound() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <svg 
              className="w-32 h-32 text-primary-100 dark:text-primary-900" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <svg 
              className="w-32 h-32 text-primary-500 dark:text-primary-400 absolute top-0 left-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">Access Denied</h1>
        
        <p className="text-light-text/70 dark:text-dark-text/70 mb-8">
          You need to be logged in to access the settings page.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="btn-primary"
          >
            Log In
          </Link>
          
          <Link 
            href="/" 
            className="btn-outline"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}