'use client';

export default function LoadingSpinner({ 
  size = 'medium', 
  fullScreen = false,
  message = 'Loading...',
  showMessage = true
}) {
  
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
      <div className="fixed inset-0 hero-gradient dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 backdrop-blur-md flex items-center justify-center z-50">
        <div className="hero-pattern w-full h-full absolute inset-0 opacity-10 dark:opacity-5"></div>
        
        <div className="relative bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-8 rounded-xl shadow-2xl flex flex-col items-center">
          {/* Animated container */}
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-md animate-pulse"></div>
            
            {/* Main spinner */}
            <div className={`relative ${spinnerSize} animate-spin rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-indigo-300 dark:to-purple-400`}>
              <div className="absolute inset-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-full"></div>
            </div>
          </div>
          
          {showMessage && (
            <div className="mt-6 text-center">
              <p className="text-white dark:text-gray-200 font-medium text-lg mb-2">{message}</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-indigo-400/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-400/60 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Inline spinner
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Themed container */}
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-600/30 p-6 rounded-xl shadow-xl">
        <div className="flex flex-col items-center">
          {/* Animated container */}
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-lg animate-pulse"></div>
            
            {/* Main spinner */}
            <div className={`relative ${spinnerSize} animate-spin rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-indigo-300 dark:to-purple-400`}>
              <div className="absolute inset-1 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-full"></div>
            </div>
          </div>
          
          {showMessage && (
            <div className="mt-4 text-center">
              <p className="text-white dark:text-gray-200 font-medium">{message}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
