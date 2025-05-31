
import React from 'react';
import { Heart, Star, StarHalf } from 'lucide-react';
import { Product } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';
import WishlistButton from './WishlistButton';

interface ProductDetailsHeaderProps {
  product: Product;
}

const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({ product }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
      
      <div className="mb-4 text-2xl font-semibold text-green-600 flex items-center justify-between">
        <div>
          <span>₹{product.price}</span>
          {product.originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        
        
      </div>

      <div className="flex items-center mb-4">
        <div className="flex items-center mr-4">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isFull = starValue <= product.rating;
            const isHalf = !isFull && starValue - 0.5 <= product.rating;

            return isFull ? (
              <Star key={i} size={16} className="text-yellow-400" />
            ) : isHalf ? (
              <StarHalf key={i} size={16} className="text-yellow-400" />
            ) : (
              <Star key={i} size={16} className="text-gray-300" />
            );
          })}
        </div>
        <span className="text-gray-500">{product.rating} / 5</span>
      </div>

      <div className="mb-4 text-left">
        <span className="text-gray-600">Code:</span>
        <span className="ml-2 font-medium">{product.code}</span>
      </div>

      <div className="mb-4 text-left">
        <span className="text-gray-600">Category:</span>
        <span className="ml-2 font-medium">{product.category}</span>
      </div>

      <div className="mb-6 text-left">
        <p className="text-gray-700">{product.description}</p>
      </div>
    </>
  );
};

export default ProductDetailsHeader;
