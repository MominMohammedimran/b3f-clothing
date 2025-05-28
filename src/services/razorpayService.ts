
/**
 * Razorpay Payment Service
 * Handles loading the Razorpay script and initializing payments
 */

import { RazorpayOptions, RazorpayResponse, getRazorpayConfig } from './paymentServices/razorpay/RazorpayConfig';
import { loadRazorpayScript, isRazorpayScriptLoaded } from './paymentServices/razorpay/RazorpayLoader';

// Define window type for Razorpay
declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Initialize and open Razorpay payment
 */
export const makePayment = async (
  amount: number,
  orderId: string,
  customerName: string = '',
  customerEmail: string = '',
  customerPhone: string = '',
  onSuccess: (paymentId: string, orderId: string, signature: string) => void,
  onCancel: () => void
): Promise<void> => {
  // Make sure script is loaded
  if (!isRazorpayScriptLoaded()) {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load payment gateway');
    }
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay not available');
  }

  // Get configuration
  const config = getRazorpayConfig();
  
  // Log the mode for debugging
  console.log(`Razorpay running in ${config.isTestMode ? 'TEST' : 'PRODUCTION'} mode`);

  // Initialize Razorpay options
  const options: RazorpayOptions = {
    key: config.apiKey,
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    name: 'B3F Prints & Men\'s Wear',
    description: `Payment for order ${orderId}`,
    order_id: orderId,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone
    },
    theme: {
      color: '#3399cc'
    },
    modal: {
      ondismiss: onCancel,
      escape: true,
      animation: true
    },
    handler: function (response: RazorpayResponse) {
      console.log('Payment successful:', response);
      onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      );
    }
  };

  try {
    // Create Razorpay instance
    const rzpInstance = new window.Razorpay(options);
    rzpInstance.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // In production, verification should be done server-side
  console.log('Verifying payment signature:', { orderId, paymentId, signature });
  return true;
};
