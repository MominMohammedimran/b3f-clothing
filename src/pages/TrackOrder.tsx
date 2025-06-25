import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, MapPin, Clock } from 'lucide-react';
import OrderTrackingStatus from '../components/orders/OrderTrackingStatus';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import OrderLoadingState from '../components/orders/OrderLoadingState';
import OrderErrorState from '../components/orders/OrderErrorState';

const TrackOrder = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, loading, error } = useOrderTracking();
  const tracking = orders.find((order) => order.id === id);

  const getEstimatedDeliveryMessage = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processing at warehouse';
      case 'confirmed':
        return 'Estimated delivery in 5–7 days';
      case 'shipped':
        return 'Estimated delivery in 5-8 days';
      case 'delivered':
        return 'Delivered successfully';
      default:
        return 'To be confirmed';
    }
  };

  const getCurrentLocation = (status: string) => {
    switch (status) {
      case 'processing':
      case 'confirmed':
        return 'Processing at warehouse';
      case 'shipped':
        return 'Shipped from warehouse';
      case 'out_for_delivery':
        return 'Out for delivery';
      case 'delivered':
        return tracking.shippingAddress.address|| 'Delivered to customer';
      case 'cancelled':
        return 'Order cancelled';
      default:
        return 'Awaiting fulfillment';
    }
  };const getWhatsappMessage = () => {
  const statusText = getEstimatedDeliveryMessage(tracking.status);
  return encodeURIComponent(
    `Hello, I need help with my order.\n\n` +
    `Order ID: ${tracking.order_number}\n` +
    `Status: ${tracking.status}\n` +
    `Total: ₹${tracking.total || 'N/A'}\n` +
    `Estimated Delivery: ${statusText}\n\n` +
    `I have an issue with this order.`
  );
};


  const seoData = useSEO({
    title: tracking ? `Track Order ${tracking.order_number}` : 'Track Your Order',
    description: 'Track the status and delivery progress of your custom printed products with real-time updates.',
    keywords: 'track order, order status, delivery tracking, shipping status'
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh] mt-10">
          <OrderLoadingState />
        </div>
      </Layout>
    );
  }

  if (error || !tracking) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <OrderErrorState error={error || 'Error loading tracking information'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto px-4 py-8 mt-10 max-w-4xl space-y-6">
        <div className="flex items-center mb-4">
          <Link to="/orders" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Track Order</h1>
        </div>


        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
              <p className="font-medium">{getEstimatedDeliveryMessage(tracking.status)}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Order #{tracking.order_number}</h2>
              <p className="text-gray-600">Placed on {new Date(tracking.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-medium capitalize">{tracking.status}</span>
            </div>
          </div>
        </div>

        <OrderTrackingStatus
          currentStatus={tracking.status}
          estimatedDelivery={getEstimatedDeliveryMessage(tracking.status)}
          cancellationReason={tracking.cancellation_reason}
        />

        {tracking.status !== 'cancelled' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Current Location</p>
                    <p className="font-medium">{getCurrentLocation(tracking.status)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">{getEstimatedDeliveryMessage(tracking.status)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tracking ID</p>
                    <p className="font-medium font-mono">{tracking.order_number || 'Not yet assigned'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {new Date(tracking.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-700 text-sm mb-2 text-center">
  💡 For any issue related to this order, you can contact us directly via WhatsApp:
</p>
          <a
  href={`https://wa.me/9176720808881?text=${getWhatsappMessage()}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
>
  💬 Chat on WhatsApp 
</a>

        </div>
{tracking.shippingAddress && (
  <div className="mt-6 max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow p-5">
   <div className="flex items-center justify-between mb-3">
  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
    📦 Shipping Address
    <span className="text-sm font-normal text-gray-500">— used for this order</span>
  </h3>
</div>

    <div className="text-sm text-gray-700 leading-relaxed space-y-1">
      <p className="font-medium text-gray-900">
        {tracking.shippingAddress.fullName || `${tracking.shippingAddress.firstName} ${tracking.shippingAddress.lastName}`}
      </p>
      <p>{tracking.shippingAddress.address}</p>
      <p>
        {tracking.shippingAddress.city}, {tracking.shippingAddress.state} -{' '}
        {tracking.shippingAddress.zipCode}
      </p>
      <p>{tracking.shippingAddress.country}</p>
      <hr className="my-2" />
      <p>
        📞{' '}
        <span className="font-medium text-gray-900">
          {tracking.shippingAddress.phone}
        </span>
      </p>
      <p>
        📧{' '}
        <span className="font-medium text-gray-900">
          {tracking.shippingAddress.email}
        </span>
      </p>
    </div>
  </div>
)}


        
      </div>
    </Layout>
  );
};

export default TrackOrder;
