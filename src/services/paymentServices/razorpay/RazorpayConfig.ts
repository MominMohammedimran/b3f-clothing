
/**
 * Configuration for Razorpay payment integration
 */

// Razorpay response interface
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Razorpay configuration options
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
  };
  handler?: (response: RazorpayResponse) => void;
}

// Environment configuration
export const getRazorpayConfig = () => {
  // Always use live mode
  const isLiveMode = true;
  
  // Use the live API key
  const apiKey = "rzp_live_2Mc4YyXZYcwqy8";
  
  return {
    isTestMode: !isLiveMode,
    apiKey
  };
};
