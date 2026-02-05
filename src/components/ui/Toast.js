'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

export default function Toast({ 
  message, 
  type = ToastTypes.INFO, 
  duration = 5000, 
  onClose 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!mounted) return null;
  
  const getTypeStyles = () => {
    switch (type) {
      case ToastTypes.SUCCESS:
        return {
          container: 'bg-white dark:bg-neutral-900 border-green-600',
          text: 'text-green-900 dark:text-green-400',
          icon: 'text-green-600 dark:text-green-500'
        };
      case ToastTypes.ERROR:
        return {
          container: 'bg-white dark:bg-neutral-900 border-red-600',
          text: 'text-red-900 dark:text-red-400',
          icon: 'text-red-600 dark:text-red-500'
        };
      case ToastTypes.WARNING:
        return {
          container: 'bg-white dark:bg-neutral-900 border-amber-600',
          text: 'text-amber-900 dark:text-amber-400',
          icon: 'text-amber-600 dark:text-amber-500'
        };
      case ToastTypes.INFO:
      default:
        return {
          container: 'bg-white dark:bg-neutral-900 border-neutral-900 dark:border-neutral-600',
          text: 'text-neutral-900 dark:text-neutral-300',
          icon: 'text-neutral-900 dark:text-neutral-400'
        };
    }
  };
  
  const getTypeIcon = () => {
    const styles = getTypeStyles();
    
    switch (type) {
      case ToastTypes.SUCCESS:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case ToastTypes.ERROR:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case ToastTypes.WARNING:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case ToastTypes.INFO:
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  const styles = getTypeStyles();
  
  const toast = (
    <div 
      className={`fixed top-6 right-6 z-50 max-w-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      role="alert"
    >
      <div className={`${styles.container} border-2 p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>
          </div>
          
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => {
                if (onClose) onClose();
              }, 300);
            }}
            className="flex-shrink-0 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
  
  return createPortal(toast, document.body);
}
