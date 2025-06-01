
/**
 * Utility for loading the Razorpay script
 */

// Cache for script loading status
let isScriptLoading = false;
let isScriptLoaded = false;

/**
 * Loads the Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      isScriptLoaded = true;
      console.log('Razorpay script already loaded');
      return resolve(true);
    }

    if (isScriptLoading) {
      // Check every 100ms if script has loaded
      const checkScriptLoaded = setInterval(() => {
        if ((window as any).Razorpay) {
          clearInterval(checkScriptLoaded);
          isScriptLoaded = true;
          console.log('Razorpay script loaded during polling');
          resolve(true);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScriptLoaded);
        console.error('Timed out waiting for Razorpay script to load');
        resolve(false);
      }, 10000);
      
      return;
    }

    isScriptLoading = true;
    console.log('Loading Razorpay script...');
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      isScriptLoading = false;
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

export const isRazorpayScriptLoaded = (): boolean => {
  return isScriptLoaded || !!(window as any).Razorpay;
};