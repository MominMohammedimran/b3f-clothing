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
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/design-tool');
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="relative mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md"
          />
          {product.discountPercentage && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              -{product.discountPercentage}%
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {isPrinted ? (
          <Button className="w-full mt-2" onClick={handleCustomize}>
            Customize
          </Button>
        ) : (
          <Button
            className="w-full mt-2"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
