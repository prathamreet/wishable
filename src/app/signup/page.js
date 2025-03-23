'use client';
import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user, loading } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const validateFields = () => {
    const errors = {};
    
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!username) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    else if (username.length > 50) errors.username = 'Username must be less than 50 characters';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    if (!validateFields()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signup(email, password, username, redirectPath);
      
      if (!result.success) {
        if (result.error.toLowerCase().includes('username')) {
          setFieldErrors(prev => ({...prev, username: 'Username is already taken'}));
        } else if (result.error.toLowerCase().includes('email')) {
          setFieldErrors(prev => ({...prev, email: 'Email is already registered'}));
        } else {
          setError(result.error || 'Signup failed. Please try again.');
        }
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
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
              fieldErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.username && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.username}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
              fieldErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
              fieldErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            required
            disabled={isLoading}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

// export const metadata = {
//   title: 'Signup - WishAble',
//   description: 'Sign up for a WishAble account.',
// };