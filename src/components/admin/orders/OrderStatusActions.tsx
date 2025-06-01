
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/lib/types';

interface OrderItemsProps {
  items: CartItem[];
  total: number;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items, total }) => {
  // Helper function to get the best available image for display
  const getItemDisplayImage = (item: CartItem) => {
    if (item.metadata?.previewImage) {
      return item.metadata.previewImage;
    }
    if (item.image) {
      return item.image;
    }
    return '/placeholder.svg';
  };

  // Helper function to check if item has custom design
  const hasCustomDesign = (item: CartItem) => {
    return item.metadata?.previewImage || item.metadata?.designData;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              {hasCustomDesign(item) ? (
                <div className="relative">
                  <div className="h-16 w-16 border-2 border-dashed border-blue-400 rounded bg-blue-50 flex items-center justify-center">
                    <img
                      src={getItemDisplayImage(item)}
                      alt={item.name}
                      className="h-12 w-12 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded-full">
                    ✨
                  </div>
                </div>
              ) : (
                <img
                  src={getItemDisplayImage(item)}
                  alt={item.name}
                  className="h-16 w-16 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Quantity: {item.quantity}</p>
                {item.size && <p>Size: {item.size}</p>}
                {item.color && <p>Color: {item.color}</p>}
                {item.metadata?.view && <p>Design View: {item.metadata.view}</p>}
                {hasCustomDesign(item) && (
                  <p className="text-blue-600 font-medium">✨ Custom Design</p>
                )}
                {item.metadata?.backImage && (
                  <p className="text-purple-600 font-medium">🔄 Dual-Sided Design</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(item.price)} each
              </p>
            </div>
          </div>
        ))}
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;