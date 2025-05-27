
import React from 'react';
import { Product } from '@/lib/types';
import { products } from '@/lib/data';
import ProductCard from '@/components/ui/ProductCard';

interface RelatedProductsProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ product, onProductClick }) => {
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id);
 
  return (
    <section className="py-8 border-t border-gray-200">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedProducts.slice(0, 4).map((relatedProduct) => (
            <ProductCard
              key={relatedProduct.id}
              product={relatedProduct}
              onClick={(product) => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
