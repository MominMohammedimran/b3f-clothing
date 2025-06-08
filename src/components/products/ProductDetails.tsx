
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

  // Parse variants from JSON and build size data
  const sizeQuantities: Record<string, number> = {};
  const availableSizes: string[] = [];
 console.log('ajs',product)
  // Parse variants properly from JSON if needed
  let productVariants = product.variants;
  if (typeof productVariants === 'string') {
    try {
      productVariants = JSON.parse(productVariants);
      console.log('variant',productVariants)
    } catch (e) {
      console.error('Error parsing product variants:', e);
      productVariants = [];
    }
  }

  // Build size data from variants
  if (Array.isArray(productVariants) && productVariants.length > 0) {
    for (const variant of productVariants) {
      if (variant && variant.size) {
        const sizeKey = variant.size.toLowerCase();
        const stock = variant.stock || 0;
        sizeQuantities[sizeKey] = stock;
        if (stock > 0 && !availableSizes.includes(variant.size)) {
          availableSizes.push(variant.size);
        }
      }
    }
  } else if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    // Fallback to sizes array if variants not available
    for (const size of product.sizes) {
      availableSizes.push(size);
      sizeQuantities[size.toLowerCase()] = product.stock || 10;
    }
  } else {
    // Default sizes if no variants or sizes
    const defaultSizes = ['S', 'M', 'L', 'XL'];
    for (const size of defaultSizes) {
      availableSizes.push(size);
      sizeQuantities[size.toLowerCase()] = product.stock || 10;
    }
  }
  return (
    <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl shadow-md">
      {/* Product Title + Price */}
      <div className="relative">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight mb-2">
          {product.name}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-2xl md:text-3xl font-bold text-blue-600">
            ₹{totalPrice}
          </span>
          {sizeMultiplier > 1 && (
            <span className="text-sm text-gray-600">
              ({sizeMultiplier} sizes × {quantity} qty)
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 text-sm md:text-base">{product.description}</p>
        </div>
      )}

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">Quantity</h3>
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
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className="text-gray-400 line-through">
              ₹{product.originalPrice * sizeMultiplier * quantity}
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {product.discountPercentage}% OFF
            </span>
          </>
        )}
        {sizeMultiplier > 1 && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {sizeMultiplier} Sizes
          </span>
        )}
        {quantity > 1 && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Qty: {quantity}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;