
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-blue-50 p-6 rounded-full mb-6">
        <ShoppingBag size={64} className="text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6 text-center">Looks like you haven't added any items to your cart yet.</p>
      <Link to="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
};

export default EmptyCart;
