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
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      // Store token with secure settings
      Cookies.set('token', data.token, { 
        expires: 7, 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      
      setUser({ token: data.token });
      await fetchUserProfile(data.token);
      
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
      });
      
      // Store token with secure settings
      Cookies.set('token', data.token, { 
        expires: 7, 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      
      setUser({ token: data.token });
      await fetchUserProfile(data.token);
      
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