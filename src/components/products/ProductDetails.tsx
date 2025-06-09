
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
    <div className="space-y-6 bg-white p-4 pt-0 md:p-6 rounded-xl shadow-md">
      {/* Product Title + Price */}
   <div className="relative  rounded-xl">
  <div className="flex items-center justify-between">
    <h2 className="text-lg md:text-xl font-semibold text-black-900 tracking-tight">
      Name : <span className=" font-medium text-l text-gray-700"> {product.name}</span>
    </h2>

    <div className="relative">
      {/* Glowing background behind price */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-30 blur-md -z-10"
      />
      {/* Price text */}
      <span className="relative text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 px-6 py-1">
        ₹{totalPrice}
      </span>
    </div>
  </div>

  {sizeMultiplier > 1 && (
    <div className="text-sm text-gray-600 italic mt-1 text-right">
      ({sizeMultiplier} sizes × {quantity} qty)
    </div>
  )}
</div>




      {/* Description */}
     {product.description && (
      <div className="mt-2 ">

       <p className="text-base font-semibold text-l text-gray-700 leading-relaxed break-words">
          <span className="text-lg text-gray-900">Description</span> : {product.description}
          </p>
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
      <div className="flex  sm:items-center gap-3">
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