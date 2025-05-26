
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, MapPin, Clock } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8 mt-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/orders" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Track Order</h1>
        </div>
        
        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Order #{tracking.tracking_number}</h2>
              <p className="text-gray-600">Placed on {new Date(tracking.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{tracking.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <OrderTrackingStatus 
            currentStatus={tracking.status}
            estimatedDelivery={tracking.estimated_delivery || 'To be confirmed'}
          />
        </div>
        
        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                  <p className="font-medium">{tracking.current_location || 'Processing at warehouse'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-medium">
                    {tracking.estimated_delivery 
                      ? new Date(tracking.estimated_delivery).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'To be confirmed'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tracking ID</p>
                  <p className="font-medium font-mono">{tracking.tracking_number || 'Not yet assigned'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {new Date(tracking.timestamp).toLocaleDateString('en-US', {
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
        
        {/* Tracking History */}
        {tracking.history && tracking.history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6">Tracking History</h2>
            <div className="space-y-4">
              {tracking.history.map((item, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-3 h-3 mt-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.status}</p>
                        <p className="text-sm text-gray-600">{item.location}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-2 md:mt-0">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Contact Support */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => toast('Support team will contact you soon')}
            variant="outline"
            className="mx-auto"
          >
            Need Help? Contact Support
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
