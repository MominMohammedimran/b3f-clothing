
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processingPayment, setProcessingPayment] = useState(false);

  const shippingAddress = location.state?.shippingAddress;
  const deliveryFee = 50;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    if (!currentUser || !cartItems.length || !shippingAddress) {
      navigate('/cart');
    }
  }, [currentUser, cartItems, shippingAddress, navigate]);

  const generateOrderNumber = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };
  
  
  const serializeCartItems = (items: any[]) => {
    return items.map(item => ({
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      product_id: item.product_id || item.id,
      name: item.name || 'Unknown Product',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: item.size || '',
      color: item.color || '',
      image: item.image || '',
      metadata: item.metadata || null
    }));
  };

  const normalizeShippingAddress = (address: any) => {
    return {
      fullName: address.fullName || address.name || `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Unknown',
      address: address.address || address.addressLine1 || address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || address.postalCode || '',
      country: address.country || 'India',
      phone: address.phone || '',
      email: address.email || currentUser?.email || ''
    };
  };

  const handleCODPayment = async () => {
    if (!currentUser || !cartItems.length) {
      toast.error('Missing required information for order placement');
      return;
    }

    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const serializedItems = serializeCartItems(cartItems);
      const normalizedAddress = normalizeShippingAddress(shippingAddress);
      
      console.log('Creating COD order with:', {
        user_id: currentUser.id,
        order_number: orderNumber,
        items: serializedItems,
        total: finalTotal,
        shipping_address: normalizedAddress
      });
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          user_email: currentUser.email,
          order_number: orderNumber,
          total: finalTotal,
          status: 'pending',
          items: serializedItems,
          payment_method: 'cod',
          delivery_fee: deliveryFee,
          shipping_address: normalizedAddress,
          payment_details: {
            method: 'cod',
            status: 'pending'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Order created successfully:', orderData);

      // Clear cart
      await clearCart();

      toast.success('Order placed successfully!');

      // Navigate to order complete
      navigate(`/order-complete/${orderData.id}`, {
        state: { orderData }
      });

    } catch (error) {
      console.error('COD Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Order placement failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpaySuccess = async (transactionDetails: any) => {
    if (!currentUser || !cartItems.length) {
      toast.error('Missing required information for order placement');
      return;
    }

    setProcessingPayment(true);
    try {
      const orderNumber = generateOrderNumber();
      const serializedItems = serializeCartItems(cartItems);
      const normalizedAddress = normalizeShippingAddress(shippingAddress);
      
      console.log('Creating Razorpay order with:', {
        user_id: currentUser.id,
        order_number: orderNumber,
        payment_details: transactionDetails
      });
      
      // Create order with payment details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser.id,
          user_email: currentUser.email,
          order_number: orderNumber,
          total: finalTotal,
          status: 'confirmed',
          items: serializedItems,
          payment_method: 'razorpay',
          delivery_fee: deliveryFee,
          shipping_address: normalizedAddress,
          payment_details: {
            method: 'razorpay',
            payment_id: transactionDetails.paymentId,
            order_id: transactionDetails.orderId,
            signature: transactionDetails.signature,
            amount: transactionDetails.amount,
            currency: transactionDetails.currency,
            status: 'success'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Razorpay order created successfully:', orderData);

      // Clear cart
      await clearCart();

      toast.success('Payment successful! Order confirmed.');

      // Navigate to order complete
      navigate(`/order-complete/${orderData.id}`, {
        state: { orderData }
      });

    } catch (error) {
      console.error('Razorpay order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Order creation failed: ${errorMessage}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRazorpayFailure = () => {
    setProcessingPayment(false);
    toast.error('Payment failed. Please try again.');
  };

  const handlePayment = () => {
    if (paymentMethod === 'cod') {
      handleCODPayment();
    }
    // For Razorpay, the RazorpayCheckout component handles the payment flow
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
                      <div className="relative">
                        {item.metadata?.previewImage || item.metadata?.designData ? (
                          <div className="w-12 h-12 border-2 border-dashed border-blue-400 rounded bg-blue-50 flex items-center justify-center">
                            <img
                              src={item.metadata?.previewImage || item.image || '/placeholder.svg'}
                              alt={item.name}
                              className="w-10 h-10 object-contain rounded"
                            />
                          </div>
                        ) : (
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        {(item.metadata?.previewImage || item.metadata?.designData) && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded-full">
                            ✨
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                          {item.metadata?.view && ` • ${item.metadata.view}`}
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

            {/* Payment Button */}
            {paymentMethod === 'razorpay' ? (
              <RazorpayCheckout
                amount={finalTotal}
               customOrderId={`${generateOrderNumber()}`}
                onSuccess={handleRazorpaySuccess}
                onFailure={handleRazorpayFailure}
              />
            ) : (
              <Button
                onClick={handlePayment}
                disabled={loading || processingPayment}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : `Place Order - ${formatPrice(finalTotal)}`}
              </Button>
            )}

            {processingPayment && (
              <div className="text-center text-sm text-gray-600">
                Processing your payment and creating order...
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
