'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileNotFound() {
  const pathname = usePathname();
  const searchedUsername = pathname.split('/').pop();
  
  return (
    <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
      <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
      
      <div className="max-w-2xl mx-auto p-6 pt-20 text-center relative">
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl p-8">
          
          <div className="w-16 h-16 bg-gradient-to-r from-red-400/80 to-pink-500/80 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent mb-4">
            Username Doesn't Exist
          </h1>
          
          <div className="bg-red-400/20 border border-red-400/30 backdrop-blur-sm rounded-lg p-4 mb-6">
            <p className="text-red-200">
              The username 
              {searchedUsername && (
                <span className="mx-2 bg-red-500/30 px-2 py-1 rounded font-mono text-sm">
                  "{searchedUsername}"
                </span>
              )} 
              doesn't exist.
            </p>
          </div>

          <p className="text-indigo-100 mb-6">
            Search for users on the <Link href="/" className="text-white underline hover:text-indigo-200">homepage</Link> or create your own wishlist.
          </p>

          <div className="space-y-4">
            <Link href="/signup" className="group bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 w-full">
              <span>✨</span>
              Create Your Wishlist
            </Link>
            <Link href="/" className="group bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 border border-white/20 flex items-center justify-center gap-2 w-full">
              <span>🏠</span>
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
