
import React from 'react';
import RazorpayCheckout from './RazorpayCheckout';

interface PaymentProcessorProps {
  paymentMethod: string;
  orderData: any;
  onSuccess?: () => void;
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
          cartItems={orderData.cartItems || []}
          shippingAddress={orderData.shippingAddress || {}}
          RewardPoints={0}
          onSuccess={onSuccess}
          onError={onFailure}
          onRemoveSize={() => {}}
          onRemoveItem={() => {}}
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
