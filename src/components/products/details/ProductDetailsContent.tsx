
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductImage from '../ProductImage';
import ProductDetails from '../ProductDetails';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-md p-6">
      <ProductImage 
        image={product.image} 
        name={product.name} 
        additionalImages={product.images || []}
      />
      
      <ProductDetails
        product={product}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </div>
  );
};

export default ProductDetailsContent;