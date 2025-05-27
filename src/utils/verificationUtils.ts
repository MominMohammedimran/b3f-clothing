
/**
 * Utility functions for user verification during development
 * In production, these would be replaced with actual verification flows
 */

// Store verification tokens in memory for development purposes
const devVerificationTokens = new Map<string, { token: string; expiresAt: Date }>();

/**
 * Create a verification token for a user
 * In production, this would be stored in a database table
 */
export const createVerificationToken = (userId: string): string => {
  // Generate a random 6-digit token
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration time to 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  
  // Store the token in our in-memory store
  devVerificationTokens.set(userId, { token, expiresAt });
  
  return token;
};

/**
 * Verify a token for a user
 * @returns true if the token is valid, false otherwise
 */
export const verifyToken = (userId: string, token: string): boolean => {
  const tokenData = devVerificationTokens.get(userId);
  
  if (!tokenData) {
    return false;
  }
  
  // Check if token has expired
  if (new Date() > tokenData.expiresAt) {
    // Remove expired token
    devVerificationTokens.delete(userId);
    return false;
  }
  
  // Check if token matches
  const isValid = tokenData.token === token;
  
  // If valid, remove the token (one-time use)
  if (isValid) {
    devVerificationTokens.delete(userId);
  }
  
  return isValid;
};

/**
 * Verify the default development token (for easier testing)
 */
export const verifyDefaultToken = (token: string): boolean => {
  return token === '123456';
};
