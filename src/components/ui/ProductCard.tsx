import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onClick
}) => {
  const navigate = useNavigate();

  const isPrinted = product.name.toLowerCase().includes('printed');

  const handleCardClick = () => {
    if (isPrinted) {
      navigate('/design-tool');
    } else if (onClick) {
      onClick(product);
    } else if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
  
  onClick(product);
    
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/design-tool');
  };

  return (
    
  <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-full "onClick={handleCardClick}>
  <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
    <div>
      <div className="relative mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-36 sm:h-40 object-cover rounded-md"
        />
        {product.discountPercentage && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            -{product.discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Product Name */}
      <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-2 min-h-[2.5rem] ">
        {product.name}
      </h3>

      {/* Price */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg sm:text-xl font-bold text-blue-600">₹{product.price}</span>
        {product.originalPrice && (
          <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
        )}
      </div>
    </div>

    {/* Bottom button */}
    <div className="mt-auto">
      {isPrinted ? (
        <Button className="w-full" onClick={handleCustomize}>
          Customize
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      )}
    </div>
  </CardContent>
</Card>


  );
};

export default ProductCard;