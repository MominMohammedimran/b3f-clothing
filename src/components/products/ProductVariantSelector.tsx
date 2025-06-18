
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
  onQuantityChange
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        👕 Select Sizes & Quantities
      </h3>
      
      {/* Size Selection Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {product.variants?.map((variant) => (
          <div 
            key={variant.size} 
            className={`p-6 rounded-xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedSizes.includes(variant.size)
                ? 'border-blue-500 bg-blue-100 shadow-lg scale-105' 
                : 'border-gray-300 hover:border-blue-300 bg-white shadow-md'
            }`}
            onClick={() => onSizeToggle(variant.size)}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{variant.size}</div>
              <div className={`text-sm font-semibold mb-2 ${
                variant.stock > 10 ? 'text-green-600' : 
                variant.stock > 5 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                📦 {variant.stock} in stock
              </div>
              {selectedSizes.includes(variant.size) && (
                <div className="text-blue-600 font-bold text-sm animate-pulse">
                  ✓ SELECTED
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity Controls for Selected Sizes */}
      {selectedSizes.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-bold text-gray-700 text-center">📊 Set Quantities:</h4>
          {selectedSizes.map(size => {
            const variant = product.variants?.find(v => v.size === size);
            const maxStock = variant?.stock || 50;
            
            return (
              <div key={size} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <span className="font-bold text-lg text-gray-700">Size {size}:</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(size, (quantities[size] || 1) - 1)}
                    disabled={(quantities[size] || 1) <= 1}
                    className="h-10 w-10 p-0 border-2 border-gray-400 hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-6 py-2 min-w-[80px] text-center">
                    <span className="font-bold text-xl text-blue-700">{quantities[size] || 1}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onQuantityChange(size, (quantities[size] || 1) + 1)}
                    disabled={(quantities[size] || 1) >= maxStock}
                    className="h-10 w-10 p-0 border-2 border-gray-400 hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  
                  <div className="text-right min-w-[100px]">
                    <span className="text-sm text-gray-600">Subtotal: </span>
                    <span className="font-bold text-lg text-green-600">
                      ₹{(product.price * (quantities[size] || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
