
import React from 'react';
import RazorpayCheckout from './RazorpayCheckout';

interface PaymentProcessorProps {
  paymentMethod: string;
  orderData: any;
  onSuccess?: (data: any) => void;
  onFailure?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ 
  paymentMethod, 
  orderData,
  onSuccess = () => {},
  onFailure = () => {} 
}) => {
  if (!orderData) return null;
  
  // Handle different payment methods
  switch (paymentMethod.toLowerCase()) {
    case 'razorpay':
      return (
        <RazorpayCheckout
          amount={orderData.total || 0}
          orderId={orderData.id || orderData.order_number || 'order-id'}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      );
    
    case 'upi':
      // Placeholder for UPI payment handling
      return null;
    
    case 'cod':
      // Placeholder for Cash on Delivery handling
      return null;
    
    default:
      return null;
  }
};

export default PaymentProcessor;
