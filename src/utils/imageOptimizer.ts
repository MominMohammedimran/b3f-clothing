
/**
 * Image optimization utilities
 */

/**
 * Determine the appropriate image size based on screen width
 */
export const getOptimalImageSize = (screenWidth: number): string => {
  if (screenWidth <= 640) return 'small'; // mobile
  if (screenWidth <= 1024) return 'medium'; // tablet
  return 'large'; // desktop
};

/**
 * Convert a standard image URL to an optimized version
 * This function can be customized based on your image hosting service
 */
export const getOptimizedImageUrl = (
  url: string, 
  width?: number, 
  quality: number = 80
): string => {
  // If URL is already optimized or empty, return as is
  if (!url || url.includes('?w=') || url.includes('&q=')) {
    return url;
  }

  // Handle different image providers
  if (url.includes('unsplash.com')) {
    // Unsplash already provides optimization parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width || 800}&q=${quality}`;
  }
  
  if (url.includes('cloudinary.com')) {
    // Cloudinary optimization format
    return url.replace('/upload/', `/upload/q_${quality},w_${width || 800}/`);
  }

  // For images hosted on your own domain or other services
  // Just add basic query parameters
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width || 800}&quality=${quality}`;
};

/**
 * Check if an element is in the viewport
 */
export const isInViewport = (element: HTMLElement, offset: number = 200): boolean => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top <= (window.innerHeight + offset) &&
    rect.bottom >= -offset &&
    rect.left <= (window.innerWidth + offset) &&
    rect.right >= -offset
  );
};
