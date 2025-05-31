
import { EdgeFunctionApiService } from './api';
import { Order, ShippingAddress } from '@/lib/types';
import { NotificationType, sendNotification } from '../notificationService';

// Mock order data with placeholder images
const mockOrders: Record<string, Order> = {
  'order-1': {
    id: 'order-1',
    user_id: 'user-1',
    order_number: 'ORD12345',
    status: 'processing',
    total: 2499.99,
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        name: 'Premium T-Shirt',
        price: 999.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
      },
      {
        id: 'item-2',
        productId: 'product-2',
        name: 'Designer Jeans',
        price: 1499.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
      }
    ],
    created_at: new Date().toISOString(),
    shipping_address: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    },
    payment_method: 'credit_card',
    delivery_fee: 99.99
  }
};

export class OrderMicroservice {
  private api: EdgeFunctionApiService;

  constructor() {
    this.api = new EdgeFunctionApiService();
  }

  // Create a new order
  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      console.log('Creating mock order with data:', orderData);
      
      const newOrderId = `order-${Date.now()}`;
      const newOrder: Order = {
        id: newOrderId,
        user_id: orderData.user_id || 'anonymous',
        order_number: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'pending',
        total: orderData.total || 0,
        items: orderData.items || [],
        created_at: new Date().toISOString(),
        shipping_address: orderData.shipping_address || {} as ShippingAddress,
        payment_method: orderData.payment_method || 'cod',
        delivery_fee: orderData.delivery_fee || 0
      };
      
      mockOrders[newOrderId] = newOrder;

      if (newOrder.user_id) {
        await sendNotification({
          userId: newOrder.user_id,
          orderId: newOrder.id,
          type: NotificationType.ORDER_CONFIRMED,
          data: {
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        });
      }

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get order by ID
  public async getOrder(orderId: string): Promise<Order> {
    try {
      const order = mockOrders[orderId];
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Get orders for a user
  public async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return Object.values(mockOrders).filter(order => order.user_id === userId);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Update order status
  public async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const order = mockOrders[orderId];
      if (!order) {
        throw new Error('Order not found');
      }
      
      order.status = status;
      order.updated_at = new Date().toISOString();
      
      if (order.user_id) {
        let notificationType: NotificationType;
        let notificationData = {};

        switch (status) {
          case 'shipped':
            notificationType = NotificationType.ORDER_SHIPPED;
            notificationData = {
              trackingNumber: `TRK${Math.floor(100000 + Math.random() * 900000)}`,
              estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
            break;
          case 'delivered':
            notificationType = NotificationType.ORDER_DELIVERED;
            break;
          default:
            return order;
        }

        await sendNotification({
          userId: order.user_id,
          orderId,
          type: notificationType,
          data: notificationData
        });
      }

      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cancel an order
  public async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const order = mockOrders[orderId];
      if (!order) {
        throw new Error('Order not found');
      }
      
      order.status = 'cancelled';
      order.updated_at = new Date().toISOString();
      order.cancellation_reason = reason;

      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

export const orderMicroservice = new OrderMicroservice();
