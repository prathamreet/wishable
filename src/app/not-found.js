'use client';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function NotFound() {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-4">Page Not Found</h1>
        
        <p className="text-light-text/70 dark:text-dark-text/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="btn-primary"
          >
            Go to Homepage
          </Link>
          
          <Link 
            href="/login" 
            className="btn-outline"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}