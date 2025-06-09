
import { EdgeFunctionApiService } from './api';
import { Order } from '@/lib/types';
import { NotificationType, sendNotification } from '../notificationService';

// Mock order data with placeholder images
const mockOrders: Record<string, Order> = {
  'order-1': {
    id: 'order-1',
    userId: 'user-1',
    user_id: 'user-1',
    userEmail: 'user@example.com',
    user_email: 'user@example.com',
    orderNumber: 'ORD12345',
    order_number: 'ORD12345',
    status: 'processing',
    total: 2499.99,
    items: [
      {
        id: 'item-1',
        product_id: 'product-1',
        productId: 'product-1',
        name: 'Premium T-Shirt',
        price: 999.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
      },
      {
        id: 'item-2',
        product_id: 'product-2',
        productId: 'product-2',
        name: 'Designer Jeans',
        price: 1499.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
      }
    ],
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipcode: '400001',
      country: 'India',
      id: 'address-1',
      user_id: 'user-1'
    },
    shipping_address: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipcode: '400001',
      country: 'India'
    },
    paymentMethod: 'credit_card',
    payment_method: 'credit_card',
    deliveryFee: 99.99,
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
      
      const newOrderId = `order-${Date.now()}`;
      const newOrder: Order = {
        id: newOrderId,
        userId: orderData.userId || orderData.user_id || 'anonymous',
        user_id: orderData.userId || orderData.user_id || 'anonymous',
        userEmail: orderData.userEmail || orderData.user_email || '',
        user_email: orderData.userEmail || orderData.user_email || '',
        orderNumber: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        order_number: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'processing',
        total: orderData.total || 0,
        items: orderData.items || [],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        shippingAddress: orderData.shippingAddress,
        shipping_address: orderData.shippingAddress || orderData.shipping_address,
        paymentMethod: orderData.paymentMethod || orderData.payment_method || 'cod',
        payment_method: orderData.paymentMethod || orderData.payment_method || 'cod',
        deliveryFee: orderData.deliveryFee || orderData.delivery_fee || 0,
        delivery_fee: orderData.deliveryFee || orderData.delivery_fee || 0
      };
      
      mockOrders[newOrderId] = newOrder;

      if (newOrder.userId) {
        await sendNotification({
          userId: newOrder.userId,
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
      return Object.values(mockOrders).filter(order => order.userId === userId || order.user_id === userId);
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
      
      order.status = status as any;
      order.updatedAt = new Date().toISOString();
      order.updated_at = new Date().toISOString();
      
      if (order.userId) {
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
          userId: order.userId,
          orderId: orderId,
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
      order.updatedAt = new Date().toISOString();
      order.updated_at = new Date().toISOString();
      order.cancellationReason = reason;
      order.cancellation_reason = reason;

      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
}

export const orderMicroservice = new OrderMicroservice();
