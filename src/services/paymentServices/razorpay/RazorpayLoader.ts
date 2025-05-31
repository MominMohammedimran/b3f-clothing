
/**
 * Utility functions for loading and managing the Razorpay script
 */

// Check if the Razorpay script is already loaded
export const isRazorpayScriptLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
};

// Load the Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isRazorpayScriptLoaded()) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
