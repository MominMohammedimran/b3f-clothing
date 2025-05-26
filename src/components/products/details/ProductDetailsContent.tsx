
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductDetails from '../ProductDetails';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent = ({ product }: ProductDetailsContentProps) => {
  const [selectedSize, setSelectedSize] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      <ProductDetails 
        product={product} 
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />
    </div>
  );
};

export default ProductDetailsContent;
