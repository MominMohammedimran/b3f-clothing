
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const EmptyWishlist: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
      <Heart size={28} className="text-gray-400" />
    </div>
    <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
    <p className="text-gray-500 mb-6">Looks like you haven't added any products to your wishlist yet.</p>
    <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
      Browse Products
    </Link>
  </div>
);

export default EmptyWishlist;
