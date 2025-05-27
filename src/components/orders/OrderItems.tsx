
import React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  selectedSizes?: Array<{size: string, quantity: number}>;
}

interface OrderItemsProps {
  items: OrderItem[];
}

const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Order Items</h2>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              <img 
                src={item.image || '/placeholder.svg'} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-grow">
              <h3 className="font-medium">{item.name}</h3>
              
              {item.selectedSizes ? (
                <div className="text-sm text-gray-500">
                  {item.selectedSizes.map((sizeItem, idx) => (
                    <div key={idx}>Size: {sizeItem.size} × {sizeItem.quantity}</div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </div>
              )}
            </div>
            
            <div className="text-right">
              <p className="font-medium">
                ₹{item.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItems;
