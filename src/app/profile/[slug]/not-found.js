import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">User Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sorry, the user profile you're looking for doesn't exist or may have been removed.
        </p>
        <div className="inline-flex space-x-4">
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
  );
} 