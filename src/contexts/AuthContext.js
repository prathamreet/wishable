'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import logger from '../lib/logger';
import { apiFetch } from '../lib/apiUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('token');
        if (token) {
          // Set the initial user state with the token
          setUser({ token });
          
          try {
            // Verify token validity
            await apiFetch('/api/auth/verify', {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-store'
              }
            });
            
            // Fetch full user profile
            const userData = await fetchUserProfile(token);
            if (!userData) {
              // User profile not found
              Cookies.remove('token', { path: '/' });
              setUser(null);
            }
          } catch (error) {
            // Token is invalid or expired
            logger.error('Token verification failed:', error);
            Cookies.remove('token', { path: '/' });
            setUser(null);
          }
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        Cookies.remove('token', { path: '/' });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const fetchUserProfile = async (token) => {
    if (!token) return null;
    
    try {
      const userData = await apiFetch('/api/user/profile', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
      });
      
      setUser({ ...userData, token });
      return userData;
    } catch (error) {
      logger.error('Failed to fetch user profile:', error);
      if (error.status === 401) {
        // Token expired or invalid
        Cookies.remove('token', { path: '/' });
        setUser(null);
      }
      return null;
    }
  };

  const login = async (email, password, redirectPath = '/dashboard') => {
    try {
      // First try with shorter timeout
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 3); // Try 3 retries with increasing timeouts
      
      // Store token with secure settings
      Cookies.set('token', data.token, { 
        expires: 7, 
        path: '/',
        secure: process.env.NODE_ENV === 'production' || window.location.protocol === 'https:',
        sameSite: 'Lax'
      });
      
      // Store the basic user info if available to prevent an additional request
      if (data.user) {
        setUser({ 
          ...data.user, 
          token: data.token 
        });
      } else {
        setUser({ token: data.token });
        try {
          // Try to fetch profile but don't block the login flow if it fails
          fetchUserProfile(data.token).catch(err => {
            console.warn('Non-critical error fetching profile after login:', err);
          });
        } catch (profileError) {
          // Ignore profile fetch errors
          console.warn('Non-critical error fetching profile after login:', profileError);
        }
      }
      
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(redirectPath);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        return { 
          success: false, 
          error: 'Invalid email or password'
        };
      } else if (error.status === 429) {
        return {
          success: false,
          error: 'Too many login attempts. Please try again later.'
        };
      } else if (error.status === 503 || error.status === 504) {
        return {
          success: false,
          error: 'Server is temporarily unavailable. Please try again in a moment.'
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const signup = async (email, password, username, redirectPath = '/dashboard') => {
    try {
      const data = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      }, 3); // Try 3 retries with increasing timeouts
      
      // Store token with secure settings
      Cookies.set('token', data.token, { 
        expires: 7, 
        path: '/',
        secure: process.env.NODE_ENV === 'production' || window.location.protocol === 'https:',
        sameSite: 'Lax'
      });
      
      // Store the basic user info to prevent an additional request
      if (data.user) {
        setUser({
          ...data.user,
          token: data.token
        });
      } else {
        setUser({ token: data.token });
        try {
          // Try to fetch profile but don't block the signup flow if it fails
          fetchUserProfile(data.token).catch(err => {
            console.warn('Non-critical error fetching profile after signup:', err);
          });
        } catch (profileError) {
          // Ignore profile fetch errors
          console.warn('Non-critical error fetching profile after signup:', profileError);
        }
      }
      
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(redirectPath);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.status === 400) {
        // Handle validation errors
        if (error.data) {
          if (error.data.error.includes('email')) {
            return { 
              success: false, 
              error: error.data.error || 'Email is invalid or already in use'
            };
          } else if (error.data.error.includes('username')) {
            return { 
              success: false, 
              error: error.data.error || 'Username is invalid or already taken'
            };
          } else if (error.data.error.includes('password')) {
            return { 
              success: false, 
              error: error.data.error || 'Password is too weak'
            };
          }
        }
        return { 
          success: false, 
          error: error.data?.error || 'Please check your information and try again'
        };
      } else if (error.status === 503 || error.status === 504) {
        return {
          success: false,
          error: 'Server is temporarily unavailable. Please try again in a moment.'
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    setUser(null);
    router.push('/');
  };

  const refreshUserProfile = async () => {
    if (!user?.token) return null;
    return fetchUserProfile(user.token);
  };

  const deleteAccount = async () => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };

    try {
      await apiFetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json' 
        }
      });

      // Clear user data and cookies
      Cookies.remove('token', { path: '/' });
      setUser(null);
      router.push('/');
      return { success: true };
    } catch (error) {
      logger.error('Error deleting account:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      refreshUserProfile,
      deleteAccount,
      isAuthenticated: !!user?.token
    }}>
      {children}
    </AuthContext.Provider>
  );
};