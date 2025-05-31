
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
  
  // Use props or internal state
  const quantity = propQuantity ?? internalQuantity;
  const currentSelectedSizes = selectedSizes ?? internalSelectedSizes;
  
  const handleQuantityChange = (newQuantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      setInternalQuantity(newQuantity);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (onSizeToggle) {
      onSizeToggle(size);
    } else if (setSelectedSize && !allowMultipleSizes) {
      setSelectedSize(size);
    } else {
      // Internal state management for multiple sizes
      setInternalSelectedSizes(prev => 
        prev.includes(size) 
          ? prev.filter(s => s !== size)
          : [...prev, size]
      );
    }
  };

  // Calculate total price based on selected sizes
  const effectiveSelectedSizes = allowMultipleSizes ? currentSelectedSizes : (selectedSize ? [selectedSize] : []);
  const priceMultiplier = effectiveSelectedSizes.length > 1 ? 2 : 1;
  const totalPrice = product.price * priceMultiplier;

  // Create size quantities from product data
  const sizeQuantities: Record<string, number> = {};
  if (product.sizes) {
    product.sizes.forEach(size => {
      sizeQuantities[size] = product.stock || 0;
    });
  }

return (
  <div className="space-y-8 bg-white p-6 rounded-xl shadow-md relative">
    {/* Product Title + Price (using z-index) */}
    <div className="relative">
      <p className="text-xl font-semibold text-gray-900 tracking-tight">
        Name : <span className="text-gray-600">{product.name}</span>
      </p>
      {/* Price positioned absolutely, right side of name */}
   <span
        className="absolute top-1/2 right-0 -translate-y-1/2 text-2xl font-semibold text-white drop-shadow-md select-none 
         bg-black px-2 py-1 rounded-lg shadow-md z-20"
        style={{ whiteSpace: "nowrap" }}
           >
         ₹{totalPrice}
    </span>


    </div>

    {/* Description */}
    <p className="text-lg font-semibold text-gray-900 ">
      Description : <span className="text-gray-600">{product.description}</span>
    </p>

    {/* Size Selector */}
    {product.sizes && product.sizes.length > 0 && (
      <ProductSizeSelector
        sizes={product.sizes}
        sizeQuantities={sizeQuantities}
        selectedSizes={
          allowMultipleSizes ? currentSelectedSizes : selectedSize ? [selectedSize] : []
        }
        onSizeToggle={handleSizeToggle}
        allowMultiple={allowMultipleSizes}
        showStock={true}
      />
    )}

    {/* Quantity Selector */}
    <div className='justify-items-center flex gap-3'>
      <h3 className="text-lg font-semibold text-gray-800 mb-2s">Select Quantity</h3>
      <ProductQuantitySelector
        quantity={quantity}
        maxQuantity={product.stock || 10}
        onChange={handleQuantityChange}
      />
    </div>

    {/* Action Buttons */}
    <ProductActionButtons
      product={product}
      selectedSize={selectedSize || currentSelectedSizes[0] || ''}
      selectedSizes={effectiveSelectedSizes}
      quantity={quantity}
      totalPrice={totalPrice}
    />

    {/* Discount badges */}
    <div className="flex flex-wrap items-center gap-3 mt-2">
      {product.originalPrice && product.originalPrice > product.price && (
        <>
          <span className="text-lg text-gray-400 line-through">
            ₹{product.originalPrice * priceMultiplier}
          </span>
          <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
            {product.discountPercentage}% OFF
          </span>
        </>
      )}
      {priceMultiplier > 1 && (
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
          Multiple Sizes Selected
        </span>
      )}
    </div>
  </div>
);


};

export default ProductDetails;
