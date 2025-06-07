import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface BharatPeUpiPaymentProps {
  orderData: {
    orderId: string;
    total: number;
    items: any[];
    shippingAddress: any;
  };
  onSuccess?: () => void;
}

const BharatPeUpiPayment: React.FC<BharatPeUpiPaymentProps> = ({ orderData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [vpa, setVpa] = useState('');
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const PAYEE_UPI = 'BHARATPE.8S0W0O7J1S27237@fbpe';
  const PAYEE_NAME = 'B3F Prints';

  const upiLink = `upi://pay?pa=${PAYEE_UPI}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${orderData.total}&cu=INR&tn=Order ${orderData.orderId}`;

  const handlePayment = async () => {
    if (!currentUser) {
      toast.error('Please sign in to continue');
      return;
    }

    if (!vpa || !vpa.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. yourname@upi)');
      return;
    }

    setLoading(true);

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          order_number: orderData.orderId,
          total: orderData.total,
          status: 'pending',
          items: orderData.items,
          payment_method: 'upi',
          shipping_address: orderData.shippingAddress,
          upi_input: vpa,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      await clearCart();

      // Redirect to UPI link (only works on mobile)
      window.location.href = upiLink;

      // Fallback after 20s
      setTimeout(() => {
        navigate(`/order-complete?orderId=${order.id}&orderNumber=${orderData.orderId}`);
      }, 20000);

      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create order or redirect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pay with UPI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">₹{orderData.total.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Order: {orderData.orderId}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your UPI ID (e.g. yourname@upi)</label>
          <input
            type="text"
            value={vpa}
            onChange={(e) => setVpa(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter your UPI ID"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded border">
          <p className="font-medium">Pay to:</p>
          <p className="font-mono">{PAYEE_UPI}</p>
          <p className="text-sm text-gray-600">{PAYEE_NAME}</p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You will be redirected to your UPI app to complete the payment.
        </p>

        <div className="text-center mt-4">
          <p className="text-sm font-medium mb-2">Or scan this QR code</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
              upiLink
            )}&size=200x200`}
            alt="UPI QR Code"
            className="mx-auto rounded border"
          />
          <p className="text-xs text-gray-500 mt-1">Scan with PhonePe, GPay, or Paytm</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BharatPeUpiPayment;
