import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { Button } from '@/components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';

const Cart = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const seoData = useSEO({
    title: 'Shopping Cart - Review Your Custom Products',
    description: 'Review your custom designed products and proceed to secure checkout.',
    keywords: 'shopping cart, checkout, custom products, secure payment'
  });

  const {
    cartItems,
    totalPrice,
    removeFromCart,
    removeSizeFromCart,
    clearCart,
    loading
  } = useCart();

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/signin?redirectTo=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const { settings: deliverySettings, loading: settingsLoading } = useDeliverySettings();
  const deliveryFee = deliverySettings?.delivery_fee || 100;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <Link to="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart ({cartItems.length})</h1>
          <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="h-24 w-24 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Price per item: {formatPrice(item.price)}
                      </p>

                     

                      {/* Remove entire item button */}
                      <div className="mt-4 flex justify-start">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Item
                        </Button>
                      </div>
                    </div>
                  </div>
                   {/* Sizes Section */}
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-2">Sizes:</h4>
                        <div className="flex gap-3 overflow-x-auto py-1">
                          {item.sizes.map((sizeItem) => (
                            <div
                              key={sizeItem.size}
                              className="flex flex-col items-center bg-gray-50 border p-3 rounded-lg min-w-[120px] shadow-sm"
                            >
                              <div className="flex justify-between items-center w-full mb-1">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                                 Size : {sizeItem.size}
                                </span>
                                <button
                                  onClick={() => removeSizeFromCart(item.id, sizeItem.size)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-sm font-medium">Qty: {sizeItem.quantity}</div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatPrice(item.price * sizeItem.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow border sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice + deliveryFee)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full mb-3">
                Proceed to Checkout
              </Button>

              <Link to="/">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
