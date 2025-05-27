
import React from 'react';
import ProductCard from '../ui/ProductCard';
import { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-8 animate-fade-in">
        <p className="text-lg text-gray-500">No products found.</p>
        <p className="text-gray-400">Try a different search term or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {products.map((product, index) => (
        <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <ProductCard 
            product={product}
            onClick={() => onProductClick(product)}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
