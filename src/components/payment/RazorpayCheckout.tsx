
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, AlertTriangle } from 'lucide-react';
import { formatIndianRupees } from '@/utils/currency';
import { useAuth } from '@/context/AuthContext';

// Function to load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }

    console.log("Loading Razorpay script...");
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

interface RazorpayCheckoutProps {
  amount: number;
  orderId: string;
  onSuccess: (transactionDetails: any) => void;
  onFailure: () => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  orderId,
  onSuccess,
  onFailure
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isTestMode] = useState(true);
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    const loadScript = async () => {
      try {
        const loaded = await loadRazorpayScript();
        console.log("Razorpay script loaded status:", loaded);
        setIsScriptLoaded(loaded);
        if (!loaded) {
          toast.error('Could not load payment gateway. Please try again later.');
        }
      } catch (error) {
        console.error('Failed to load Razorpay script:', error);
        toast.error('Payment service unavailable. Please try again later.');
      }
    };

    loadScript();
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      if (!(window as any).Razorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded || !(window as any).Razorpay) {
          throw new Error('Razorpay not loaded');
        }
      }
      
      console.log("Initializing Razorpay payment with order:", orderId, "amount:", amount);
      
      // Prepare user information for the payment
      const name = userProfile?.display_name || currentUser?.user_metadata?.full_name || '';
      const email = currentUser?.email || userProfile?.email || '';
      const phone = userProfile?.phone_number || currentUser?.user_metadata?.phone || '';
      
      // For testing, we'll use a mock successful payment
      if (isTestMode) {
        console.log("Test mode: Simulating successful payment");
        
        // Simulate payment processing
        setTimeout(() => {
          const mockPaymentResponse = {
            razorpay_payment_id: `test_pay_${Math.random().toString(36).substring(2, 15)}`,
            razorpay_order_id: orderId,
            razorpay_signature: 'test_signature',
          };
          
          console.log("Test payment successful:", mockPaymentResponse);
          
          onSuccess({
            paymentId: mockPaymentResponse.razorpay_payment_id,
            orderId: mockPaymentResponse.razorpay_order_id,
            signature: mockPaymentResponse.razorpay_signature,
            amount,
            currency: 'INR'
          });
          
          toast.success('Payment successful!');
          setIsLoading(false);
        }, 2000);
        
        return;
      }
      
      // Razorpay options
      const options = {
        key: "rzp_test_NRItHtK5M0vOd5", // Test key 
        amount: amount * 100, // Razorpay takes amount in paise
        currency: "INR",
        name: "B3F Prints & Men's Wear",
        description: `Payment for order ${orderId}`,
        order_id: orderId,
        prefill: {
          name: name || "Customer",
          email: email || "customer@example.com",
          contact: phone || "9999999999"
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            onFailure();
            toast.error('Payment was cancelled');
            setIsLoading(false);
          },
          escape: true,
          animation: true
        },
        handler: function (response: any) {
          console.log("Razorpay payment successful:", response);
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || orderId,
            signature: response.razorpay_signature || 'test-signature',
            amount,
            currency: 'INR'
          });
          toast.success('Payment successful!');
          setIsLoading(false);
        }
      };

      console.log("Creating Razorpay instance with options:", options);

      // Initialize Razorpay instance
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        onFailure();
        setIsLoading(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + (error.message || 'Unknown error'));
      onFailure();
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {isTestMode && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center text-yellow-700">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-xs">Running in test mode. No real payments will be processed.</span>
        </div>
      )}
      
      <Button
        onClick={handlePayment}
        disabled={isLoading || !isScriptLoaded}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
      >
        {isLoading ? 'Processing...' : `Pay with Razorpay ${formatIndianRupees(amount)}`}
      </Button>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center">
          <Shield className="w-3 h-3 mr-1" />
          <p>Secure payment by Razorpay</p>
        </div>
        <p className="mt-1">By continuing, you agree to our terms of service.</p>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
