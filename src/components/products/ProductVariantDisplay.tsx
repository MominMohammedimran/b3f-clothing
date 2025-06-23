
import React from 'react';
import { ProductVariant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ProductVariantDisplayProps {
  variants: ProductVariant[];
  sizes: string[];
  stock: number;
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

const ProductVariantDisplay: React.FC<ProductVariantDisplayProps> = ({
  variants,
  sizes,
  stock,
  selectedSize,
  onSizeSelect
}) => {
  const getVariantStock = (size: string) => {
    const variant = variants.find(v => v.size.toLowerCase() === size.toLowerCase());
    return variant ? Number(variant.stock) : stock || 0;
  };

  const availableSizes = sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Sizes</h3>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map((size) => {
            const sizeStock = getVariantStock(size);
            const isAvailable = sizeStock > 0;
            const isSelected = selectedSize === size;
            
            return (
              <button
                key={size}
                onClick={() => isAvailable && onSizeSelect(size)}
                disabled={!isAvailable}
                className={`
                  relative p-3 border-2 rounded-lg text-center font-medium transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : isAvailable 
                      ? 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <div className="text-sm font-semibold">{size}</div>
                <div className="text-xs mt-1">
                  {isAvailable ? (
                    <Badge variant="outline" className="text-xs">
                      {sizeStock} left
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Out of stock
                    </Badge>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {selectedSize && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Selected: Size {selectedSize}
            </span>
            <Badge variant="outline">
              {getVariantStock(selectedSize)} available
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantDisplay;
