
import React from 'react';

interface OrderHeaderProps {
  orderNumber: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ orderNumber }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
      <p className="text-gray-600">Order #{orderNumber}</p>
    </div>
  );
};

export default OrderHeader;
