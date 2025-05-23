
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import OrderTrackingStatus from '../components/orders/OrderTrackingStatus';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import OrderLoadingState from '../components/orders/OrderLoadingState';
import OrderErrorState from '../components/orders/OrderErrorState';
import { toast } from 'sonner';

const TrackOrder = () => {
  const { id } = useParams<{ id: string }>();
  const { tracking, loading, error } = useOrderTracking(id || '');

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
          <OrderErrorState error={error?.message || 'Error loading tracking information'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex items-center mb-6">
          <Link to="/orders" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold ml-4">Track Order #{tracking.order_id}</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <OrderTrackingStatus 
            currentStatus={tracking.status}
            estimatedDelivery={tracking.estimatedDelivery || 'To be confirmed'}
          />
          
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">{new Date(tracking.timestamp).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p className="font-medium">{tracking.estimatedDelivery ? tracking.estimatedDelivery : 'To be confirmed'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Location</p>
                <p className="font-medium">{tracking.currentLocation || tracking.location || 'Processing at warehouse'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tracking ID</p>
                <p className="font-medium">{tracking.id || 'Not yet assigned'}</p>
              </div>
            </div>
          </div>
          
          {tracking.history && tracking.history.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Tracking History</h2>
              <div className="space-y-4">
                {tracking.history.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                    <div>
                      <p className="font-medium">{item.status}</p>
                      <p className="text-sm text-gray-500">{item.location} - {new Date(item.timestamp).toLocaleString()}</p>
                      {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <Button onClick={() => toast('Support team will contact you soon')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
