'use client';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function NotFound() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
      <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
      
      <div className="max-w-2xl mx-auto p-6 pt-20 text-center relative">
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl p-8 lg:p-12">
          
          {/* 404 Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Background Circle */}
              <div className="w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-500/20 dark:from-orange-400/10 dark:to-red-500/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-orange-400/30 dark:border-orange-500/30">
                <span className="text-6xl">🔍</span>
              </div>
              
              {/* Floating 404 Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500/80 to-pink-600/80 dark:from-red-400/60 dark:to-pink-500/60 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-red-400/30 dark:border-red-500/30">
                404
              </div>
            </div>
          </div>
          
          {/* Header */}
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            Page Not Found
          </h1>
          
          <p className="text-indigo-100 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            The page you{"'"}re looking for doesn{"'"}t exist or you don{"'"}t have permission to access it.
          </p>
          
          {/* Suggestions */}
          <div className="bg-white/5 dark:bg-gray-700/20 backdrop-blur-sm border border-white/10 dark:border-gray-600/20 rounded-lg p-4 mb-8">
            <p className="text-indigo-200 dark:text-gray-400 text-sm mb-3">You can try:</p>
            <div className="space-y-2 text-xs text-indigo-100 dark:text-gray-300">
              <div className="flex items-center justify-center gap-2">
                <span>🏠</span>
                <span>Going back to the homepage</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>{user ? '📝' : '🔑'}</span>
                <span>{user ? 'Going to your dashboard' : 'Signing in to access more content'}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>📱</span>
                <span>Checking the URL for typos</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="group bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <span>🏠</span>
              <span>Go to Homepage</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            {/* Conditional Button - Dashboard if logged in, Sign In if not */}
            {user ? (
              <Link 
                href="/dashboard" 
                className="group bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center justify-center gap-2"
              >
                <span>📝</span>
                <span>Go to Dashboard</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="group bg-white/20 dark:bg-gray-700/50 hover:bg-white/30 dark:hover:bg-gray-600/50 backdrop-blur-sm text-white dark:text-gray-200 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 dark:border-gray-600/30 flex items-center justify-center gap-2"
              >
                <span>🔑</span>
                <span>Sign In</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-600/30">
            <p className="text-xs text-indigo-200 dark:text-gray-400">
              If you believe this is an error, please contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
