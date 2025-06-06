// OrderComplete.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/utils/toastWrapper';

const OrderComplete = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Checking payment...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('razorpay_payment_id');

    if (!paymentId) {
      setStatus('Payment failed or cancelled.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization:
              'Basic ' +
              btoa(`${import.meta.env.RAZORPAY_KEY_ID}:${import.meta.env.RAZORPAY_KEY_SECRET}`),
          },
        });

        const data = await response.json();

        if (data.status === 'captured') {
          setStatus('Payment successful!');
          setDetails(data);
        } else {
          setStatus('Payment not completed.');
        }
      } catch (error) {
        console.error(error);
        setStatus('Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Status</h1>
      <p>{status}</p>

      {details && (
        <div className="mt-4 space-y-2 text-sm">
          <div><strong>Payment ID:</strong> {details.id}</div>
          <div><strong>Amount:</strong> ₹{details.amount / 100}</div>
          <div><strong>Email:</strong> {details.email}</div>
          <div><strong>Contact:</strong> {details.contact}</div>
        </div>
      )}
    </div>
  );
};

export default OrderComplete;
