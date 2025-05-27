
import { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

interface LazyLoadWrapperProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  timeout?: number;
}

export const LazyLoadWrapper = ({ 
  importFunc, 
  props = {},
  fallback = <Skeleton className="w-full h-40" />,
  timeout = 10000
}: LazyLoadWrapperProps) => {
  const [error, setError] = useState<Error | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutError(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <p>Error loading component: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Reload page
        </button>
      </div>
    );
  }

  if (timeoutError) {
    return (
      <div className="p-4 text-yellow-600 bg-yellow-50 rounded-lg">
        <p>Loading is taking longer than expected.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const LazyComponent = lazy(() => 
    importFunc().catch(err => {
      setError(err);
      throw err;
    })
  );

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
