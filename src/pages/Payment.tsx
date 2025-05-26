import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const shippingAddress = location.state?.shippingAddress;
  const deliveryFee = 50;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!currentUser || !cartItems.length || !shippingAddress) {
      navigate('/cart');
    }
  }, [currentUser, cartItems, shippingAddress, navigate]);

  const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handlePayment = async () => {
    if (!currentUser || !cartItems.length) return;

    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      
      // Serialize cart items properly
      const serializedItems = cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
        image: item.image || ''
      }));
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          order_number: orderNumber,
          total: finalTotal,
          status: 'pending',
          items: serializedItems,
          payment_method: paymentMethod,
          delivery_fee: deliveryFee,
          shipping_address: shippingAddress
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart
      await clearCart();

      // Navigate to order complete
      navigate(`/order-complete/${orderData.id}`, {
        state: { orderData }
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!shippingAddress) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Invalid Access</h2>
            <p>Please complete the checkout process from the cart.</p>
            <Button onClick={() => navigate('/cart')} className="mt-4">
              Go to Cart
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
                <p>Phone: {shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>Online Payment (UPI, Card, NetBanking)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : `Place Order - ${formatPrice(finalTotal)}`}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
