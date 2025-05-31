
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ProductSizeSelectorProps {
  sizes: string[];
  sizeQuantities: Record<string, number>;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  allowMultiple?: boolean;
  showStock?: boolean;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({
  sizes,
  sizeQuantities,
  selectedSizes,
  onSizeToggle,
  allowMultiple = false,
  showStock = true
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">
        Select Size{allowMultiple ? 's' : ''}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1">
        {sizes.map((size) => {
          const stock = sizeQuantities[size] || 0;
          const isSelected = selectedSizes.includes(size);
          const isOutOfStock = stock === 0;
          
          return (
            <div key={size} className="space-y-2 justify-items-center ">
              {allowMultiple ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={isSelected}
                    onCheckedChange={() => !isOutOfStock && onSizeToggle(size)}
                    disabled={isOutOfStock}
                  />
                  <Label 
                    htmlFor={`size-${size}`}
                    className={`${isOutOfStock ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    {size}
                  </Label>
                </div>
              ) : (
                <Button
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => !isOutOfStock && onSizeToggle(size)}
                  disabled={isOutOfStock}
                  className={`w-full ${isSelected ? 'bg-blue-600 text-white' : ''}`}
                >
                  {size}
                </Button>
              )}
              {showStock && (
                <div className="text-xs text-gray-500 text-left">
                  <span className="block">Stock: {stock}</span>
                  {isOutOfStock && <span className="text-red-500 block">Out of Stock</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allowMultiple && selectedSizes.length > 1 && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            Multiple sizes selected: Price will be doubled (₹{selectedSizes.length > 1 ? 'Double' : 'Single'} price)
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSizeSelector;
