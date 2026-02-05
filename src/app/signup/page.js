'use client';
import { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../../contexts/AuthContext';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user, loading } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.numbers) score++;
    if (checks.special) score++;
    
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    
    if (score <= 2) return { score, label: 'Weak', color: 'red' };
    if (score <= 4) return { score, label: 'Fair', color: 'yellow' };
    if (score <= 5) return { score, label: 'Good', color: 'neutral' };
    return { score, label: 'Strong', color: 'green' };
  };

  const passwordStrength = calculatePasswordStrength(password);

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
    return <LoadingSpinner fullScreen={true} message="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Sign Up
          </h1>
          <p className="text-neutral-600">
            Create your account to get started
          </p>
        </div>

        {error && (
          <div className="border border-red-600 bg-red-50 text-red-900 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className={`form-input ${
                fieldErrors.username 
                  ? 'border-red-600 focus:border-red-600' 
                  : ''
              }`}
              required
              disabled={isLoading}
            />
            {fieldErrors.username && (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`form-input ${
                fieldErrors.email 
                  ? 'border-red-600 focus:border-red-600' 
                  : ''
              }`}
              required
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className={`form-input pr-12 ${
                  fieldErrors.password 
                    ? 'border-red-600 focus:border-red-600' 
                    : ''
                }`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L8.464 8.464" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Password strength</span>
                  <span className={
                    passwordStrength.color === 'red' ? 'text-red-600' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                    passwordStrength.color === 'neutral' ? 'text-neutral-600' :
                    'text-green-600'
                  }>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1 bg-neutral-200">
                  <div 
                    className={`h-full transition-all duration-200 ${
                      passwordStrength.color === 'red' ? 'bg-red-600' :
                      passwordStrength.color === 'yellow' ? 'bg-yellow-600' :
                      passwordStrength.color === 'neutral' ? 'bg-neutral-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.max((passwordStrength.score / 7) * 100, password.length > 0 ? 15 : 0)}%` }}
                  />
                </div>
              </div>
            )}

            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <p className="text-neutral-600 text-sm">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-neutral-950 underline hover:no-underline transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
