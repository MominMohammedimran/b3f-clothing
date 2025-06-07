
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import BharatPeUpiPayment from '../components/payment/BharatPeUpiPayment';

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
  const { cartItems, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
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
    return `B3F-${Date.now().toString().slice(-6)}`;
  };

  const handlePaymentSuccess = () => {
    toast.success('Redirecting to complete your payment...');
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

  const orderData = {
    orderId: generateOrderNumber(),
    total: finalTotal,
    items: cartItems.map(item => ({
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      product_id: item.product_id || item.id,
      name: item.name || 'Unknown Product',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      size: item.size || '',
      color: item.color || '',
      image: item.image || '',
      metadata: item.metadata || null
    })),
    shippingAddress: {
      fullName: shippingAddress.fullName || shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Unknown',
      address: shippingAddress.address || shippingAddress.addressLine1 || shippingAddress.street || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      zipCode: shippingAddress.zipCode || shippingAddress.postalCode || '',
      country: shippingAddress.country || 'India',
      phone: shippingAddress.phone || '',
      email: shippingAddress.email || currentUser?.email || ''
    }
  };

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
              <h2 className="text-lg font-semibold mb-4">BharatPe UPI Payment</h2>
              <p className="text-gray-600 mb-4">
                Pay securely using UPI to our BharatPe account. You will be redirected to complete your payment.
              </p>
              
              <BharatPeUpiPayment 
                orderData={orderData}
                onSuccess={handlePaymentSuccess}
              />
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Payment Process:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click "Pay Now" above</li>
                <li>Complete payment using your UPI app</li>
                <li>Upload payment screenshot</li>
                <li>Enter UTR number for verification</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
