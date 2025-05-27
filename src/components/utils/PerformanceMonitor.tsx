
import { useEffect, useState } from 'react';
import { logPerformance } from '../../utils/performanceMonitor';

interface PerformanceMonitorProps {
  pageName: string;
  enableDebug?: boolean;
}

/**
 * Component that automatically monitors performance metrics for a page
 * Drop this component into any page to track its performance
 */
const PerformanceMonitor = ({ pageName, enableDebug = false }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Log performance when component mounts
    logPerformance(pageName);

    // If debug mode is enabled, collect metrics to display
    if (enableDebug) {
      const collectMetrics = () => {
        const now = Date.now();
        const loadTime = now - (window.performance.timing?.navigationStart || now);
        const domContentLoaded = window.performance.timing?.domContentLoadedEventEnd 
          - window.performance.timing?.navigationStart || 0;

        // Get resource timing data
        const resourceTimings = performance.getEntriesByType('resource');

        const entries = performance.getEntriesByType('paint');
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        
        setMetrics({
          loadTime,
          domContentLoaded,
          firstContentfulPaint: fcp ? fcp.startTime : undefined,
          resourceCount: resourceTimings.length,
        });
      };

      // Collect metrics after page load
      if (document.readyState === 'complete') {
        collectMetrics();
      } else {
        window.addEventListener('load', collectMetrics);
        return () => {
          window.removeEventListener('load', collectMetrics);
        };
      }
    }
  }, [pageName, enableDebug]);

  // Don't render anything in production mode
  if (!enableDebug) {
    return null;
  }

  // In debug mode, render performance metrics
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-sm rounded-lg p-3 text-xs opacity-80 hover:opacity-100 z-50">
      <h4 className="font-bold mb-1">Performance Metrics: {pageName}</h4>
      {metrics ? (
        <ul>
          <li>Load time: {Math.round(metrics.loadTime)}ms</li>
          <li>DOM content loaded: {Math.round(metrics.domContentLoaded)}ms</li>
          {metrics.firstContentfulPaint && (
            <li>First contentful paint: {Math.round(metrics.firstContentfulPaint)}ms</li>
          )}
          <li>Resources: {metrics.resourceCount}</li>
        </ul>
      ) : (
        <p>Collecting metrics...</p>
      )}
    </div>
  );
};

export default PerformanceMonitor;
