
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { formatIndianRupees } from '@/utils/currency';
import { useAuth } from '@/context/AuthContext';
import { makePayment } from '@/services/razorpayService';

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
  const { currentUser } = useAuth();

  useEffect(() => {
    // Import Razorpay from service instead of loading script directly
    const loadRazorpay = async () => {
      try {
        const { loadRazorpayScript, isRazorpayScriptLoaded } = await import('@/services/paymentServices/razorpay/RazorpayLoader');
        
        if (!isRazorpayScriptLoaded()) {
          const loaded = await loadRazorpayScript();
          setIsScriptLoaded(loaded);
          
          if (!loaded) {
            toast.error('Could not load payment gateway. Please try again later.');
          }
        } else {
          setIsScriptLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Razorpay script:', error);
        toast.error('Payment service unavailable. Please try again later.');
      }
    };

    loadRazorpay();
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Use the service function to handle payment
      const customerName = currentUser?.user_metadata?.full_name || '';
      const customerEmail = currentUser?.email || '';
      const customerPhone = currentUser?.user_metadata?.phone || '';
      
      await makePayment(
        amount,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        (paymentId, orderId, signature) => {
          // Success callback
          onSuccess({
            paymentId,
            orderId,
            signature,
            amount,
            currency: 'INR'
          });
          toast.success('Payment successful!');
          setIsLoading(false);
        },
        () => {
          // Cancel callback
          onFailure();
          toast.error('Payment was cancelled');
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + (error.message || 'Unknown error'));
      onFailure();
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
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
