
/**
 * Security utility functions for the application
 */

/**
 * Enforce HTTPS in production environment
 */
export const enforceHttps = (): void => {
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
  }
};

/**
 * Set Content Security Policy via meta tag (only CSP can be set this way)
 */
export const setContentSecurityPolicy = (): void => {
  if (typeof document !== 'undefined') {
    // Only CSP can be set via meta tag
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;");
      document.head.appendChild(meta);
    }
  }
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): { score: number; feedback: string[]; strength: string; message: string } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  let strength = 'Weak';
  let message = 'Password is too weak';

  if (score >= 4) {
    strength = 'Strong';
    message = 'Password is strong';
  } else if (score >= 3) {
    strength = 'Medium';
    message = 'Password is medium strength';
  }

  return { score, feedback, strength, message };
};

/**
 * Check session security
 */
export const checkSessionSecurity = (): boolean => {
  // Basic session security checks
  return typeof window !== 'undefined' && 
         window.location.protocol === 'https:';
};

/**
 * Initialize all security measures
 */
export const initializeSecurity = (): void => {
  enforceHttps();
  setContentSecurityPolicy();
};

// Export all functions for use in other parts of the application
export default {
  enforceHttps,
  setContentSecurityPolicy,
  checkPasswordStrength,
  checkSessionSecurity,
  initializeSecurity
};
