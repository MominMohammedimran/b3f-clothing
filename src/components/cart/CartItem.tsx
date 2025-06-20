
import React, { useState } from 'react';
import { Minus, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/lib/types';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, size: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const [imageError, setImageError] = useState(false);

  const handleDownloadPreview = () => {
    if (item.metadata?.previewImage) {
      const link = document.createElement('a');
      link.href = item.metadata.previewImage;
      link.download = `${item.name}-preview.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const displayImage = item.metadata?.previewImage || item.image;
  const totalQuantity = item.sizes.reduce((sum, size) => sum + size.quantity, 0);
  const totalPrice = item.price * totalQuantity;

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0">
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={imageError ? '/placeholder.svg' : displayImage}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        
        {/* Overlay preview image if it exists */}
        {item.metadata?.previewImage && item.metadata.previewImage !== item.image && (
          <div className="absolute inset-0 z-10">
            <img
              src={item.metadata.previewImage}
              alt={`${item.name} preview`}
              className="w-full h-full object-contain"
              style={{ zIndex: 10 }}
            />
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <div className="text-sm text-gray-500 space-y-1">
          {item.sizes.map((sizeItem, index) => (
            <div key={index}>Size: {sizeItem.size}, Qty: {sizeItem.quantity}</div>
          ))}
          {item.color && <p>Color: {item.color}</p>}
          {item.metadata?.view && <p>View: {item.metadata.view}</p>}
        </div>
        <p className="font-medium text-gray-900 mt-1">₹{item.price} each</p>
      </div>

      <div className="flex flex-col items-center space-y-2">
        {item.sizes.map((sizeItem, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-sm font-medium w-8">{sizeItem.size}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, sizeItem.size, Math.max(1, sizeItem.quantity - 1))}
              disabled={sizeItem.quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            
            <span className="w-8 text-center font-medium">{sizeItem.quantity}</span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.id, sizeItem.size, sizeItem.quantity + 1)}
            >
              <Plus size={16} />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        {item.metadata?.previewImage && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPreview}
            title="Download preview image"
          >
            <Download size={16} />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="text-right">
        <p className="font-medium text-gray-900">₹{totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartItemComponent;
