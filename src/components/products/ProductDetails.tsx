import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';
import { XCircle } from 'lucide-react';

interface SizeWithQuantity {
  size: string;
  quantity: number;
}

export interface ProductDetailsProps {
  product: Product;
  allowMultipleSizes?: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  allowMultipleSizes = true,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<SizeWithQuantity[]>([]);

  // Parse variants from JSON
  let productVariants = product.variants;
  if (typeof productVariants === 'string') {
    try {
      productVariants = JSON.parse(productVariants);
    } catch (e) {
      console.error('Error parsing product variants:', e);
      productVariants = [];
    }
  }

  // Build available sizes from variants or fallback
  const availableSizes: string[] = [];
  if (Array.isArray(productVariants) && productVariants.length > 0) {
    for (const variant of productVariants) {
      if (variant && variant.size && variant.stock > 0) {
        availableSizes.push(variant.size);
      }
    }
  } else if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    availableSizes.push(...product.sizes);
  } else {
    availableSizes.push('S', 'M', 'L', 'XL');
  }

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => {
      const exists = prev.find((s) => s.size === size);
      if (exists) {
        return prev.filter((s) => s.size !== size);
      } else {
        return [...prev, { size, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    setSelectedSizes((prev) =>
      prev.map((s) => (s.size === size ? { ...s, quantity } : s))
    );
  };

  const totalQuantity = selectedSizes.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedSizes.reduce((sum, item) => sum + item.quantity * product.price, 0);

  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-md">

      {/* Product Title + Price */}
      <div className="relative rounded-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
            {product.name}
          </h2>
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-30 blur-md -z-10"
            />
            <span className="relative text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 px-6 py-1">
              ₹{totalPrice || product.price}
            </span>
          </div>
        </div>

        {selectedSizes.length > 1 && (
          <div className="text-sm text-gray-600 italic mt-1 text-right">
            ({selectedSizes.length} sizes × {totalQuantity} qty)
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-2">
          <p className="text-base font-semibold text-gray-700 leading-relaxed break-words">
            <span className="text-lg text-gray-900">Description:</span> {product.description}
          </p>
        </div>
      )}

      {/* Price breakdown and badges */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="text-gray-400 line-through">
              ₹{product.originalPrice * totalQuantity}
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {product.discountPercentage}% OFF
            </span>
          </>
        )}
        {selectedSizes.length > 1 && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {selectedSizes.length} Sizes
          </span>
        )}
        {totalQuantity > 1 && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Qty: {totalQuantity}
          </span>
        )}
      </div>

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Sizes</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {availableSizes.map((size) => {
              const isSelected = selectedSizes.some(s => s.size === size);
              const variant = Array.isArray(productVariants) 
                ? productVariants.find(v => v.size === size)
                : null;
              const stock = variant?.stock || 10;

              return (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`p-3 border-2 rounded-lg text-center font-medium transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'}
                  `}
                  disabled={stock <= 0}
                >
                  <div className="text-sm font-semibold">{size}</div>
                  <div className="text-xs mt-1 text-gray-600">
                    {stock > 0 ? `${stock} left` : 'Out of stock'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Controls for Selected Sizes */}
      {selectedSizes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantities</h3>
          <div className="flex gap-3 overflow-x-auto py-2">
            {selectedSizes.map((sizeItem) => {
              const variant = Array.isArray(productVariants) 
                ? productVariants.find(v => v.size === sizeItem.size)
                : null;
              const maxStock = variant?.stock || 10;

              return (
                <div
                  key={sizeItem.size}
                  className="flex flex-col items-center justify-between bg-gray-50 border p-3 rounded-lg min-w-[140px] shadow-sm"
                >
                  {/* Size Label */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {sizeItem.size}
                    </span>
                    <button
                      onClick={() => handleSizeToggle(sizeItem.size)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-2">
                    <ProductQuantitySelector
                      quantity={sizeItem.quantity}
                      maxQuantity={maxStock}
                      onChange={(qty) => handleQuantityChange(sizeItem.size, qty)}
                    />
                  </div>

                  {/* Price */}
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{(product.price * sizeItem.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <ProductActionButtons
        product={product}
        selectedSizes={selectedSizes.map(s => s.size)}
        quantities={selectedSizes.reduce((acc, s) => ({ ...acc, [s.size]: s.quantity }), {})}
      />
    </div>
  );
};

export default ProductDetails;
