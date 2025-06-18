
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  minQuantity = 1,
  maxQuantity = 50
}) => {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={quantity <= minQuantity}
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center justify-center min-w-[40px] text-center">
        <span className="font-medium text-gray-900">{quantity}</span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
        className="h-8 w-8 p-0 rounded-md hover:bg-gray-100"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantitySelector;
