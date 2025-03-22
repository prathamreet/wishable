'use client';
import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
      fetchUserProfile(token);
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(prev => ({ ...prev, ...userData }));
      } else if (res.status === 401) {
        // Token expired
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setUser({ token: data.token });
      fetchUserProfile(data.token);
      router.push('/dashboard');
    } else {
      throw new Error(data.error);
    }
  };

  const signup = async (email, password, username) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setUser({ token: data.token });
      fetchUserProfile(data.token);
      router.push('/dashboard');
    } else {
      throw new Error(data.error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};