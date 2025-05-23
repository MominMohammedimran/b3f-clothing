
import { enforceHttps, setSecurityHeaders } from './securityUtils';

/**
 * Initialize security features for the application
 * Call this function at the application startup
 */
export const initializeAppSecurity = (): void => {
  // Enforce HTTPS in production
  enforceHttps();
  
  // Set security headers
  setSecurityHeaders();
  
  // Log security initialization
  console.info('Security features initialized');
};

export default initializeAppSecurity;
