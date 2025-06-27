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
    <div className="p-4 sm:p-5 border-2 border-blue-200 rounded-xl shadow-md bg-white max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Select Size and Quantity
      </h3>

      {/* Size Selection */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-2 gap-5 mb-8">
        {product.variants?.map((variant) => {
          const stock = Number(variant.stock ?? 0);
          const isSelected = selectedSizes.includes(variant.size);
          const isOutOfStock = stock === 0;

          return (
            <div
  key={variant.size}
  onClick={() => {
    if (stock > 0) onSizeToggle(variant.size)
  }}
  className={`  px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4
 border-2 rounded text-center transition-all duration-300
    ${stock === 0
      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
      : isSelected
      ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02] cursor-pointer'
      : 'border-gray-300 hover:border-blue-400 cursor-pointer'}
  `}
>
  <p className="text-sm font-bold">{variant.size}</p>

  {/* always show numeric stock */}
  <p className="text-xs font-medium text-gray-700 mt-1">
    Stock:&nbsp;
    <span className={stock === 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>
      {stock}
    </span>
  </p>

  {/* out-of-stock line */}
  {stock === 0 && (
    <p className="text-[11px] text-red-600 font-semibold mt-0.5">
      🚫 No&nbsp;Stock
    </p>
  )}

  {/* selected badge */}
  {isSelected && stock > 0 && (
    <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
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
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
            {selectedSizes.map((size) => {
              const variant = product.variants?.find((v) => v.size === size);
              const stock = Number(variant?.stock ?? 0);
              const quantity = quantities[size] || 1;

              return (
                <div
                  key={size}
                  className="flex flex-col items-center gap-2 p-3 border rounded-lg bg-gray-50 shadow-sm"
                >
                  <p className="font-medium text-gray-800 text-sm">
                    Size: <span className="text-blue-600 font-semibold">{size}</span>
                  </p>

                  {stock > 0 ? (
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
                  ) : (
                    <p className="text-sm text-red-600 mt-2">⚠️ Out of Stock</p>
                  )}

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
