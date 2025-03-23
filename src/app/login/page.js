'use client';
import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password, redirectPath);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || (user && !loading)) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
            disabled={isLoading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

// export const metadata = {
//   title: 'Login - WishAble',
//   description: 'Log in to your WishAble account.',
// };