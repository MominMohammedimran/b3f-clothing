
import React, { useState, useEffect, useRef } from 'react';
import { isInViewport, getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { Skeleton } from '../ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderClassName?: string;
  quality?: number;
  loadingComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderClassName = '',
  quality = 80,
  loadingComponent,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to check if the image should be loaded
  const checkVisibility = () => {
    if (containerRef.current && !shouldLoad) {
      if (isInViewport(containerRef.current, 300)) {
        setShouldLoad(true);
      }
    }
  };

  useEffect(() => {
    // Check visibility immediately
    checkVisibility();
    
    // Set up visibility check on scroll/resize
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
    
    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);
  
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
    if (onError) onError();
  };
  
  const optimizedSrc = getOptimizedImageUrl(src, width, quality);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}
    >
      {(!isLoaded && shouldLoad) && (
        <div className="absolute inset-0">
          {loadingComponent || 
            <Skeleton className={`w-full h-full rounded-md ${placeholderClassName}`} />
          }
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
      
      {shouldLoad && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{ 
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            objectFit: 'cover' 
          }}
        />
      )}
    </div>
  );
};
