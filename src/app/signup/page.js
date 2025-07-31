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

  // Password strength calculation
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
    
    // Calculate score
    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.numbers) score++;
    if (checks.special) score++;
    
    // Bonus points for longer passwords
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    
    // Determine strength level
    if (score <= 2) return { score, label: 'Weak', color: 'red' };
    if (score <= 4) return { score, label: 'Fair', color: 'yellow' };
    if (score <= 5) return { score, label: 'Good', color: 'blue' };
    return { score, label: 'Strong', color: 'green' };
  };

  const passwordStrength = calculatePasswordStrength(password);

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
    return <LoadingSpinner fullScreen={true} message="Redirecting..." />;
  }

  return (
    <div className="min-h-screen hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 relative">
      <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
      
      <div className="max-w-md lg:max-w-lg mx-auto p-6 pt-20 relative">
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 rounded-xl shadow-xl p-6 lg:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-indigo-100 dark:text-gray-300 text-sm">
              Join Wishable today
            </p>
          </div>

          {/* General Error Message */}
          {error && (
            <div className="bg-red-400/20 dark:bg-red-500/20 border border-red-400/30 dark:border-red-500/30 text-red-200 dark:text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white dark:text-gray-200 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className={`w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                  fieldErrors.username 
                    ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20 dark:focus:ring-red-500/20' 
                    : 'border-white/20 dark:border-gray-600/30 focus:border-white dark:focus:border-gray-400 focus:ring-white/20 dark:focus:ring-gray-400/20'
                }`}
                required
                disabled={isLoading}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-200 dark:text-red-300">{fieldErrors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white dark:text-gray-200 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                  fieldErrors.email 
                    ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20 dark:focus:ring-red-500/20' 
                    : 'border-white/20 dark:border-gray-600/30 focus:border-white dark:focus:border-gray-400 focus:ring-white/20 dark:focus:ring-gray-400/20'
                }`}
                required
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-200 dark:text-red-300">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white dark:text-gray-200 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`w-full px-4 py-3 pr-12 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                    fieldErrors.password 
                      ? 'border-red-400/50 dark:border-red-500/50 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400/20 dark:focus:ring-red-500/20' 
                      : 'border-white/20 dark:border-gray-600/30 focus:border-white dark:focus:border-gray-400 focus:ring-white/20 dark:focus:ring-gray-400/20'
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  {/* Strength Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/20 dark:bg-gray-600/30 rounded-full overflow-hidden backdrop-blur-sm">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                          passwordStrength.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          passwordStrength.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                          'bg-gradient-to-r from-green-400 to-emerald-500'
                        }`}
                        style={{ 
                          width: `${Math.max((passwordStrength.score / 7) * 100, password.length > 0 ? 15 : 0)}%` 
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium min-w-12 ${
                      passwordStrength.color === 'red' ? 'text-red-300' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-300' :
                      passwordStrength.color === 'blue' ? 'text-blue-300' :
                      'text-green-300'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Strength Tips */}
                  {passwordStrength.score < 5 && (
                    <div className="bg-white/5 dark:bg-gray-700/20 backdrop-blur-sm border border-white/10 dark:border-gray-600/20 rounded-lg p-3">
                      <p className="text-xs text-indigo-200 dark:text-gray-400 mb-2">Strengthen your password:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-300' : 'text-indigo-300 dark:text-gray-400'}`}>
                          <span>{password.length >= 8 ? '✓' : '○'}</span>
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-300' : 'text-indigo-300 dark:text-gray-400'}`}>
                          <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-300' : 'text-indigo-300 dark:text-gray-400'}`}>
                          <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-300' : 'text-indigo-300 dark:text-gray-400'}`}>
                          <span>{/\d/.test(password) ? '✓' : '○'}</span>
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-300' : 'text-indigo-300 dark:text-gray-400'} col-span-2`}>
                          <span>{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'}</span>
                          <span>Special character (!@#$%^&*)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-200 dark:text-red-300">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white dark:bg-gray-100 text-indigo-700 dark:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-600/30 text-center">
            <p className="text-indigo-100 dark:text-gray-300 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-white dark:text-gray-100 hover:text-indigo-200 dark:hover:text-indigo-300 font-medium underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
