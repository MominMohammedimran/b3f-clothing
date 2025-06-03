
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useOrderData } from '../hooks/useOrderData';

const OrderComplete = () => {
  const { orderId } = useParams();
  const { orders } = useOrderData();
  
  const order = orders.find(o => o.id === orderId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">Order Complete!</h1>
          {order && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-lg mb-2">Order Number: {order.orderNumber}</p>
              <p className="text-gray-600">Total: ₹{order.total}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderComplete;
