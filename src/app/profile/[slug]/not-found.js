'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileNotFound() {
  // Get the current path to extract the username they were looking for
  const pathname = usePathname();
  const searchedUsername = pathname.split('/').pop();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="py-12 grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">User Not Found</h2>
            <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-900/20 mb-6">
              <p className="text-amber-800 dark:text-amber-300">
                The profile you were looking for {searchedUsername && <span className="font-mono bg-amber-100 dark:bg-amber-800/30 px-1.5 py-0.5 rounded">"{searchedUsername}"</span>} doesn't exist or may have been removed.
              </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Here are some things you can try:
            </p>
            
            <ul className="list-disc pl-5 mb-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>Check if the username is spelled correctly</li>
              <li>The user may have changed their username or deleted their account</li>
              <li>Search for the user using the search bar on the home page</li>
              <li>Browse popular wishlists on our explore page</li>
            </ul>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <Link 
                href="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go Home
              </Link>
              <Link 
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Search for Users
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Looking for someone else? Try searching for them by username:
            </p>
            
            <Link 
              href="/"
              className="block w-full text-center px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors mb-3"
            >
              Search Users
            </Link>
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Create Your Own Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Join WishAble to create your own wishlist and share it with friends!
              </p>
              <Link 
                href="/signup"
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 