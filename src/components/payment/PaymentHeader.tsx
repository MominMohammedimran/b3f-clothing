
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PaymentHeader: React.FC = () => {
  return (
    <div className="flex items-center mb-6">
      <Link to="/checkout" className="mr-2">
        <ArrowLeft size={20} className="text-blue-600 hover:text-blue-800" />
      </Link>
      <h1 className="text-2xl font-bold">Payment</h1>
    </div>
  );
};

export default PaymentHeader;
