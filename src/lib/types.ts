
export interface Product {
  id: string;
  productId?: string;
  code: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  images?: string[];
  additionalImages?: string[];
  rating?: number;
  category: string;
  tags?: string[];
  sizes?: string[];
  description?: string;
  stock?: number;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Order {
  id: string;
  userId?: string;
  user_id?: string;
  userEmail?: string;
  user_email?: string;
  orderNumber: string;
  order_number?: string;
  total: number;
  deliveryFee?: number;
  delivery_fee?: number;
  items: OrderItem[];
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending';
  date: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  shippingAddress?: ShippingAddress;
  shipping_address?: any;
  paymentMethod: string;
  payment_method?: string;
  paymentDetails?: any;
  payment_details?: any;
  cancellationReason?: string;
  cancellation_reason?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  metadata?: any;
}

export interface ShippingAddress {
  id?: string;
  user_id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country?: string;
  phone?: string;
}

export interface TrackingInfo {
  orderId: string;
  status: string;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  date: string;
  status: string;
  description: string;
  location?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

export interface Location {
  id: string;
  name: string;
  code: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  metadata?: any;
}

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  phone_number?: string;
  reward_points?: number;
  created_at: string;
  updated_at?: string;
  auth_user?: {
    email: string;
  };
}
