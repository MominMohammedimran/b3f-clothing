
import React from 'react';
import { useLocation } from 'react-router-dom';
import { formatIndianRupees } from '@/utils/currency';
import { CartItem, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrderDetailsSectionProps {
  items: CartItem[];
  shippingAddress: Record<string, any>;
  paymentMethod: string;
  total: number;
  deliveryFee: number;
  status?: string;
  orderId?: string;
  onCancelOrder?: (orderId: string) => void;
}

const OrderDetailsSection: React.FC<OrderDetailsSectionProps> = ({ 
  items = [], 
  shippingAddress = {}, 
  paymentMethod = '', 
  total = 0, 
  deliveryFee = 0,
  status = 'processing',
  orderId = '',
  onCancelOrder
}) => {
  const location = useLocation();
  
  // If props aren't provided, fall back to location state
  const locationState = location.state || {};
  const finalItems = items.length > 0 ? items : locationState.items || [];
  const finalShippingAddress = Object.keys(shippingAddress).length > 0 ? shippingAddress : locationState.shippingAddress || {};
  const finalPaymentMethod = paymentMethod || locationState.paymentMethod || '';
  const finalTotal = total > 0 ? total : locationState.total || 0;
  const finalDeliveryFee = deliveryFee >= 0 ? deliveryFee : locationState.deliveryFee || 0;
  const finalStatus = status || locationState.status || 'processing';
  const finalOrderId = orderId || locationState.orderId || '';
  
  // Log the final data to debug
 
  // Store in localStorage if needed
  if (finalItems && finalItems.length > 0) {
    localStorage.setItem("order-item", JSON.stringify(finalItems));
  }

  const handleCancelOrder = () => {
    if (onCancelOrder && finalOrderId) {
      onCancelOrder(finalOrderId);
    } else {
      toast.error("Unable to cancel order at this time");
    }
  };

  const formatPaymentMethod = (method: string | undefined) => {
    if (!method) return 'Payment Method: Not specified';

    switch (method.toLowerCase()) {
      case 'razorpay': return 'Credit/Debit Card (Razorpay)';
      case 'upi': return 'UPI Payment';
      case 'cod': return 'Cash on Delivery';
      default: return 'Payment Method: Unknown';
    }
  };

  const getFullName = (address: any | null) => {
    if (!address) return 'N/A';
    
    if (address.fullName) return address.fullName;
    if (address.name) return address.name;
    
    return `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'N/A';
  };

  const getFullAddress = (address: any | null) => {
    if (!address) return 'N/A';

    const street = address.addressLine1 || address.street || address.address || '';
    const city = address.city || '';
    const state = address.state || '';
    const zipCode = address.postalCode || address.zipCode || '';
    const country = address.country || '';

    return [street, city, state, zipCode, country].filter(Boolean).join(', ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            {finalItems?.map((item, index) => (
              <div key={index} className="flex border-b py-4 mb-4">
                <div className="flex-shrink-0 w-24 h-24">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="ml-4 flex-1">
                  <span className="font-medium text-lg">{item.name}</span>
                  <div className="text-m text-gray-800">
                    <span>Qty: {item.quantity}</span>
                    {item.size && <span> • Size: {item.size}</span>}
                    {item.view && <span> • View: {item.view}</span>}
                  </div>
                  <div className="mt-2 font-semibold text-lg">
                    <span>{formatIndianRupees(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 text-sm border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatIndianRupees(finalTotal - finalDeliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{formatIndianRupees(finalDeliveryFee)}</span>
            </div>
          </div>
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatIndianRupees(finalTotal)}</span>
          </div>
          
          <div className="mt-4 text-sm p-2 rounded bg-blue-50">
            <span className="font-medium block">Payment Method:</span>
            <span>{formatPaymentMethod(finalPaymentMethod)}</span>
          </div>

          {/* Add Cancel Order Button if order is in processing stage */}
          {finalStatus === 'processing' && (
            <div className="mt-4">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Shipping Details</h2>
        
        {finalShippingAddress ? (
          <div className="space-y-4">
            <div>
              <span className="font-medium block">Recipient:</span>
              <span>{getFullName(finalShippingAddress)}</span>
            </div>
            <div>
              <span className="font-medium block">Address:</span>
              <span>{getFullAddress(finalShippingAddress)}</span>
            </div>
            {(finalShippingAddress.phone) && (
              <div>
                <span className="font-medium block">Phone:</span>
                <span>{finalShippingAddress.phone}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">No shipping details available.</div>
        )}
        
        <div className="mt-6 p-3 bg-green-50 rounded-md border border-green-100">
          <p className="text-sm text-green-700">
            Your order has been confirmed and will be shipped according to the selected delivery method.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSection;
