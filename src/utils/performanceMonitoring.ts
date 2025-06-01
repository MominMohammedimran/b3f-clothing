
import { setupPerformanceMonitoring } from './performanceMonitor';

/**
 * Application-wide performance monitoring and optimization
 */
export const initPerformanceOptimizations = () => {
  // Initialize performance monitoring
  setupPerformanceMonitoring();

  // Register performance observers for metrics collection
  if ('PerformanceObserver' in window) {
    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', {
              duration: entry.duration,
              name: entry.name,
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.error('Error setting up long task observer:', e);
    }

    // Monitor layout shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry: any) => {
          if (entry.value > 0.1) {
            console.warn('Significant layout shift detected:', entry);
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.error('Error setting up layout shift observer:', e);
    }
  }

  // Apply resource hint optimizations
  applyResourceHints();
};

// Apply resource hints for faster loading
const applyResourceHints = () => {
  // Preconnect to critical domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://images.unsplash.com',
    'https://cmpggiyuiattqjmddcac.supabase.co'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Prefetch important pages
  const pagesToPrefetch = ['/signin', '/signup', '/products', '/cart'];
  
  pagesToPrefetch.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
  });
};

// Image loading optimization
export const optimizeImageLoading = () => {
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('loading') && !img.hasAttribute('data-no-lazy')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }
};

// Preload critical resources
export const preloadCriticalResources = (resources: string[]) => {
  resources.forEach(resource => {
    if (resource.endsWith('.js')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = resource;
      preloadLink.as = 'script';
      document.head.appendChild(preloadLink);
    } else if (resource.match(/\.(jpe?g|png|gif|webp)$/i)) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = resource;
      preloadLink.as = 'image';
      document.head.appendChild(preloadLink);
    }
  });
};
