
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WishlistEmpty = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
          <Heart size={40} className="text-blue-500" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
      <p className="text-gray-500 mb-6">
        Items added to your wishlist will appear here. Start exploring and adding products you love!
      </p>
      
      <div className="flex justify-center">
        <Link to="/">
          <Button className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Explore Products
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WishlistEmpty;
