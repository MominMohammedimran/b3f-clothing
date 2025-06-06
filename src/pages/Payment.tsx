import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from '@/utils/toastWrapper';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import ShippingDetailsForm from '../components/checkout/ShippingDetailsForm';
import { useLocation as useLocationContext } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAddresses } from '../hooks/useAddresses';
import SavedAddresses from '@/components/checkout/SavedAddresses';
import { Button } from '@/components/ui/button';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';

// Create a simplified OrderSummary component for this page
const OrderSummaryComponent = ({ 
  cartItems, 
  totalPrice, 
  deliveryFee, 
  rewardPointsDiscount, 
  finalTotal 
}: {
  cartItems: any[];
  totalPrice: number;
  deliveryFee: number;
  rewardPointsDiscount: number;
  finalTotal: number;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Subtotal ({cartItems.length} items)</span>
        <span>₹{totalPrice}</span>
      </div>
      <div className="flex justify-between">
        <span>Delivery Fee</span>
        <span>₹{deliveryFee}</span>
      </div>
      {rewardPointsDiscount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Reward Points Discount</span>
          <span>-₹{rewardPointsDiscount}</span>
        </div>
      )}
      <div className="border-t pt-3">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{finalTotal}</span>
        </div>
      </div>
    </div>
  </div>
);

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);

  const shippingAddress = location.state?.shippingAddress;
  const deliveryFee = 50;
  const rewardPointsDiscount = rewardPointsUsed * 1;
  const finalTotal = Math.max(0, totalPrice + deliveryFee - rewardPointsDiscount);

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

  const sendOrderEmail = async (orderData: any, status: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-order-notification', {
        body: {
          orderId: orderData.order_number,
          customerEmail: currentUser?.email,
          customerName: userProfile?.display_name || userProfile?.first_name || 'Customer',
          status: status,
          orderItems: orderData.items,
          totalAmount: orderData.total,
          shippingAddress: orderData.shipping_address
        }
      });

      if (error) {
        console.error('Error sending order email:', error);
        toast.error('Order created but email notification failed');
      } else {
        console.log('Order email sent successfully:', data);
        toast.success('Order confirmation email sent!');
      }
    } catch (error) {
      console.error('Failed to send order email:', error);
      toast.error('Order created but email notification failed');
    }
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
            status: 'pending',
            reward_points_used: rewardPointsUsed
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

      await sendOrderEmail(orderData, 'confirmed');

      if (rewardPointsUsed > 0) {
        await supabase
          .from('profiles')
          .update({ 
            reward_points: (userProfile?.reward_points || 0) - rewardPointsUsed 
          })
          .eq('id', currentUser.id);
      }

      console.log('Order created successfully:', orderData);
      await clearCart();
      toast.success('Order placed successfully!');

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

const handleOnlinePayment = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/create-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalPrice * 100,
        description: 'B3F Prints Order',
        customer: {
          name: 'Customer',
          email: currentUser?.email,
          contact: currentUser?.phone || '',
        },
        callback_url: `https://b3f-prrints.pages.dev/order-complete`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.short_url) {
      toast.error(data.error?.description || 'Failed to create payment link');
      return;
    }

    window.location.href = data.short_url;
  } catch (error) {
    console.error('Error:', error);
    toast.error('Unable to create Razorpay payment link');
  } finally {
    setLoading(false);
  }
};


  if (!currentUser || !cartItems.length || !shippingAddress) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading payment information...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex items-center mb-6">
          <Link to="/checkout" className="mr-4">
            <ArrowLeft size={24} className="text-green-600" />
          </Link>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Online Payment (Recommended)</div>
                    <div className="text-sm text-gray-500">Pay with UPI, Cards, Net Banking</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when your order arrives</div>
                  </div>
                </label>
              </div>
            </div>

            {userProfile?.reward_points && userProfile.reward_points > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Use Reward Points</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Available: {userProfile.reward_points} points (₹{userProfile.reward_points})
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={Math.min(userProfile.reward_points, finalTotal)}
                    value={rewardPointsUsed}
                    onChange={(e) => setRewardPointsUsed(Number(e.target.value))}
                    className="border rounded px-3 py-2 w-24"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-600">points to use</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <OrderSummaryComponent
              cartItems={cartItems}
              totalPrice={totalPrice}
              deliveryFee={deliveryFee}
              rewardPointsDiscount={rewardPointsDiscount}
              finalTotal={finalTotal}
            />

            <div className="space-y-4">
              {paymentMethod === 'razorpay' ? (
               <Button
  onClick={handleOnlinePayment}
  disabled={loading}
  className="w-full"
  size="lg"
>
  {loading ? 'Redirecting...' : `Pay Online - ₹${finalTotal}`}
</Button>

              ) : (
                <Button
                  onClick={handleCODPayment}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : `Place Order - ₹${finalTotal}`}
                </Button>
              )}

              {(loading || processingPayment) && (
                <div className="text-center text-gray-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  {processingPayment ? 'Processing payment...' : 'Creating order...'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
