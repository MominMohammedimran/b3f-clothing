
import { Link } from 'react-router-dom';
import { Product } from '@/data/products';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn(
        "group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-brand-navy transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex justify-between items-center">
          <p className="font-medium text-gray-900">
            ${product.price.toFixed(2)}
          </p>
          <span className="inline-block bg-brand-lightBlue bg-opacity-20 px-2 py-1 text-xs font-medium text-brand-navy rounded-full">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
