
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AppPerformanceMonitor: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    const startTime = performance.now();
    
    // Track page navigation
    const trackPageNavigation = () => {
      const loadTime = performance.now() - startTime;
      // Report metrics for analytics
      try {
        if ('sendBeacon' in navigator) {
          const data = new FormData();
          data.append('page', location.pathname);
          data.append('loadTime', loadTime.toString());
          data.append('timestamp', new Date().toISOString());
          
          // This would typically send to an analytics endpoint
          // navigator.sendBeacon('/api/metrics', data);
        }
      } catch (e) {
        console.error('Error reporting metrics:', e);
      }
    };
    
    // Record performance metrics after a short delay to ensure page is rendered
    const timeoutId = setTimeout(trackPageNavigation, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);
  
  // This component doesn't render anything
  return null;
};

export default AppPerformanceMonitor;
