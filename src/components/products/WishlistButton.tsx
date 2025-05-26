
import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/utils/toastWrapper'; // Use the fixed toast wrapper
import { Product } from '@/lib/types';

interface WishlistButtonProps {
  product: Product;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ product }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Get the productId
  const productId = product.id;
  
  const handleAddToWishlist = async (e: React.MouseEvent) => {
    // Stop event propagation to prevent triggering parent button clicks
    e.stopPropagation();
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please sign in to add items to wishlist');
      navigate('/signin');
      return;
    }
    
    // For now, just show a message that wishlist functionality has been removed
    toast.info('Wishlist functionality has been removed', {
      description: 'Wishlist feature is no longer available in this version'
    });
  };

  return (
    <button
      className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors focus:outline-none"
      onClick={handleAddToWishlist}
      aria-label="Add to wishlist"
    >
      <Heart size={18} className="text-gray-600" />
    </button>
  );
};

export default WishlistButton;
