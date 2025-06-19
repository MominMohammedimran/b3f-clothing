
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductImage from '../ProductImage';
import ProductDetails from '../ProductDetails';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({ product }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  bg-white rounded-xl shadow-md p-6 pb-0">
      <ProductImage 
        image={product.image} 
        name={product.name} 
        additionalImages={product.images || []}
      />
      
      <ProductDetails
        product={product}
        allowMultipleSizes={true}
      />
    </div>
  );
};

export default ProductDetailsContent;
