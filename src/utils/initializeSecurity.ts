
import { enforceHttps, setContentSecurityPolicy } from './securityUtils';

/**
 * Initialize security features for the application
 * Call this function at the application startup
 */
export const initializeAppSecurity = (): void => {
  // Enforce HTTPS in production
  enforceHttps();
  
  // Set Content Security Policy (only CSP can be set via meta tag)
  setContentSecurityPolicy();
  
  // Log security initialization
  console.info('Security features initialized');
};

export default initializeAppSecurity;
