'use client';

export default function LoadingSpinner({ 
  size = 'medium', 
  fullScreen = false,
  message = 'Loading...',
  showMessage = true
}) {
  
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-16 w-16 border-4',
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className={`${spinnerSize} animate-spin rounded-full border-neutral-950 border-t-transparent`}></div>
          
          {showMessage && (
            <p className="mt-4 text-neutral-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${spinnerSize} animate-spin rounded-full border-neutral-950 border-t-transparent`}></div>
      
      {showMessage && (
        <p className="mt-4 text-neutral-600 font-medium">{message}</p>
      )}
    </div>
  );
}
