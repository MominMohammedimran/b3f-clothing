
import { loadRazorpayScript } from './RazorpayLoader';
import { getRazorpayConfig, RazorpayOptions, RazorpayResponse } from './RazorpayConfig';

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
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Failed to load payment gateway');
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay not available');
  }

  // Get configuration
  const config = getRazorpayConfig();
  
  // Use live key (no test key in this implementation)
  const keyToUse = config.apiKey;
  
  // Log the mode for debugging
  
  // Initialize Razorpay options
  const options: RazorpayOptions = {
    key: keyToUse,
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
    
    // Open Razorpay checkout form
    rzpInstance.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * Note: This should typically be done on the server side
 * This is a placeholder function for client-side verification in test mode
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // In a real implementation, this would be done server-side
   return true;
};
