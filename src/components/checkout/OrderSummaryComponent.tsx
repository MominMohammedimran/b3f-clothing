
import React from 'react';

type OrderSummaryProps = {
  currentOrder: {
    orderNumber?: string;
    items?: any[];
    total: number;
    deliveryFee?: number;
  } | null;
}

const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({ currentOrder }) => {
  if (!currentOrder) return null;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-medium mb-3">Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Order #:</span>
          <span>{currentOrder.orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Items ({currentOrder.items?.length || 0}):</span>
          <span>₹{currentOrder.total - (currentOrder.deliveryFee || 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee:</span>
          <span>₹{currentOrder.deliveryFee || 0}</span>
        </div>
        <div className="flex justify-between font-medium border-t pt-2 mt-2">
          <span>Total:</span>
          <span>₹{currentOrder.total}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryComponent;
