
interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  resourceTiming?: PerformanceResourceTiming[];
}

// Add interface for Performance memory which is non-standard but available in Chrome
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Extend the Performance interface to include the memory property
interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export const measurePagePerformance = (): PerformanceMetrics => {
  const now = Date.now();
  const navigationStart = performance.timing ? performance.timing.navigationStart : 0;
  const loadTime = now - (window.performance.timing?.navigationStart || now);
  const domContentLoaded = window.performance.timing?.domContentLoadedEventEnd 
    - window.performance.timing?.navigationStart || 0;
  
  // Get resource timing data
  const resourceTimings = performance.getEntriesByType('resource');
  
  const metrics: PerformanceMetrics = {
    loadTime,
    domContentLoaded,
    resourceTiming: resourceTimings as PerformanceResourceTiming[],
  };

  try {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) metrics.firstContentfulPaint = fcp.startTime;
    
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const lcp = list.getEntries().at(-1);
        if (lcp) {
          metrics.largestContentfulPaint = lcp.startTime;
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
  } catch (err) {
    // Error silently handled
  }
  
  return metrics;
};

export const logPerformance = (pageName: string): void => {
  if (document.readyState === 'complete') {
    measurePagePerformance();
  } else {
    window.addEventListener('load', () => {
      measurePagePerformance();
    });
  }
};

function analyzeResourceTiming(resources: PerformanceResourceTiming[]) {
  const analysis = {
    totalResources: resources.length,
    slowestResources: [] as { name: string; duration: number }[],
    totalTransferSize: 0,
    totalDuration: 0,
  };

  resources.forEach(resource => {
    const duration = resource.responseEnd - resource.startTime;
    analysis.totalDuration += duration;
    analysis.totalTransferSize += resource.transferSize || 0;

    if (duration > 500) {
      analysis.slowestResources.push({
        name: resource.name,
        duration,
      });
    }
  });

  return analysis;
}

export const setupPerformanceMonitoring = () => {
  // Monitor route changes and page loads
  logPerformance(window.location.pathname);
  
  // Monitor long tasks silently
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver(() => {
        // Silent monitoring
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Error silently handled
    }
  }

  // No more memory usage logging
};
