
/**
 * Resource prefetching utilities to improve page load performance
 */

// Define NetworkInformation interface for type safety
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

// Extend Navigator type to include connection property
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

/**
 * Prefetch a page by its URL
 * This loads the page into the browser's cache for faster navigation
 */
export const prefetchPage = (url: string): void => {
  if (!url || !document) return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  
  // Add to document head
  document.head.appendChild(link);
  console.log(`Prefetched page: ${url}`);
};

/**
 * Prefetch an image by its URL
 * This loads the image into the browser's cache for faster display
 */
export const prefetchImage = (url: string): void => {
  if (!url || !document) return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'image';
  
  // Add to document head
  document.head.appendChild(link);
};

/**
 * Prefetch multiple images at once
 */
export const prefetchImages = (urls: string[]): void => {
  if (!urls || !urls.length) return;
  
  urls.forEach(url => prefetchImage(url));
};

/**
 * Get network connection information with proper type handling
 */
const getNetworkConnection = (): NetworkInformation | undefined => {
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
};

/**
 * Intelligently prefetch resources based on current view
 * @param type The type of resources to prefetch ('images', 'pages' or 'all')
 * @param paths The paths to prefetch
 */
export const smartPrefetch = (
  type: 'images' | 'pages' | 'all', 
  paths: string[]
): void => {
  // Skip if no support or no paths
  if (!document || !paths.length) return;
  
  // Use the connection API with proper type safety
  const connection = getNetworkConnection();
  
  // Don't prefetch if the user has set data saver mode
  if (connection?.saveData) {
    console.log('Data saver mode is enabled, skipping prefetch');
    return;
  }
  
  // Check for slow connections
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    console.log('Slow connection detected, skipping prefetch');
    return;
  }
  
  // Determine what to prefetch based on type
  if (type === 'pages' || type === 'all') {
    paths.filter(p => !p.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
         .forEach(path => prefetchPage(path));
  }
  
  if (type === 'images' || type === 'all') {
    paths.filter(p => p.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
         .forEach(path => prefetchImage(path));
  }
};
