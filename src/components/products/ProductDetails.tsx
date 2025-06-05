
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductSizeSelector from './ProductSizeSelector';
import ProductQuantitySelector from './ProductQuantitySelector';
import ProductActionButtons from './ProductActionButtons';

export interface ProductDetailsProps {
  product: Product;
  selectedSize?: string;
  setSelectedSize?: (size: string) => void;
  selectedSizes?: string[];
  onSizeToggle?: (size: string) => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  allowMultipleSizes?: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  selectedSize,
  setSelectedSize,
  selectedSizes,
  onSizeToggle,
  quantity: propQuantity,
  onQuantityChange,
  allowMultipleSizes = false,
}) => {
  const [internalQuantity, setInternalQuantity] = useState(1);
  const [internalSelectedSizes, setInternalSelectedSizes] = useState<string[]>([]);
  const [internalSelectedSize, setInternalSelectedSize] = useState('');

  const quantity = propQuantity ?? internalQuantity;
  const currentSelectedSizes = selectedSizes ?? internalSelectedSizes;
  const currentSelectedSize = selectedSize ?? internalSelectedSize;

  const handleQuantityChange = (newQuantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      setInternalQuantity(newQuantity);
    }
  };

  const handleSizeSelect = (size: string) => {
    if (setSelectedSize) {
      setSelectedSize(size);
    } else {
      setInternalSelectedSize(size);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (onSizeToggle) {
      onSizeToggle(size);
    } else if (setSelectedSize && !allowMultipleSizes) {
      setSelectedSize(size);
    } else {
      setInternalSelectedSizes(prev =>
        prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
      );
    }
  };

  const effectiveSelectedSizes = allowMultipleSizes
    ? currentSelectedSizes
    : currentSelectedSize
    ? [currentSelectedSize]
    : [];

  const sizeMultiplier = effectiveSelectedSizes.length > 1 ? effectiveSelectedSizes.length : 1;
  const basePrice = product.price * sizeMultiplier;
  const totalPrice = basePrice * quantity;

  // Build sizeQuantities and availableSizes from product.variants with proper JSON parsing
  const sizeQuantities: Record<string, number> = {};
  const availableSizes: string[] = [];

  // Parse variants properly from JSON if needed
  let productVariants = product.variants;
  if (typeof productVariants === 'string') {
    try {
      productVariants = JSON.parse(productVariants);
    } catch (e) {
      console.error('Error parsing product variants:', e);
      productVariants = [];
    }
  }

  if (Array.isArray(productVariants)) {
    for (const variant of productVariants) {
      if (variant && variant.size) {
        const sizeKey = variant.size.toLowerCase();
        sizeQuantities[sizeKey] = variant.stock || 0;
        if (!availableSizes.includes(variant.size)) {
          availableSizes.push(variant.size);
        }
      }
    }
  } else if (Array.isArray(product.sizes)) {
    // Fallback to sizes array if variants not available
    for (const size of product.sizes) {
      availableSizes.push(size);
      sizeQuantities[size.toLowerCase()] = product.stock || 10;
    }
  }

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-md relative">
      {/* Product Title + Price */}
      <div className="relative">
        <p className="text-xl font-semibold text-gray-900 tracking-tight">
          Name : <span className="text-gray-600">{product.name}</span>
        </p>
        <span
          className="absolute top-1/2 right-0 -translate-y-1/2 text-2xl font-semibold text-white drop-shadow-md select-none
          bg-black px-2 py-1 rounded-lg shadow-md z-20"
          style={{ whiteSpace: 'nowrap' }}
        >
          ₹{totalPrice}
          {sizeMultiplier > 1 && (
            <span className="text-sm block">({sizeMultiplier} sizes × {quantity})</span>
          )}
        </span>
      </div>

      {/* Description */}
      <p className="text-lg font-semibold text-gray-900 ">
        Description : <span className="text-gray-600">{product.description}</span>
      </p>

      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <ProductSizeSelector
          productId={product.id}
          sizes={availableSizes}
          selectedSize={currentSelectedSize}
          onSizeSelect={handleSizeSelect}
          sizeQuantities={sizeQuantities}
          selectedSizes={effectiveSelectedSizes}
          onSizeToggle={handleSizeToggle}
          allowMultiple={allowMultipleSizes}
          showStock={true}
        />
      )}

      {/* Quantity Selector */}
      <div className="justify-items-center flex gap-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-2s">Select Quantity</h3>
        <ProductQuantitySelector
          quantity={quantity}
          maxQuantity={10}
          onChange={handleQuantityChange}
        />
      </div>

      {/* Action Buttons */}
      <ProductActionButtons
        product={product}
        selectedSize={currentSelectedSize || effectiveSelectedSizes[0] || ''}
        selectedSizes={effectiveSelectedSizes}
        quantity={quantity}
        totalPrice={totalPrice}
      />

      {/* Price breakdown and badges */}
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="text-lg text-gray-400 line-through">
              ₹{product.originalPrice * sizeMultiplier * quantity}
            </span>
            <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
              {product.discountPercentage}% OFF
            </span>
          </>
        )}
        {sizeMultiplier > 1 && (
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
            {sizeMultiplier} Sizes Selected (₹{basePrice} base price)
          </span>
        )}
        {quantity > 1 && (
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
            Quantity: {quantity}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
