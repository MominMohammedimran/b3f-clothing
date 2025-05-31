
import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const WishlistContent: React.FC = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemoveItem = (itemId: string) => {
    removeFromWishlist(itemId);
    toast.success('Item removed from wishlist');
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      ...item,
      quantity: 1
    });
    removeFromWishlist(item.id);
    toast.success('Item added to cart');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Wishlist ({wishlistItems.length} items)</h2>
        <Button variant="outline" size="sm" onClick={clearWishlist}>
          Clear All
        </Button>
      </div>

      <div className="divide-y">
        {wishlistItems.map((item) => (
          <div key={item.id} className="py-4 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 md:col-span-2">
              <Link to={`/product/${item.id}`}>
                <div className="h-24 w-24 bg-gray-100 rounded overflow-hidden">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </Link>
            </div>
            
            <div className="col-span-9 md:col-span-6">
              <Link to={`/product/${item.id}`}>
                <h3 className="font-medium text-lg hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
              </Link>
              {item.category && (
                <p className="text-sm text-gray-500 mt-1">Category: {item.category}</p>
              )}
              <div className="mt-2">
                <span className="font-medium text-lg">₹{item.price}</span>
                {item.original_price && item.original_price > item.price && (
                  <span className="text-sm text-gray-400 line-through ml-2">
                    ₹{item.original_price}
                  </span>
                )}
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistContent;
