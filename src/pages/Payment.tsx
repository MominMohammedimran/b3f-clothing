
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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

  const handlePaymentSuccess = (response: any) => {
    console.log('Payment success:', response);
    toast.success('Payment completed successfully!');
  };

  const handlePaymentError = () => {
    toast.error('Payment failed. Please try again.');
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

  const customerInfo = {
    name: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim() || 'Guest',
    email: shippingAddress.email || currentUser?.email || '',
    contact: shippingAddress.phone || ''
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
              <h2 className="text-lg font-semibold mb-4">Razorpay Payment</h2>
              <p className="text-gray-600 mb-4">
                Pay securely using Razorpay. You can use Credit Card, Debit Card, Net Banking, UPI, or Wallets.
              </p>
              
              <RazorpayCheckout 
                amount={finalTotal}
                customerInfo={customerInfo}
                cartItems={cartItems}
                shippingAddress={shippingAddress}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
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
              <h3 className="font-medium text-blue-800 mb-2">Secure Payment with Razorpay:</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>256-bit SSL encryption</li>
                <li>PCI DSS compliant</li>
                <li>Multiple payment options</li>
                <li>Instant payment confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;