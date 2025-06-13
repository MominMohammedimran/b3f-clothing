import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';
import { Button } from '@/components/ui/button';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
    
    {/* Product Details */}
    <div className="space-y-3 mb-4 border-b pb-4">
      <h3 className="font-medium text-gray-700">Items ({cartItems.length})</h3>
      {cartItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <img 
            src={item.image || '/placeholder.svg'} 
            alt={item.name}
            className="w-12 h-12 object-cover rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-gray-500">
              Size: {item.size || 'N/A'} | Qty: {item.quantity}
            </p>
            <p className="text-sm font-semibold">₹{item.price}</p>
          </div>
        </div>
      ))}
    </div>

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
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);
  const { settings: deliverySettings, loading: settingsLoading, refetch: refetchSettings } = useDeliverySettings();

  const shippingAddress = location.state?.shippingAddress;
  const deliveryFee = deliverySettings.delivery_fee;
  const rewardPointsDiscount = rewardPointsUsed * 1;
  const finalTotal = Math.max(0, totalPrice + deliveryFee - rewardPointsDiscount);

  useEffect(() => {
    if (!currentUser || !cartItems.length || !shippingAddress) {
      navigate('/cart');
    }
  }, [currentUser, cartItems, shippingAddress, navigate]);

  useEffect(() => {
    // Refetch settings when component mounts to get latest delivery fees
    refetchSettings();
  }, [refetchSettings]);

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully!');
    // Clear cart after successful payment
    clearCart();
  };

  const handlePaymentError = () => {
    toast.error('Payment failed. Please try again.');
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      // Clear cart and navigate back to cart page
      await clearCart();
      toast.success('Order cancelled successfully');
      navigate('/cart');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !cartItems.length || !shippingAddress || settingsLoading) {
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/checkout" className="mr-4">
              <ArrowLeft size={24} className="text-green-600" />
            </Link>
            <h1 className="text-2xl font-bold">Payment</h1>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                <X size={16} className="mr-2" />
                Cancel Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this order? This action cannot be undone and you'll need to start over.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancelOrder}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Cancelling...' : 'Cancel Order'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Product Summary Card */}
                  

            {/*<div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Your Order</h2>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                    <img 
                      src={item.image || '/placeholder.svg'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size || 'N/A'} | Quantity: {item.quantity}
                      </p>
                      <p className="text-lg font-semibold text-green-600">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>*/}

            {/*reward points */}
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
                   onChange={(e) => {
                     const inputValue = Number(e.target.value);
                      const maxPoints = Math.min(userProfile.reward_points, finalTotal);
                  if (isNaN(inputValue)) {
                      setRewardPointsUsed(0);
                   } else {
                    setRewardPointsUsed(Math.max(0, Math.min(inputValue, maxPoints)));
                }
               }}
                className="border rounded px-3 py-2 w-24"
                 placeholder="0"
              />
                <span className="text-sm text-gray-600">points to use</span>
               </div>
           </div> 
         )}


          {/* razorpay payment */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Razorpay Payment</h2>
              <p className="text-gray-600 mb-4">
                Pay securely using Razorpay. You can use Credit Card, Debit Card, Net Banking, UPI, or Wallets.
              </p>
              
              <RazorpayCheckout 
                amount={finalTotal}
                cartItems={cartItems}
                shippingAddress={shippingAddress}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            
          </div>

          <div className="space-y-6">
           {/* <OrderSummaryComponent
              cartItems={cartItems}
              totalPrice={totalPrice}
              deliveryFee={deliveryFee}
              rewardPointsDiscount={rewardPointsDiscount}
              finalTotal={finalTotal}
            /> */}

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
