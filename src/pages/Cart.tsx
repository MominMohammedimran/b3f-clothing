
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
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
    updateQuantity,
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

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(id);
    } else {
      await updateQuantity(id, newQuantity);
    }
  };

  // Helper function to get the best available image for display
  const getItemDisplayImage = (item: any) => {
    // Priority: previewImage > image > fallback
    if (item.metadata?.previewImage) {
      return item.metadata.previewImage;
    }
    if (item.image) {
      return item.image;
    }
    return '/placeholder.svg';
  };

  // Helper function to check if item has custom design
  const hasCustomDesign = (item: any) => {
    return item.metadata?.previewImage || item.metadata?.designData;
  };
   const { settings: deliverySettings, loading: settingsLoading, refetch: refetchSettings } = useDeliverySettings();
  
   const deliveryFee = deliverySettings.delivery_fee;

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
            <Link to="">
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
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {hasCustomDesign(item) ? (
                        <div className="relative">
                          <div className="h-20 w-20 border-2 border-dashed border-blue-400 rounded bg-blue-50 flex items-center justify-center">
                            <img
                              src={getItemDisplayImage(item)}
                              alt={item.name}
                              className="h-16 w-16 object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded-full">
                            ✨
                          </div>
                        </div>
                      ) : (
                        <img
                          src={getItemDisplayImage(item)}
                          alt={item.name}
                          className="h-20 w-20 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      )}
                      {item.metadata?.view && (
                        <div className="text-xs text-center mt-1 text-gray-500">
                          {item.metadata.view}
                        </div>
                      )}
                      {item.metadata?.backImage && (
                        <div className="text-xs text-center text-blue-600">
                          Dual-Sided
                        </div>
                      )}
                    </div>
                    
                    

                    <div className="flex items-center ">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h2 w-2" />
                      </Button>
                    </div>
                  
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    
                  </div>

                  <div className="flex-1 min-w-0">
               <h3 className="font-semibold text-gray-900 truncate mb-1">{item.name}</h3>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
              <p>Price: <span className="font-medium">{formatPrice(item.price)}</span></p>
                {item.size && <p>Size: <span className="font-medium">{item.size}</span></p>}
              {item.color && <p>Color: <span className="font-medium">{item.color}</span></p>}
            
                    {hasCustomDesign(item) && (
                 <p className="text-green-600 font-semibold">✨ Custom Design</p>
                     )}
                    </div>
                     </div>


                </div>
              ))}
            </div>
          </div>

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
                    <span>{formatPrice(totalPrice +deliveryFee)}</span>
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