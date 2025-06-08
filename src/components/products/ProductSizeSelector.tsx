
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProductSizeSelectorProps {
  productId: string;
  sizes: string[];
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
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
  sizeQuantities = {},
  selectedSizes = [],
  onSizeToggle,
  allowMultiple = false,
  showStock = false
}) => {
  const handleSizeClick = (size: string) => {
    if (allowMultiple && onSizeToggle) {
      onSizeToggle(size);
    } else if (onSizeSelect) {
      onSizeSelect(size);
    }
  };

  const isSizeSelected = (size: string) => {
    if (allowMultiple) {
      return selectedSizes.includes(size);
    }
    return selectedSize === size;
  };

  const getSizeStock = (size: string) => {
    return sizeQuantities[size.toLowerCase()] || 0;
  };

  const isSizeAvailable = (size: string) => {
    return getSizeStock(size) > 0;
  };

  if (!sizes || sizes.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No sizes available for this product
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">
        {allowMultiple ? 'Select Sizes' : 'Select Size'}
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => {
          const isSelected = isSizeSelected(size);
          const isAvailable = isSizeAvailable(size);
          const stock = getSizeStock(size);

          return (
            <div key={size} className="relative">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full h-12 ${
                  !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleSizeClick(size)}
                disabled={!isAvailable}
              >
                {size.toUpperCase()}
              </Button>
              {showStock && (
                <div className="text-xs text-center mt-1 text-gray-600">
                  Stock: {stock}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {allowMultiple && selectedSizes.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected sizes:</strong> {selectedSizes.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSizeSelector;