
import React, { ReactNode } from 'react';

interface LoadableContentProps {
  isLoading?: boolean;
  error?: string | null;
  loadingContent?: ReactNode;
  errorContent?: ReactNode;
  children?: ReactNode;
  skeletonCount?: number;
  loadingText?: string;
  errorText?: string;
  className?: string;
  skeletonClassName?: string;
  emptyState?: ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
}

const LoadableContent: React.FC<LoadableContentProps> = ({
  error,
  errorContent,
  children,
  errorText = 'Failed to load content',
  className = "bg-white rounded-lg shadow-sm p-8",
  emptyState,
  isEmpty = false,
  emptyText = "No content found",
}) => {
  // Always show children if provided, ignoring loading state
  if (children) {
    return <>{children}</>;
  }
  
  // Handle error state (prioritize showing errors)
  if (error) {
    if (errorContent) {
      return <>{errorContent}</>;
    }
    
    return (
      <div className={className + " text-center"}>
        <p className="text-gray-500 mb-2">{errorText}</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }
  
  // Handle empty state
  if (isEmpty) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    
    return (
      <div className={className + " text-center"}>
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }
  
  // Default: show an empty div with a message if nothing else matches
  return <div className={className + " text-center"}>
    <p className="text-gray-500">No data available</p>
  </div>;
};

export default LoadableContent;
