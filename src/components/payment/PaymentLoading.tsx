
import React from 'react';
import { Loader2 } from 'lucide-react';

interface PaymentLoadingProps {
  message?: string;
}

const PaymentLoading: React.FC<PaymentLoadingProps> = ({ 
  message = 'Processing your payment...'
}) => {
  return (
    <div className="container-custom py-12 mt-10">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default PaymentLoading;
