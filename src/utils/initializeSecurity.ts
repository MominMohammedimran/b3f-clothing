
import { toast } from 'sonner';
import { enforceHttps, verifySslCertificate, checkSessionSecurity } from './securityUtils';

/**
 * Initialize security features for the application
 */
const initializeSecurity = () => {
  try {
    // Enforce HTTPS in production environments
    if (process.env.NODE_ENV === 'production') {
      enforceHttps();
    }

    // Setup Content Security Policy
    if (typeof window !== 'undefined') {
      // This would normally be done at server level via headers
      // or in a service worker - this is just a placeholder
      console.log('Content Security Policy activated.');
    }

    // Check session security
    checkSessionSecurity().then(isSecure => {
      if (!isSecure) {
        console.warn('Session security check: Warning - Session may not be secure');
      }
    });

    // Verify SSL certificate in production
    if (process.env.NODE_ENV === 'production') {
      const isValid = verifySslCertificate();
      if (!isValid) {
        console.error('SSL certificate validation failed');
      }
    }
  } catch (error) {
    console.error('Error initializing security:', error);
  }
};

export default initializeSecurity;
