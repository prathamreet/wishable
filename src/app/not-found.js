'use client';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function NotFound() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6 pt-32 text-center">
        <div className="border border-neutral-200 p-12">
          
          {/* 404 Header */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-neutral-950 mb-4">
              404
            </div>
          </div>
          
          {/* Header */}
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Page Not Found
          </h1>
          
          <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
            The page you{"'"}re looking for doesn{"'"}t exist or you don{"'"}t have permission to access it.
          </p>
          
          {/* Suggestions */}
          <div className="border border-neutral-200 p-6 mb-8">
            <p className="text-neutral-600 text-sm mb-3 font-medium">You can try:</p>
            <div className="space-y-2 text-sm text-neutral-600">
              <div>Going back to the homepage</div>
              <div>{user ? 'Going to your dashboard' : 'Signing in to access more content'}</div>
              <div>Checking the URL for typos</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="btn-primary inline-block"
            >
              Go to Homepage
            </Link>
            
            {user ? (
              <Link 
                href="/dashboard" 
                className="btn-secondary inline-block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="btn-secondary inline-block"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-600">
              If you believe this is an error, please contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
