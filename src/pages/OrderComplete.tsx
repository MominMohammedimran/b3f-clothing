
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useOrderData from '../hooks/useOrderData';
import { formatPrice } from '@/lib/utils';
import { parseOrderItems, normalizeOrderData } from '@/utils/orderUtils';

const OrderComplete = () => {
  const { orderId } = useParams();
  const { orderData, loading, error } = useOrderData();

  // Helper function to check if item has custom design
  const hasCustomDesign = (item: any) => {
    return item.metadata?.previewImage || item.metadata?.designData;
  };

  // Helper function to get display image
  const getItemDisplayImage = (item: any) => {
    if (item.metadata?.previewImage) {
      return item.metadata.previewImage;
    }
    if (item.image) {
      return item.image;
    }
    return '/placeholder.svg';
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !orderData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p>{error || 'Order not found'}</p>
            <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
              Return to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Normalize order data to ensure consistent properties
  const normalizedOrder = normalizeOrderData(orderData);
  const orderItems = parseOrderItems(normalizedOrder.items);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600">Order Confirmed!</h2>
            <p className="text-gray-600 mt-2">
              Thank you for your order. Your order has been placed and is being processed.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Order Number:</span>
              <span>{normalizedOrder.order_number || normalizedOrder.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Date:</span>
              <span>
                {new Date(normalizedOrder.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total Amount:</span>
              <span>{formatPrice(normalizedOrder.total)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Payment Method:</span>
              <span>
                {normalizedOrder.payment_method || 'Cash on Delivery'}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-medium text-lg mb-3">Order Items:</h3>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {hasCustomDesign(item) ? (
                      <div className="relative">
                        <div className="h-16 w-16 border-2 border-dashed border-blue-400 rounded bg-blue-50 flex items-center justify-center">
                          <img
                            src={getItemDisplayImage(item)}
                            alt={item.name}
                            className="h-12 w-12 object-contain rounded"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded-full">
                          ✨
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getItemDisplayImage(item)}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded border"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.name}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      {item.size && <p>Size: {item.size}</p>}
                      {item.quantity > 1 && <p>Quantity: {item.quantity}</p>}
                      {item.metadata?.view && <p>Design: {item.metadata.view}</p>}
                      {hasCustomDesign(item) && (
                        <p className="text-blue-600 font-medium">✨ Custom Design</p>
                      )}
                      {item.metadata?.backImage && (
                        <p className="text-purple-600 font-medium">🔄 Dual-Sided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between">
            <Link
              to={`/track-order/${normalizedOrder.id}`}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 mb-3 sm:mb-0 text-center"
            >
              Track Order
            </Link>
            <Link
              to="/"
              className="bg-gray-100 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-200 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderComplete;
