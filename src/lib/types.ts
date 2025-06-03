
export interface Order {
  id: string;
  orderNumber: string;
  order_number: string;
  userId: string;
  user_id: string;
  userEmail?: string;
  user_email?: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'pending';
  paymentMethod: string;
  payment_method: string;
  shippingAddress: any;
  shipping_address: any;
  deliveryFee?: number;
  delivery_fee?: number;
  createdAt: string;
  created_at: string;
  updatedAt?: string;
  updated_at?: string;
  date: string;
  cancellationReason?: string;
  cancellation_reason?: string;
  payment_details?: any;
}

export interface TrackingInfo {
  status: string;
  date: string;
  time: string;
  location: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  productId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  metadata?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_number?: string;
  avatar_url?: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
  reward_points?: number;
  auth_user?: {
    email: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Product {
  id: string;
  productId?: string;
  code: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  images?: string[];
  additionalImages?: string[];
  rating?: number;
  category: string;
  tags?: string[];
  stock: number;
  sizes?: string[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  size: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
