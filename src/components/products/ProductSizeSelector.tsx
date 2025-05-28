
import React from 'react';
import { Button } from '@/components/ui/button';
import { useProductQuantity } from '@/hooks/useProductQuantity';

interface ProductSizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  productId?: string;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeChange,
  productId
}) => {
  const { quantities, loading } = useProductQuantity(productId);

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Size</h3>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <div key={size} className="text-center">
            <Button
              variant={selectedSize === size ? "default" : "outline"}
              size="sm"
              onClick={() => onSizeChange(size)}
              disabled={quantities[size] === 0}
              className={`w-full ${quantities[size] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? 'Loading...' : `Qty: ${quantities[size] || 0}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSizeSelector;
