
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductDetails from '../ProductDetails';
import ProductImageGallery from '../ProductImageGallery';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent = ({ product }: ProductDetailsContentProps) => {
  const [selectedSize, setSelectedSize] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <ProductImageGallery  images={[product.image, ...(product.images || []).filter(img => img && img !== product.image)]}
      productName={product.name}/>
      
      <ProductDetails 
        product={product} 
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />
 

    </div>
  );
};

export default ProductDetailsContent;
