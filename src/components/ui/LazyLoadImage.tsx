
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from './skeleton';

interface LazyLoadImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  fallbackSrc?: string;
  quality?: 'low' | 'medium' | 'high';
}

export const LazyLoadImage: React.FC<LazyLoadImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/placeholder.svg',
  quality = 'medium',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimize image URL based on quality parameter
  const getOptimizedUrl = (url: string) => {
    if (url.includes('unsplash.com')) {
      // Add quality and size parameters for Unsplash images
      const qualityMap = {
        low: 'q=60&w=400',
        medium: 'q=75&w=800',
        high: 'q=90&w=1200'
      };
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${qualityMap[quality]}`;
    }
    return url;
  };

  useEffect(() => {
    // Set up intersection observer for lazy loading
    if (imageRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setImageSrc(getOptimizedUrl(src));
          observerRef.current?.unobserve(entry.target);
        }
      });
      
      observerRef.current.observe(imageRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
    setImageSrc(fallbackSrc);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width || 'auto', 
        height: height || 'auto' 
      }}
    >
      {!isLoaded && (
        <Skeleton 
          className="absolute inset-0 w-full h-full" 
        />
      )}
      
      <img
        ref={imageRef}
        src={imageSrc || fallbackSrc}
        alt={alt}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default LazyLoadImage;
