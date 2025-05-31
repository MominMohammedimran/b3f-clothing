
import React from 'react';
import { formatCurrency } from '@/lib/utils';

export interface OrderItemsProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total?: number;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items, total }) => {
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const orderTotal = total || calculateTotal();
  
  return (
    <div>
      <h3 className="font-medium mb-2">Order Items</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {item.image && (
                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                        <img className="h-10 w-10 object-cover rounded" src={item.image} alt={item.name} />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <div className="font-medium">Total: {formatCurrency(orderTotal)}</div>
      </div>
    </div>
  );
};

export default OrderItems;
