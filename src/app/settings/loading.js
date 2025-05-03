import LoadingSpinner from '../../components/LoadingSpinner';

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-8"></div>
      
      <div className="card p-6 mb-8">
        <div className="h-6 w-36 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-6"></div>
        
        <div className="space-y-6">
          <div>
            <div className="h-4 w-24 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
          </div>
          
          <div>
            <div className="h-4 w-24 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
          </div>
          
          <div className="pt-4 border-t border-light-border dark:border-dark-border">
            <div className="h-5 w-40 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-6"></div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
                <div className="ml-2 h-4 w-48 bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
              </div>
              
              <div className="flex items-center">
                <div className="h-4 w-4 bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
                <div className="ml-2 h-4 w-56 bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
              </div>
              
              <div>
                <div className="h-4 w-32 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-light-border dark:border-dark-border">
            <div className="h-5 w-32 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-6"></div>
            
            <div>
              <div className="h-4 w-36 bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <div className="h-10 w-32 bg-light-accent dark:bg-dark-accent rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="h-6 w-36 bg-red-200 dark:bg-red-900/30 rounded animate-pulse mb-4"></div>
        <div className="h-4 w-full bg-light-accent dark:bg-dark-accent rounded animate-pulse mb-4"></div>
        <div className="h-10 w-32 bg-red-200 dark:bg-red-900/30 rounded animate-pulse"></div>
      </div>
    </div>
  );
}