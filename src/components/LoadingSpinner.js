'use client';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingSpinner({ 
  size = 'medium', 
  fullScreen = false,
  message = 'Loading...',
  showMessage = true
}) {
  const { theme } = useTheme();
  
  // Determine spinner size
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-16 w-16 border-4',
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  
  // Full screen overlay or inline spinner
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-light-background/80 dark:bg-dark-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center p-6 rounded-lg">
          <div className={`${spinnerSize} animate-spin rounded-full border-primary-600 dark:border-primary-400 border-t-transparent dark:border-t-transparent`}></div>
          {showMessage && (
            <p className="mt-4 text-light-text dark:text-dark-text font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Inline spinner
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${spinnerSize} animate-spin rounded-full border-primary-600 dark:border-primary-400 border-t-transparent dark:border-t-transparent`}></div>
      {showMessage && (
        <p className="mt-4 text-light-text/70 dark:text-dark-text/70">{message}</p>
      )}
    </div>
  );
}