import React ,{useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PenTool, Search}  from 'lucide-react';
import { Product } from '@/lib/types';
import { useActiveProduct } from '@/context/ActiveProductContext';
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
const { activeProduct, setActiveProduct } = useActiveProduct();
 const name=product.name;
  
// 🔍 Detect product type from name
const detectProductType = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('t-shirt') || lower.includes('tshirt')) return 'tshirt';
  if (lower.includes('cup') || lower.includes('mug')) return 'mug';
  if (lower.includes('cap') || lower.includes('hat')) return 'cap';
  return 'tshirt'; // default fallback
};

const isPrinted = product.name.toLowerCase().includes('printed');

// 🟦 When user clicks the card
const handleCardClick = () => {
  if (isPrinted) {
    const type = detectProductType(product.name);
    console.log(type)
    setActiveProduct(type); // ✅ set before navigate
    navigate('/design-tool');
  } else if (onClick) {
    onClick(product);
  } else if (onViewDetails) {
    onViewDetails(product);
  }
};

// 🛒 Add to cart button
const handleAddToCart = (e: React.MouseEvent) => {
  e.stopPropagation();
  onClick(product);
};

// 🎨 Customize button
const handleCustomize = (e: React.MouseEvent) => {
  e.stopPropagation();
  const type = detectProductType(product.name);
  setActiveProduct(type); // ✅ set before navigate
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
          className="w-full h-36 sm:h-40 md:h-50 lg:h-60 object-cover rounded-md"
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
          <PenTool className="h-5 w-5 mr-2" /> Customize
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Search className="h-5 w-5 mr-2" />
          {product.stock <= 0 ? 'Out of Stock' : 'See Product'}
        </Button>
      )}
    </div>
  </CardContent>
</Card>


  );
};

export default ProductCard;