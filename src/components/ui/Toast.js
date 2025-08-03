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
      }, 300); // Wait for fade out animation
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!mounted) return null;
  
  // Define styles based on toast type with glass morphism
  const getTypeStyles = () => {
    switch (type) {
      case ToastTypes.SUCCESS:
        return {
          container: 'bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-green-400/30 dark:border-green-500/30 shadow-xl',
          accent: 'bg-gradient-to-r from-green-400/80 to-emerald-500/80 dark:from-green-400/60 dark:to-emerald-500/60',
          text: 'text-green-200 dark:text-green-300',
          icon: 'text-green-300 dark:text-green-400'
        };
      case ToastTypes.ERROR:
        return {
          container: 'bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-red-400/30 dark:border-red-500/30 shadow-xl',
          accent: 'bg-gradient-to-r from-red-400/80 to-pink-500/80 dark:from-red-400/60 dark:to-pink-500/60',
          text: 'text-red-200 dark:text-red-300',
          icon: 'text-red-300 dark:text-red-400'
        };
      case ToastTypes.WARNING:
        return {
          container: 'bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-amber-400/30 dark:border-amber-500/30 shadow-xl',
          accent: 'bg-gradient-to-r from-amber-400/80 to-orange-500/80 dark:from-amber-400/60 dark:to-orange-500/60',
          text: 'text-amber-200 dark:text-amber-300',
          icon: 'text-amber-300 dark:text-amber-400'
        };
      case ToastTypes.INFO:
      default:
        return {
          container: 'bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-indigo-400/30 dark:border-indigo-500/30 shadow-xl',
          accent: 'bg-gradient-to-r from-indigo-400/80 to-purple-500/80 dark:from-indigo-400/60 dark:to-purple-500/60',
          text: 'text-indigo-200 dark:text-indigo-300',
          icon: 'text-indigo-300 dark:text-indigo-400'
        };
    }
  };
  
  // Define icon based on toast type
  const getTypeIcon = () => {
    const styles = getTypeStyles();
    
    switch (type) {
      case ToastTypes.SUCCESS:
        return (
          <div className="w-8 h-8 bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-green-400/30 dark:border-green-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case ToastTypes.ERROR:
        return (
          <div className="w-8 h-8 bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-400/30 dark:border-red-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case ToastTypes.WARNING:
        return (
          <div className="w-8 h-8 bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-amber-400/30 dark:border-amber-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case ToastTypes.INFO:
      default:
        return (
          <div className="w-8 h-8 bg-white/20 dark:bg-gray-700/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-indigo-400/30 dark:border-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  const styles = getTypeStyles();
  
  const toast = (
    <div 
      className={`fixed top-6 right-6 z-50 max-w-md transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      }`}
      role="alert"
    >
      <div className={`${styles.container} rounded-xl p-5 relative overflow-hidden`}>
        {/* Gradient accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accent}`}></div>
        
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0">
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium leading-relaxed ${styles.text}`}>
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
            className="flex-shrink-0 w-6 h-6 bg-white/10 dark:bg-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-600/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-white/20 dark:border-gray-600/30 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
  
  return createPortal(toast, document.body);
}
