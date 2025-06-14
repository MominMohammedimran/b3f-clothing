
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
 * Set comprehensive security headers via meta tags
 */
export const setContentSecurityPolicy = (): void => {
  if (typeof document !== 'undefined') {
    // Content Security Policy
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingCSP) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;");
      document.head.appendChild(meta);
    }

    // Strict Transport Security (HSTS)
    const existingHSTS = document.querySelector('meta[http-equiv="Strict-Transport-Security"]');
    if (!existingHSTS) {
      const hstsMeta = document.createElement('meta');
      hstsMeta.setAttribute('http-equiv', 'Strict-Transport-Security');
      hstsMeta.setAttribute('content', 'max-age=31536000; includeSubDomains; preload');
      document.head.appendChild(hstsMeta);
    }

    // X-Content-Type-Options
    const existingContentTypeOptions = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!existingContentTypeOptions) {
      const contentTypeMeta = document.createElement('meta');
      contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
      contentTypeMeta.setAttribute('content', 'nosniff');
      document.head.appendChild(contentTypeMeta);
    }

    // Referrer Policy
    const existingReferrerPolicy = document.querySelector('meta[name="referrer"]');
    if (!existingReferrerPolicy) {
      const referrerMeta = document.createElement('meta');
      referrerMeta.setAttribute('name', 'referrer');
      referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
      document.head.appendChild(referrerMeta);
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
