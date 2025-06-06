import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
const OrderComplete = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Verifying payment...');

useEffect(() => {
  const paymentId = searchParams.get('razorpay_payment_id');
  const orderId = searchParams.get('razorpay_order_id');
  const signature = searchParams.get('razorpay_signature');

  if (!paymentId || !orderId) {
    setStatus('Payment failed or cancelled.');
    return;
  }

  const storePayment = async () => {
    try {
      const { error } = await supabase.from('payments').insert([
        {
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          status: 'paid', // or "pending"
        },
      ]);

      if (error) {
        console.error('Error saving to Supabase:', error);
        setStatus('Payment received but failed to store.');
      } else {
        setStatus('✅ Payment successful and stored!');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error storing payment info.');
    }
  };

  storePayment();
}, [searchParams]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Status</h1>
      <p>{status}</p>

      {searchParams.get('razorpay_payment_id') && (
        <div className="mt-4 text-sm space-y-2">
          <div><strong>Payment ID:</strong> {searchParams.get('razorpay_payment_id')}</div>
          <div><strong>Order ID:</strong> {searchParams.get('razorpay_order_id')}</div>
        </div>
      )}
    </div>
  );
};

export default OrderComplete;
