
import React, { useEffect, useState } from 'react'; 
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, AlertTriangle } from 'lucide-react';
import { formatIndianRupees } from '@/utils/currency';
import { useAuth } from '@/context/AuthContext';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayCheckoutProps {
  amount: number;
  customOrderId: string; // Your internal order ID
  onSuccess: (transactionDetails: any) => void;
  onFailure: () => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  customOrderId,
  onSuccess,
  onFailure
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isTestMode] = useState(false); // Switch to true for testing
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    loadRazorpayScript().then(setIsScriptLoaded);
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      if (!(window as any).Razorpay && !(await loadRazorpayScript())) {
        throw new Error('Razorpay not available');
      }

      const name = userProfile?.display_name || currentUser?.user_metadata?.full_name || 'Customer';
      const email = currentUser?.email || userProfile?.email || 'customer@example.com';
      const phone = userProfile?.phone_number || currentUser?.user_metadata?.phone || '9999999999';

      // Call your deployed Supabase Edge Function URL here:
      const createRes = await fetch(`https://cmpggiyuiattqjmddcac.functions.supabase.co/create-razorpay-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('@/integrations/supabase/client')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`
        },
        body: JSON.stringify({
          amount,
          orderId: customOrderId
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.order_id) {
        throw new Error(createData.error || 'Failed to create Razorpay order');
      }

      const razorpay = new (window as any).Razorpay({
        key: "rzp_live_FQUylFpHDtgrDj", // Your live Razorpay public key
        amount: createData.amount, // amount in paise
        currency: createData.currency,
        name: "B3F Prints & Men's Wear",
        description: `Payment for Order #${customOrderId}`,
        order_id: createData.order_id,
        prefill: {
          name,
          email,
          contact: phone
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment was cancelled');
            onFailure();
            setIsLoading(false);
          },
        },
        handler: async function (response: any) {
          try {
            // Optionally verify payment signature server-side here if needed
            toast.success('Payment successful!');
            onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount,
              currency: 'INR',
            });
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            toast.error('Payment verification failed.');
            onFailure();
          } finally {
            setIsLoading(false);
          }
        },
      });

      razorpay.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        onFailure();
        setIsLoading(false);
      });

      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('Payment failed: ' + (err.message || 'Unknown error'));
      onFailure();
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {isTestMode && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center text-yellow-700">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="text-xs">Test mode enabled — no real payments processed.</span>
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={isLoading || !isScriptLoaded}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
      >
        {isLoading ? 'Processing...' : `Pay ${formatIndianRupees(amount)} with Razorpay`}
      </Button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center">
          <Shield className="w-3 h-3 mr-1" />
          <p>Secure payments by Razorpay</p>
        </div>
        <p className="mt-1">By continuing, you agree to our terms of service.</p>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
