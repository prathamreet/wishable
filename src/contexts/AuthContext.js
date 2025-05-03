'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import logger from '../lib/logger';
import { auth, user as userApi, setAuthTokens } from '../lib/apiClient';

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
        const refreshToken = Cookies.get('refreshToken');
        
        if (token) {
          // Set the tokens for the API client
          setAuthTokens({ 
            token, 
            refreshToken,
            expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
          });
          
          // Set the initial user state with the token
          setUser({ token });
          
          try {
            // Verify token validity
            await auth.verify();
            
            // Fetch full user profile
            const userData = await fetchUserProfile();
            if (!userData) {
              // User profile not found
              Cookies.remove('token', { path: '/' });
              Cookies.remove('refreshToken', { path: '/' });
              setUser(null);
            }
          } catch (error) {
            // Token is invalid or expired
            logger.error('Token verification failed:', error);
            Cookies.remove('token', { path: '/' });
            Cookies.remove('refreshToken', { path: '/' });
            setUser(null);
          }
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        Cookies.remove('token', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Use our simplified userApi.getProfile function
      const userData = await userApi.getProfile();
      
      if (userData) {
        const token = Cookies.get('token');
        setUser({ ...userData, token });
      }
      return userData;
    } catch (error) {
      logger.error('Failed to fetch user profile:', error);
      if (error.status === 401) {
        // Token expired or invalid
        Cookies.remove('token', { path: '/' });
        Cookies.remove('refreshToken', { path: '/' });
        setUser(null);
      }
      return null;
    }
  };

  const login = async (email, password, redirectPath = '/dashboard') => {
    try {
      // Use our simplified auth.login function
      const data = await auth.login(email, password);
      
      // Store tokens with secure settings
      Cookies.set('token', data.token, { 
        expires: 30, // 30 days
        path: '/',
        secure: process.env.NODE_ENV === 'production' || window.location.protocol === 'https:',
        sameSite: 'Lax'
      });
      
      if (data.refreshToken) {
        Cookies.set('refreshToken', data.refreshToken, { 
          expires: 90, // 90 days
          path: '/',
          secure: process.env.NODE_ENV === 'production' || window.location.protocol === 'https:',
          sameSite: 'Lax'
        });
      }
      
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
          fetchUserProfile().catch(err => {
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
      // Use our simplified auth.signup function
      const data = await auth.signup(email, password, username);
      
      // Store tokens with secure settings
      Cookies.set('token', data.token, { 
        expires: 30, // 30 days
        path: '/',
        secure: process.env.NODE_ENV === 'production' || window.location.protocol === 'https:',
        sameSite: 'Lax'
      });
      
      if (data.refreshToken) {
        Cookies.set('refreshToken', data.refreshToken, { 
          expires: 90, // 90 days
          path: '/',
          secure: process.env.NODE_ENV === 'production' || window.location.protocol === 'https:',
          sameSite: 'Lax'
        });
      }
      
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
          fetchUserProfile().catch(err => {
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
      // Handle specific error cases
      if (error.status === 400) {
        // Handle validation errors
        if (error.data) {
          if (error.data.error && error.data.error.includes('email')) {
            return { 
              success: false, 
              error: error.data.error || 'Email is invalid or already in use'
            };
          } else if (error.data.error && error.data.error.includes('username')) {
            return { 
              success: false, 
              error: error.data.error || 'Username is invalid or already taken'
            };
          } else if (error.data.error && error.data.error.includes('password')) {
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
    Cookies.remove('refreshToken', { path: '/' });
    auth.logout(); // Clear tokens in the API client
    setUser(null);
    router.push('/');
  };

  const refreshUserProfile = async () => {
    if (!user?.token) return null;
    return fetchUserProfile();
  };

  const deleteAccount = async () => {
    if (!user?.token) return { success: false, error: 'Not authenticated' };

    try {
      // Use our simplified userApi.deleteAccount function
      await userApi.deleteAccount(user.token);

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