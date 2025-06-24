import React, { useState, useEffect } from 'react';
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

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { cartItems, totalPrice, clearCart, removeSizeFromCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);
  const { settings: deliverySettings, loading: settingsLoading, refetch: refetchSettings } = useDeliverySettings();

  const shippingAddress = location.state?.shippingAddress;
  const deliveryFee = deliverySettings.delivery_fee;
  const rewardPointsDiscount = rewardPointsUsed;
  const finalTotal = Math.max(0, totalPrice + deliveryFee - rewardPointsDiscount);

  useEffect(() => {
    if (!currentUser || !cartItems.length || !shippingAddress) {
      navigate('/cart');
    }
  }, [currentUser, cartItems, shippingAddress, navigate]);

  useEffect(() => {
    refetchSettings();
  }, [refetchSettings]);



  const onRemoveSize = async (itemId: string, size: string) => {
try {
// Assuming you use Supabase or local update
 await removeSizeFromCart(itemId, size); // <- You need to have this function in context
toast.success(`Size ${size} removed from item`);
} catch (err) {
toast.error("Failed to remove size");
}
};


  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully!');
    clearCart();
    navigate('/order-complete');
  };

  const handlePaymentError = () => {
    toast.error('Payment failed. Please try again.');
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await clearCart();
      toast.success('Order cancelled successfully');
      navigate('/cart');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

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
                  Are you sure you want to cancel this order? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelOrder} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? 'Cancelling...' : 'Cancel Order'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Order Summary & Payment */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-center mb-4">Order Summary</h2>

 


              {/* Reward Points */}
            

              {/* Razorpay Checkout */}
              <div>
                <RazorpayCheckout
                  cartItems={cartItems}
                  amount={finalTotal}
                  shippingAddress={shippingAddress}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  OrderId={undefined}
                  RewardPoints={rewardPointsUsed}
                  onRemoveSize={removeSizeFromCart}
                  onRemoveItem={removeFromCart}
                />
              </div>
            </div>
          </div>

          {/* Right: Secure Payment Info */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Secure Payment with Razorpay:</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>256‑bit SSL encryption</li>
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
