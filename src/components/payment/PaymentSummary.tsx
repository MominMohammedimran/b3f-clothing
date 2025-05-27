
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentSummaryProps {
  orderData: any;
  loading: boolean;
  handlePaymentSubmit: () => void;
  paymentMethod: string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  orderData,
  loading,
  handlePaymentSubmit,
  paymentMethod
}) => {
  if (!orderData) return null;
  
  const formatPaymentMethodName = (method: string): string => {
    switch(method) {
      case 'razorpay': return 'Razorpay';
      case 'upi': return 'UPI';
      case 'cod': return 'Cash on Delivery';
      default: return method;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Order Number</span>
          <span className="font-medium">{orderData.orderNumber}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({orderData.items ? orderData.items.length : 0})</span>
          <span className="font-medium">{formatCurrency(orderData.subtotal || 0)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{formatCurrency(orderData.deliveryFee || 0)}</span>
        </div>
        
        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">{formatCurrency(orderData.total || 0)}</span>
        </div>
      </div>
      
      <Button 
        onClick={handlePaymentSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </div>
        ) : `Pay Now with ${formatPaymentMethodName(paymentMethod)}`}
      </Button>
      
      <div className="mt-4 text-center text-xs text-gray-500">
        By proceeding, you agree to our <Link to="/terms-conditions" className="text-blue-600 hover:underline">Terms & Conditions</Link>
      </div>
    </div>
  );
};

export default PaymentSummary;
