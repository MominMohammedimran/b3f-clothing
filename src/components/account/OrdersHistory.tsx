
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orders, products } from '../../lib/data';
import { Order } from '../../lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';

const OrdersHistory = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Combine stored orders with sample data
    const storedOrders = localStorage.getItem('orderHistory');
    const parsedStoredOrders = storedOrders ? JSON.parse(storedOrders) : [];
    
    setAllOrders([...parsedStoredOrders, ...orders]);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">My Orders</h2>
      
      {allOrders.length > 0 ? (
        <div className="space-y-6">
          {allOrders.map((order, index) => {
            // Get first item in the order to display
            const firstItem = order.items[0];
            // Find the associated product
            const product = products.find(p => p.id === firstItem.productId);
            
            // Get the display date, using created_at or date field
            const displayDate = order.created_at || '';
            
            return (
              <div key={`${order.id}-${index}`} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-sm mr-2 text-gray-500">Order ID</div>
                    <div className="text-xs mr-2 font-medium">#{order.id}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm mr-2 text-gray-500">Date</div>
                    <div className=" text-xs mr-2 font-medium">
                      {new Date(displayDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm mr-2 text-gray-500">Status</div>
                    <div className={`text-xs mr-2 font-medium ${
                      order.status === 'delivered' ? 'text-green-600' : 
                      order.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm mr-2 text-gray-500">Total</div>
                    <div className=" text-xs mr-2 font-medium">₹{order.total}</div>
                  </div>
                </div>
                
                <div className="flex items-center border-t pt-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-yellow-100 flex-shrink-0">
                    <img 
                      src={firstItem.image} 
                      alt={firstItem.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  
                  <div className="ml-3">
                    <div className="font-medium">{firstItem.name}</div>
                    <div className="text-sm text-gray-500">
                      {order.items.length > 1 
                        ? `+ ${order.items.length - 1} more item(s)` 
                        : `Qty: ${firstItem.quantity}`}
                    </div>
                    <div className='mt-4'>
                    <Link 
                      to={`/track-order/${order.id}`}
                      className="px-2 py-2 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>You don't have any orders yet.</p>
          <Link to="/" className="text-blue-600 font-medium mt-2 inline-block">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
