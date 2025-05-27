
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useWishlist } from '../context/WishlistContext';
import WishlistEmpty from '../components/wishlist/WishlistEmpty';
import WishlistContent from '../components/wishlist/WishlistContent';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

const Wishlist = () => {
  const { wishlistItems } = useWishlist();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <Layout>
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft size={18} className="mr-2" />
              <span className="font-medium">Continue Shopping</span>
            </Link>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <div className="w-32"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Please Sign In</h2>
            <p className="text-gray-500 mb-6">You need to be signed in to view your wishlist.</p>
            <Button onClick={() => navigate('/signin')}>
              Sign In
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={18} className="mr-2" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <div className="w-32"></div>
        </div>
        
        {wishlistItems.length === 0 ? (
          <WishlistEmpty />
        ) : (
          <WishlistContent />
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
