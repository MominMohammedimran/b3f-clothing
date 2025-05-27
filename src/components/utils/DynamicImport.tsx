
import { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '../ui/skeleton';

interface DynamicImportProps {
  importFunction: () => Promise<{ default: ComponentType<any> }>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
}

export const DynamicImport = ({
  importFunction,
  props = {},
  fallback = <Skeleton className="w-full h-48" />
}: DynamicImportProps) => {
  const LazyComponent = lazy(importFunction);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default DynamicImport;
