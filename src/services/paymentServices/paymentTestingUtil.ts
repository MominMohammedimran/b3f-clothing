
/**
 * Utility functions for payment testing and validation
 */

// Simulate different payment scenarios for testing
export const simulatePaymentResponse = (
  scenario: 'success' | 'declined' | 'network_error' | 'timeout' = 'success',
  delay: number = 1000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch(scenario) {
        case 'success':
          resolve({
            success: true,
            paymentId: `test_pay_${Math.random().toString(36).substring(2, 10)}`,
            message: 'Payment successful'
          });
          break;
        case 'declined':
          reject({
            success: false,
            code: 'card_declined',
            message: 'Payment was declined by the issuing bank'
          });
          break;
        case 'network_error':
          reject({
            success: false,
            code: 'network_error',
            message: 'Network error occurred during payment processing'
          });
          break;
        case 'timeout':
          reject({
            success: false,
            code: 'timeout',
            message: 'Payment request timed out'
          });
          break;
        default:
          reject({
            success: false,
            code: 'unknown_error',
            message: 'An unknown error occurred'
          });
      }
    }, delay);
  });
};

// Validate payment details before submission
export const validatePaymentData = (
  amount: number,
  currency: string,
  orderId: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!amount || amount <= 0) {
    errors.push('Payment amount must be greater than zero');
  }
  
  if (!currency || currency.trim() === '') {
    errors.push('Currency code is required');
  } else if (currency.length !== 3) {
    errors.push('Currency code must be a 3-letter ISO format (e.g. USD, INR)');
  }
  
  if (!orderId || orderId.trim() === '') {
    errors.push('Order ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Detect test cards for development environment
export const isTestCard = (cardNumber: string): boolean => {
  const testCardPrefixes = [
    '4242424242424242', // Visa test card
    '5555555555554444', // Mastercard test card
    '378282246310005',  // American Express test card
    '4000000000000069', // Visa (declined)
    '4000000000000127'  // Visa (declined)
  ];
  
  return testCardPrefixes.some(prefix => 
    cardNumber.startsWith(prefix.substring(0, Math.min(6, prefix.length)))
  );
};

// Utility to determine if we're in a sandbox/test environment
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV !== 'production' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('test') ||
    window.location.hostname.includes('dev') ||
    window.location.hostname.includes('staging') ||
    import.meta.env.VITE_PAYMENT_MODE === 'test';
};
