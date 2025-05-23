
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/context/CartContext';
import PaymentSummary from '@/components/payment/PaymentSummary';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import PaymentHeader from '@/components/payment/PaymentHeader';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import RazorpayCheckout from '@/components/payment/RazorpayCheckout';
import PaymentService from '@/services/paymentService';
import { calculateEstimatedDelivery, updateInventoryLevels } from '@/utils/orderUtils';

const Payment = () => {
  const { cartItems, clearCart, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Get shipping address from location state or localStorage
  useEffect(() => {
    if (location.state?.shippingAddress) {
      // If coming from checkout with state
      setShippingAddress(location.state.shippingAddress);
      localStorage.setItem('shippingAddress', JSON.stringify(location.state.shippingAddress));
    } else {
      // Try to get from localStorage as fallback
      const savedAddress = localStorage.getItem('shippingAddress');
      if (savedAddress) {
        setShippingAddress(JSON.parse(savedAddress));
      } else {
        // If still no shipping address, redirect back to checkout
        toast.error('Shipping information is missing');
        navigate('/checkout');
        return;
      }
    }
    
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
  }, [location, navigate, currentUser, cartItems]);
  
  // Prepare order data
  useEffect(() => {
    if (shippingAddress && cartItems && cartItems.length > 0) {
      const subtotal = totalPrice;
      const deliveryFee = 40; // You can adjust this based on your logic
      const total = subtotal + deliveryFee;
      const orderNumber = `B3F-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      setOrderData({
        orderNumber,
        items: cartItems,
        subtotal,
        deliveryFee,
        total,
        shippingAddress
      });
    }
  }, [shippingAddress, cartItems, totalPrice]);
  
  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!currentUser || !orderData) {
      toast.error('User or order data not available');
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      // Use PaymentService to process payment
      const paymentService = new PaymentService(supabase);
      const estimatedDelivery = calculateEstimatedDelivery(new Date());
      
      // Process the payment through our service
      const result = await paymentService.processPayment(
        currentUser.id,
        currentUser.email || '',
        orderData.orderNumber,
        orderData.total,
        orderData.deliveryFee,
        cartItems,
        shippingAddress,
        estimatedDelivery,
        'razorpay',
        paymentDetails
      );
      
      if (!result || !result.success) {
        const errorMessage = result?.error || 'Payment processing failed';
        setPaymentError(errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('Order created:', result);
      
      // Update inventory levels
      await updateInventoryLevels(cartItems);
      
      // Clear cart after successful order
      await clearCart();
      
      // Clear the shipping address from localStorage
      localStorage.removeItem('shippingAddress');
      
      // Show success message
      toast.success('Payment successful! Order placed.');
      
      // Redirect to order tracking page instead of order complete
      navigate(`/track-order/${result.orderId}`);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePaymentFailure = () => {
    toast.error('Payment was cancelled or failed. Please try again.');
    setPaymentError('Payment was cancelled');
    setIsProcessing(false);
    setShowRazorpay(false);
  };
  
  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      if (!currentUser) {
        toast.error('Please sign in to place an order');
        navigate('/signin');
        return;
      }
      
      if (!shippingAddress) {
        toast.error('Shipping address is missing');
        navigate('/checkout');
        return;
      }
      
      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty');
        navigate('/');
        return;
      }
      
      if (paymentMethod === 'razorpay') {
        setShowRazorpay(true);
        setIsProcessing(false);
        return;
      }
      
      // For COD, directly process the order
      const paymentService = new PaymentService(supabase);
      const estimatedDelivery = calculateEstimatedDelivery(new Date());
      
      // Process the payment through our service
      const result = await paymentService.processPayment(
        currentUser.id,
        currentUser.email || '',
        orderData.orderNumber,
        orderData.total,
        orderData.deliveryFee,
        cartItems,
        shippingAddress,
        estimatedDelivery,
        'cod'
      );
      
      if (!result || !result.success) {
        const errorMessage = result?.error || 'Order processing failed';
        setPaymentError(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Clear cart after successful order
      await clearCart();
      
      // Clear the shipping address from localStorage
      localStorage.removeItem('shippingAddress');
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation page
      navigate(`/order-complete/${result.orderId}`);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4">Please sign in to continue...</p>
        </div>
      </Layout>
    );
  }
  
  if (!shippingAddress || !orderData) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4">Loading payment information...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <PaymentHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>
              <PaymentMethodSelector 
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            </div>
         
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              
              {shippingAddress && (
                <div>
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>Phone: {shippingAddress.phone}</p>
                  <p>Email: {shippingAddress.email}</p>
                </div>
              )}
            </div>
            
            {paymentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mt-6">
                <p className="font-medium">Payment Error:</p>
                <p>{paymentError}</p>
              </div>
            )}
            
            {showRazorpay && paymentMethod === 'razorpay' && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Razorpay Payment</h2>
                <RazorpayCheckout 
                  amount={orderData?.total || 0}
                  orderId={orderData?.orderNumber || ''}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            {orderData && (
              <PaymentSummary 
                orderData={orderData}
                loading={isProcessing}
                handlePaymentSubmit={handlePlaceOrder}
                paymentMethod={paymentMethod}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
