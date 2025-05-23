
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Pencil } from 'lucide-react';
import { Product } from '../../lib/types';
import { toast } from 'sonner';
import { useWishlist } from '@/context/WishlistContext';
import WishlistButton from '../products/WishlistButton';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductCard = ({ 
  product, 
  onClick,
  isWishlisted: propIsWishlisted,
  onWishlistToggle,
  onAddToWishlist,
}: ProductCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const productImage = product.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158";
  const isCustomProduct = product.tags?.some(tag => 
    tag.toLowerCase().includes('custom') || 
    tag.toLowerCase().includes('design') || 
    tag.toLowerCase().includes('print')
  ) || product.code?.toLowerCase().includes('print');
  
  const inWishlist = propIsWishlisted !== undefined ? propIsWishlisted : isInWishlist(product.id);
  
  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isCustomProduct) {
      navigate(`/product/details/${product.productId}`);
      return;
    }
    
    navigate(`/design-tool`);
  };
  
  const handleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (onWishlistToggle) {
        onWishlistToggle();
        return;
      }
      
      if (onAddToWishlist) {
        onAddToWishlist(product);
        return;
      }
      
      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast.success(`${product.name} removed from wishlist!`);
      } else {
        await addToWishlist(product);
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      toast.error("Failed to update wishlist");
    }
  };
  
  const handleCustomize = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/design-tool`);
  };
  
  const handleCardClick = () => {
  const isCustomProduct = product.tags?.includes("custom");


  if (isCustomProduct) {
    navigate('/design-tool');
    return;
  }

  if (onClick) {
    onClick(product);
    return;
  }

  navigate(`/product/details/${product.productId}`);
};



  // Format price to Indian Rupees
  const formatIndianRupees = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer">
        {product.discountPercentage > 0 && (
          <div className="absolute left-0 top-0 z-10 bg-red-500 px-1 py-1  text-[9px] sm:text-[15px] md:text-s font-semibold text-white">
            {product.discountPercentage}% OFF
          </div>
        )}
        
        {isCustomProduct && (
          <div className="absolute right-0 top- sm:top-0 md:top-0  z-10 bg-blue-500 px-1 py-1 text-[10px] sm:text-[15px] md:text-sm font-semibold text-white flex items-center">
            <Pencil size={10} className="mr-1" /> Customizable
          </div>
        )}
        
      
        
        <div className="aspect-square overflow-hidden">
          <img 
            src={productImage} 
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <div className="p-4">
          <h3 className="mb-1 text-sm font-medium line-clamp-1">
            {product.name}
            {isCustomProduct && <Pencil size={14} className="inline-block ml-1 text-blue-500" />}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-green-600">{formatIndianRupees(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="ml-2 text-xs text-gray-400 line-through">{formatIndianRupees(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg 
                  key={i} 
                  className={`h-3 w-3 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        
        <div 
          className={`absolute inset-x-0 bottom-0 flex justify-between p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300
            ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        >
          {isCustomProduct ? (
            <button 
              onClick={handleCustomize}
              className="flex-1 flex items-center justify-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <Pencil size={16} className="mr-1" /> Customize
            </button>
          ) : (
            <button 
              onClick={handleQuickAdd}
              className="flex-1 flex items-center justify-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <ShoppingCart size={16} className="mr-1" /> View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
