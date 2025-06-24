import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductVariantSelectorProps {
  product: Product;
  selectedSizes: string[];
  quantities: Record<string, number>;
  onSizeToggle: (size: string) => void;
  onQuantityChange: (size: string, quantity: number) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  selectedSizes,
  quantities,
  onSizeToggle,
  onQuantityChange,
}) => {
  return (
    <div className="p-6 sm:p-8 border-2 border-blue-200 rounded-2xl shadow-md bg-white max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Select Size and Quantity
      </h3>

      {/* Size Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mb-8">
        {product.variants?.map((variant) => {
          const isSelected = selectedSizes.includes(variant.size);
          const stock = Number(variant.stock);
          const isOutOfStock = stock === 0;

          return (
            <div
              key={variant.size}
              onClick={() => {
                if (!isOutOfStock) onSizeToggle(variant.size);
              }}
              className={`p-4 border-2 rounded-xl text-center transition-all duration-300 shadow-sm
                ${isOutOfStock
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105 cursor-pointer'
                  : 'border-gray-300 hover:border-blue-300 cursor-pointer'}
              `}
            >
              <p className="text-xl font-bold">{variant.size}</p>
              <p
                className={`text-sm mt-1 font-medium ${
                  stock > 10
                    ? 'text-green-600'
                    : stock > 3
                    ? 'text-yellow-600'
                    : stock === 0
                    ? 'text-red-500'
                    : 'text-red-600'
                }`}
              >
                {stock === 0 ? '🚫 Out of Stock' : `${stock} in stock`}
              </p>
              {!isOutOfStock && isSelected && (
                <p className="mt-2 text-sm font-semibold text-blue-700 animate-pulse">
                  ✓ Selected
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quantity Controls */}
      {selectedSizes.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-center text-gray-700">Set Quantity</h4>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {selectedSizes.map((size) => {
              const variant = product.variants?.find((v) => v.size === size);
              const stock = Number(variant?.stock || 0);
              const quantity = quantities[size] || 1;

              return (
                <div
                  key={size}
                  className="flex flex-col items-center gap-2 p-3 border rounded-lg bg-gray-50 shadow-sm"
                >
                  {/* Size Label */}
                  <p className="font-medium text-gray-800 text-sm">
                    Size: <span className="text-blue-600 font-semibold">{size}</span>
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => onQuantityChange(size, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="px-3 py-1 bg-white border rounded-md text-blue-700 font-bold text-sm">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 text-green-600"
                      onClick={() => onQuantityChange(size, quantity + 1)}
                      disabled={quantity >= stock}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    Subtotal:{' '}
                    <span className="text-green-700 font-semibold">
                      ₹{(product.price * quantity).toFixed(2)}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
