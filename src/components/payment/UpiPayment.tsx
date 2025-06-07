
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface UpiPaymentProps {
  orderData: {
    orderId: string;
    total: number;
    items: any[];
    shippingAddress: any;
  };
  onSuccess: () => void;
}

const UpiPayment: React.FC<UpiPaymentProps> = ({ orderData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  // BharatPe UPI payment details
  const UPI_ID = "BHARATPE.8S0W0O7J1S27237@fbpe";
  const MERCHANT_NAME = "B3F Prints";

  const generateUpiLink = () => {
    const amount = orderData.total.toFixed(2);
    const transactionNote = `Order Payment`;
    
    // Create UPI deep link
    const upiParams = new URLSearchParams({
      pa: UPI_ID, // Payee address
      pn: MERCHANT_NAME, // Payee name
      am: amount, // Amount
      cu: 'INR', // Currency
      tn: transactionNote, // Transaction note
    });

    return `upi://pay?${upiParams.toString()}`;
  };

  const handleUpiPayment = async () => {
    if (!currentUser) {
      toast.error('Please sign in to continue');
      return;
    }

    setLoading(true);

    try {
      // Create order in database first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          order_number: orderData.orderId,
          total: orderData.total,
          status: 'pending',
          items: orderData.items,
          payment_method: 'upi',
          shipping_address: orderData.shippingAddress,
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Clear cart after successful order creation
      await clearCart();

      // Generate UPI deep link
      const upiLink = generateUpiLink();
      
      // Try to open UPI app
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, try to open UPI app
        window.location.href = upiLink;
        
        // Set a timeout to redirect to order complete page
        setTimeout(() => {
          navigate(`/order-complete?orderId=${order.id}&orderNumber=${orderData.orderId}`);
        }, 3000);
      } else {
        // On desktop, show UPI ID and redirect to order complete
        toast.success(`Please pay ₹${orderData.total} to UPI ID: ${UPI_ID}`);
        setTimeout(() => {
          navigate(`/order-complete?orderId=${order.id}&orderNumber=${orderData.orderId}`);
        }, 2000);
      }

      onSuccess();

    } catch (error: any) {
      console.error('UPI Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">UPI Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-green-600">₹{orderData.total.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Order: {orderData.orderId}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <p className="font-medium text-blue-800">Pay to UPI ID:</p>
          <p className="text-lg font-mono bg-white p-2 rounded border break-all">{UPI_ID}</p>
          <p className="text-sm text-blue-600">{MERCHANT_NAME}</p>
        </div>

        <Button 
          onClick={handleUpiPayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {loading ? 'Processing...' : 'Pay with UPI'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You will be redirected to complete your payment and upload proof
        </p>
      </CardContent>
    </Card>
  );
};

export default UpiPayment;
