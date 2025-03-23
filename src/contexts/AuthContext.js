'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

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
          
          // Verify token validity
          const verifyResponse = await fetch('/api/auth/verify', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-store'
            }
          });
          
          if (!verifyResponse.ok) {
            // Token is invalid or expired
            console.error('Token verification failed:', await verifyResponse.json());
            Cookies.remove('token', { path: '/' });
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Fetch full user profile
          const userData = await fetchUserProfile(token);
          if (!userData) {
            // User profile not found
            Cookies.remove('token', { path: '/' });
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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
      const res = await fetch('/api/user/profile', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        },
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser({ ...userData, token });
        return userData;
      } else if (res.status === 401) {
        // Token expired or invalid
        Cookies.remove('token', { path: '/' });
        setUser(null);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  };

  const login = async (email, password, redirectPath = '/dashboard') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
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
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const signup = async (email, password, username, redirectPath = '/dashboard') => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      
      const data = await res.json();
      
      
      if (res.ok) {
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
      } else {
        throw new Error(data.error || 'Signup failed');
      }
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      refreshUserProfile,
      isAuthenticated: !!user?.token
    }}>
      {children}
    </AuthContext.Provider>
  );
};