import React from 'react';

type SizeDetail = {
  size: string;
  quantity: number;
};

type CartItem = {
  image?: string;
  name: string;
  sizes?: SizeDetail[];
};

type OrderSummaryProps = {
  currentOrder: {
    orderNumber?: string;
    items?: CartItem[];
    total: number;
    deliveryFee?: number;
  } | null;
};

const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({ currentOrder }) => {
  if (!currentOrder || !Array.isArray(currentOrder.items)) return null;

  const { items = [], total, deliveryFee = 0, orderNumber } = currentOrder;
  const subtotal = total - deliveryFee;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-medium mb-3">Order Summary</h3>

      {/* Order Number */}
      <div className="flex justify-between text-sm mb-3">
        <span>Order #:</span>
        <span>{orderNumber || '-'}</span>
      </div>

      {/* Items List */}
      <div className="space-y-4 mb-4 border-b pb-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-3">
            <img
              src={item.image || '/placeholder.svg'}
              alt={item.name}
              className="w-12 h-12 object-cover rounded border"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              {Array.isArray(item.sizes) && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.sizes.map((s, sIdx) => (
                    <div
                      key={`${s.size}-${sIdx}`}
                      className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded bg-white text-sm"
                    >
                      <span className="text-gray-700 font-medium">{s.size}</span>
                      <span className="text-gray-500">× {s.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="flex justify-between font-medium border-t pt-2 mt-2 text-base">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryComponent;
