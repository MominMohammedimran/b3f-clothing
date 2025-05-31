
/**
 * Security Utility Functions
 */

// Function to check password strength
export const checkPasswordStrength = (password: string) => {
  // Initialize score and feedback
  let strength = 'weak';
  let message = 'Password is too weak';
  
  // If password is empty, return default weak status
  if (!password) {
    return { strength, message };
  }
  
  // Check password length
  if (password.length < 8) {
    return { strength, message: 'Password should be at least 8 characters long' };
  }
  
  // Check for uppercase, lowercase, numbers, and special characters
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Calculate score based on criteria
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChars) score++;
  
  // Set strength and message based on score
  if (score >= 5) {
    strength = 'strong';
    message = 'Strong password';
  } else if (score >= 3) {
    strength = 'medium';
    message = 'Medium-strength password';
  }
  
  // Add specific feedback
  if (!hasUpperCase) message += ', add uppercase letters';
  if (!hasLowerCase) message += ', add lowercase letters';
  if (!hasNumbers) message += ', add numbers';
  if (!hasSpecialChars) message += ', add special characters';
  
  return { strength, message };
};

// Function to sanitize user inputs (prevent XSS)
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Function to prevent SQL injection in search queries
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';
  // Remove SQL commands and special characters
  return query
    .replace(/[;'"\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

// Generate a CSRF token
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Function to check session security (added to fix build error)
export const checkSessionSecurity = async (): Promise<boolean> => {
  // This function would validate the security of the current session
  // In a real app, this would check for token validity, expiration, etc.
  try {
    // Check for token existence in localStorage
    const hasToken = localStorage.getItem('supabase.auth.token') !== null;
    return hasToken;
  } catch (error) {
    console.error('Session security check failed:', error);
    return false;
  }
};

// Function to enforce HTTPS (added to fix build error)
export const enforceHttps = (): boolean => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      window.location.href = window.location.href.replace('http:', 'https:');
      return false;
    }
  }
  return true;
};

// Function to verify SSL certificate (added to fix build error)
export const verifySslCertificate = (): boolean => {
  // In a browser environment, this is handled automatically
  // This is a placeholder function to satisfy the type requirements
  return true;
};
