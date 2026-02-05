'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Always use dark theme
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Always set dark theme in localStorage
    localStorage.setItem('theme', 'dark');
    
    // Always apply dark theme to document
    document.documentElement.classList.add('dark');
    
    setMounted(true);
  }, []);

  // Dummy toggle function that does nothing (to maintain API compatibility)
  const toggleTheme = () => {
    // Do nothing - we always stay in dark mode
    return;
  };

  // Don't render anything until after hydration to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 