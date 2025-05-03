'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastTypes } from '../components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  // Generate a unique ID for each toast
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);
  
  // Add a new toast
  const showToast = useCallback((message, type = ToastTypes.INFO, duration = 5000) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, [generateId]);
  
  // Remove a toast by ID
  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  // Convenience methods for different toast types
  const success = useCallback((message, duration) => {
    return showToast(message, ToastTypes.SUCCESS, duration);
  }, [showToast]);
  
  const error = useCallback((message, duration) => {
    return showToast(message, ToastTypes.ERROR, duration);
  }, [showToast]);
  
  const info = useCallback((message, duration) => {
    return showToast(message, ToastTypes.INFO, duration);
  }, [showToast]);
  
  const warning = useCallback((message, duration) => {
    return showToast(message, ToastTypes.WARNING, duration);
  }, [showToast]);
  
  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, info, warning }}>
      {children}
      
      {/* Render all active toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}