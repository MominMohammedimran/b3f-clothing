
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { CartItem } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '@/services/paymentService';
import { makePayment } from '@/services/paymentServices/razorpay/RazorpayService';
import { Loader2, CreditCard, Gift } from 'lucide-react';
import { sendOrderConfirmationEmail } from '@/components/admin/OrderStatusEmailService';
interface RazorpayCheckoutProps {
  cartItems: CartItem[];
  amount: number;
  shippingAddress: any;
  onSuccess: () => void;
  onError: () => void;
  OrderId?: string;
  RewardPoints?: number;
  onRemoveSize: (itemId: string, size: string) => void;
  onRemoveItem: (itemId: string) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  cartItems,
  amount,
  shippingAddress,
  onSuccess,
  onError,
  OrderId,
  RewardPoints = 0,
  onRemoveSize,
  onRemoveItem
}) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rewardPointsToUse, setRewardPointsToUse] = useState(RewardPoints);
  const [finalAmount, setFinalAmount] = useState(amount);
const navigate = useNavigate();
  useEffect(() => {
    const discountedAmount = Math.max(0, amount - rewardPointsToUse);
    setFinalAmount(discountedAmount);
  }, [amount, rewardPointsToUse]);

  const handlePayment = async () => {
    if (!currentUser) {
      toast.error('Please sign in to proceed with payment');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (finalAmount <= 0 && rewardPointsToUse > 0) {
      // Handle free order with reward points
      try {
        setLoading(true);
        
        const orderData = {
          items: cartItems,
          total: 0,
          shippingAddress,
          paymentMethod: 'reward_points',
          userId: currentUser.id,
          userEmail: currentUser.email || '',
          paymentDetails: {
            rewardPointsUsed: rewardPointsToUse,
            paymentType: 'free_with_rewards'
          }
        };

        await createOrder(orderData);

        // Update user's reward points
        if (userProfile) {
          const newRewardPoints = Math.max(0, userProfile.reward_points - rewardPointsToUse);
          await supabase
            .from('profiles')
            .update({ reward_points: newRewardPoints })
            .eq('id', currentUser.id);
        }

        toast.success('Order placed successfully using reward points!');
        onSuccess();
      } catch (error) {
        console.error('Error creating free order:', error);
        toast.error('Failed to place order');
        onError();
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    try {
      // Create the order payload with proper structure
      const orderPayload = {
        amount: Math.round(finalAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        cartItems: cartItems,
        shippingAddress: shippingAddress,
        customerInfo: {
          name: shippingAddress?.fullName || currentUser.email || '',
          email: currentUser.email || '',
          contact: shippingAddress?.phone || ''
        },
        notes: {
          user_id: currentUser.id,
          user_email: currentUser.email,
          reward_points_used: rewardPointsToUse
        }
      };

      console.log('Creating Razorpay order with payload:', orderPayload);

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: orderPayload
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Payment service error: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        console.error('No response from payment service');
        throw new Error('No response from payment service');
      }

      console.log('Payment service response:', data);

      // Handle different response formats - check for both orderId and order_id
      const razorpayOrderId = data.orderId || data.order_id || data.razorpayOrderId;
      
      if (!razorpayOrderId) {
        console.error('Invalid response from payment service - no order ID found:', data);
        throw new Error('Invalid response from payment service - missing order ID');
      }

      console.log('Using Razorpay order ID:', razorpayOrderId);
      await makePayment(
        finalAmount,
        razorpayOrderId,
        shippingAddress?.fullName || currentUser.email || '',
        currentUser.email || '',
        shippingAddress?.phone || '',
        async (paymentId: string, orderId: string, signature: string) => {
          try {
            const orderData = {
              items: cartItems,
              total: finalAmount,
              shippingAddress,
              paymentMethod: 'razorpay',
              userId: currentUser.id,
              userEmail: currentUser.email || '',
              paymentDetails: {
                paymentId,
                orderId,
                signature,
                rewardPointsUsed: rewardPointsToUse
              }
            };

            await createOrder(orderData);

            // Update user's reward points if used
            if (rewardPointsToUse > 0 && userProfile) {
              const newRewardPoints = Math.max(0, userProfile.reward_points - rewardPointsToUse);
              await supabase
                .from('profiles')
                .update({ reward_points: newRewardPoints })
                .eq('id', currentUser.id);
            }
              await sendOrderConfirmationEmail({
                          orderId:`razorpay-id${razorpayOrderId}`,
                          customerEmail: currentUser.email,
                          customerName: data.shipping_address?.fullName || 'Customer',
                          status: 'confirmed',
                          orderItems: cartItems,
                          totalAmount: amount,
                          shippingAddress: data.shipping_address
                        });

            toast.success('Payment successful!');
            onSuccess();
          } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Payment successful but order creation failed');
            onError();
          } finally {
            setLoading(false);
          }
        },
        () => {
          toast.error('Payment cancelled');
          setLoading(false);
          onError();
          navigate('/orders')
        }
      );
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      toast.error(errorMessage);
      console.log(errorMessage)
      setLoading(false);
      onError();
    }
  };

  const availableRewardPoints = userProfile?.reward_points || 0;
  const maxUsablePoints = Math.min(availableRewardPoints, amount);

  return (
    <div className="space-y-6">
      {/* Reward Points Section */}
      {availableRewardPoints > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Use Reward Points</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available Points:</span>
              <span className="font-semibold text-yellow-600">{availableRewardPoints} points</span>
            </div>
            
            <div className="flex items-center gap-3">
              <label htmlFor="reward-points" className="text-sm font-medium text-gray-700">
                Use Points:
              </label>
              <input
                id="reward-points"
                type="number"
                min={0}
                max={maxUsablePoints}
                value={rewardPointsToUse}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value) || 0, maxUsablePoints);
                  setRewardPointsToUse(value);
                }}
                className="border border-gray-300 rounded px-3 py-1 w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRewardPointsToUse(maxUsablePoints)}
                className="text-xs"
              >
                Use Max
              </Button>
            </div>
            
            {rewardPointsToUse > 0 && (
              <div className="text-sm text-green-600 font-medium">
                💰 Discount: -₹{rewardPointsToUse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{amount}</span>
          </div>
          {rewardPointsToUse > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Reward Points Discount:</span>
              <span>-₹{rewardPointsToUse}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>₹{finalAmount}</span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : finalAmount === 0 && rewardPointsToUse > 0 ? (
          <>
            <Gift className="mr-2 h-4 w-4" />
            Complete Order (Free with Rewards)
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{finalAmount} with Razorpay
          </>
        )}
      </Button>

      {finalAmount === 0 && rewardPointsToUse > 0 && (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-medium">
            🎉 Order fully covered by reward points! No payment required.
          </p>
        </div>
      )}
    </div>
  );
};

export default RazorpayCheckout;
