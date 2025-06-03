
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryManager } from '@/hooks/useInventoryManager';

interface ProductSizeSelectorProps {
  productId: string;
  sizes: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
  className?: string;
  sizeQuantities?: Record<string, number>;
  selectedSizes?: string[];
  onSizeToggle?: (size: string) => void;
  allowMultiple?: boolean;
  showStock?: boolean;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({
  productId,
  sizes,
  selectedSize,
  onSizeSelect,
  className = '',
  sizeQuantities,
  selectedSizes = [],
  onSizeToggle,
  allowMultiple = false,
  showStock = true
}) => {
  const { getAvailableQuantity } = useInventoryManager();

  const handleSizeClick = (size: string) => {
    if (allowMultiple && onSizeToggle) {
      onSizeToggle(size);
    } else {
      onSizeSelect(size);
    }
  };

  const getQuantityForSize = (size: string): number => {
    if (sizeQuantities) {
      return sizeQuantities[size.toLowerCase()] || 0;
    }
    return getAvailableQuantity(productId, size);
  };

  const isSelected = (size: string): boolean => {
    if (allowMultiple) {
      return selectedSizes.includes(size);
    }
    return selectedSize === size;
  };

  return (
    <div className={`space-y-3 justify-items-center ${className}`}>
      <h3 className="text-lg font-medium">Select Size:</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const availableQuantity = getQuantityForSize(size);
          const isOutOfStock = availableQuantity === 0;
          const selected = isSelected(size);

          return (
            <div key={size} className="relative">
              <Button
                variant={selected ? "default" : "outline"}
                onClick={() => !isOutOfStock && handleSizeClick(size)}
                disabled={isOutOfStock}
                className={`
                  relative h-12 min-w-[3rem] px-4
                  ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                  ${selected ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {size.toUpperCase()}
                {isOutOfStock && (
                  <span className="absolute inset-0 top-7 flex items-center justify-center text-xs text-red-500 font-medium">
                    Out
                  </span>
                )}
              </Button>
              
              {!isOutOfStock && showStock && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 text-xs"
                >
                  {availableQuantity}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
      
      {(selectedSize || selectedSizes.length > 0) && showStock && (
        <p className="text-sm text-gray-600">
          {allowMultiple && selectedSizes.length > 0 ? (
            `Selected sizes: ${selectedSizes.join(', ')}`
          ) : selectedSize ? (
            `Available quantity: ${getQuantityForSize(selectedSize)} pieces`
          ) : null}
        </p>
      )}
    </div>
  );
};

export default ProductSizeSelector;
