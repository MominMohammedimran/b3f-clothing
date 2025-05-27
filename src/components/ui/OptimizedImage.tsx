
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  quality = 80,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(priority); // If priority, consider it visible immediately

  useEffect(() => {
    // Only set up observer if not priority loading
    if (!priority && imgRef.current) {
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // Disconnect once image is visible
          if (observer.current) {
            observer.current.disconnect();
          }
        }
      }, {
        rootMargin: '200px', // Start loading when image is 200px from viewport
      });
      
      observer.current.observe(imgRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };
  
  const optimizedSrc = isVisible ? getOptimizedImageUrl(src, width, quality) : '';
  
  return (
    <div 
      className={`relative ${className}`} 
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width}/${height}` : 'auto',
      }}
      ref={imgRef}
    >
      {(!isLoaded && isVisible) && (
        <Skeleton className={`absolute inset-0 w-full h-full rounded`} />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-md">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
      
      {isVisible && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};
