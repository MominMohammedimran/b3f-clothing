
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductDetails from '../ProductDetails';
import ProductImageGallery from '../ProductImageGallery';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent = ({ product }: ProductDetailsContentProps) => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <ProductImageGallery  
        images={[product.image, ...(product.images || []).filter(img => img && img !== product.image)]}
        productName={product.name}
      />
      
      <ProductDetails 
        product={product} 
        selectedSizes={selectedSizes}
        onSizeToggle={handleSizeToggle}
        quantity={quantity}
        onQuantityChange={setQuantity}
        allowMultipleSizes={true}
      />
 
    </div>
  );
};

export default ProductDetailsContent;
