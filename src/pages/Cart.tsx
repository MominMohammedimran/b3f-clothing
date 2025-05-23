
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import CartItemList from '../components/cart/CartItemList';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/components/ui/use-toast';

const DELIVERY_FEE = 40;

const Cart = () => {
  const { cartItems, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    // If not logged in, redirect to sign in
    if (!currentUser) {
      navigate('/signin?redirectTo=/cart');
      return;
    }
  }, [currentUser, navigate]);

  const handleCheckout = () => {
    if (!currentUser) {
      toast.error({
        title: 'Authentication Required', 
        description: 'Please sign in to checkout'
      });
      navigate('/signin?redirectTo=/checkout');
      return;
    }
    
    // Ensure there are items in the cart before proceeding
    if (!cartItems || cartItems.length === 0) {
      toast.error({
        title: 'Empty Cart',
        description: 'Your cart is empty'
      });
      return;
    }
    
    // Navigate to checkout
    navigate('/checkout');
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 mt-8">
          <div className="flex items-center mb-6">
            <Link to="/" className="mr-2">
              <ArrowLeft size={24} className="text-blue-600 hover:text-blue-800" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-600">Shopping Cart</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="mb-4">Please sign in to view your cart.</p>
            <button 
              onClick={() => navigate('/signin?redirectTo=/cart')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 mt-10">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="text-blue-600 hover:text-blue-800" />
          </Link>
          <h1 className="text-2xl font-bold text-blue-600">Shopping Cart</h1>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <CartItemList cartItems={cartItems} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <CartSummary
                subtotal={totalPrice}
                deliveryFee={DELIVERY_FEE}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
