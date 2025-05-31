
// If this file exists, add these interfaces, otherwise create the file
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  status: string;
  items: CartItem[];
  payment_method: string;
  delivery_fee: number;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at?: string;
  date?: string;
  orderNumber?: string; // For backward compatibility
  paymentMethod?: string; // For backward compatibility
  deliveryFee?: number; // For backward compatibility
  shippingAddress?: ShippingAddress; // For backward compatibility
  cancellation_reason?: string; // Added for AdminOrderView
  user_email?: string; // Added for display purposes in admin views
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  view?: string;
  backImage?: string;
  color?: string;
  options?: Record<string, any>;
}

export interface ShippingAddress {
  name?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  addressLine1?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  id?: string; // Added to handle id references
  user_id?: string; // Added for association with users
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  phone?: string;
  phone_number?: string; // For backward compatibility
  address?: ShippingAddress;
  user_id?: string;
  auth_user?: {
    email: string;
    id: string;
  };
  reward_points?: number; // Added for AdminCustomers
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  original_price: number;
  originalPrice?: number; // Support for camelCase
  discount_percentage?: number;
  discountPercentage?: number; // Support for camelCase
  image?: string;
  images?: string[];
  additionalImages?: string[]; // For compatibility with components
  additionalImageFiles?: File[]; // For file uploads in admin forms
  rating?: number;
  category: string;
  tags?: string[];
  sizes?: string[];
  stock?: number;
  created_at?: string;
  updated_at?: string;
  productId?: string; // For compatibility with some components that use productId instead of id
}

export interface TrackingInfo {
  id: string;
  order_id: string;
  status: string;
  location?: string;
  timestamp: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  date?: string;
  time?: string;
  orderId?: string; // For backward compatibility
  history?: TrackingHistoryItem[];
}

export interface TrackingHistoryItem {
  status: string;
  timestamp: string;
  location: string;
  description?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  permissions?: string[];
}

// Updated Location interface with optional fields for backward compatibility
export interface Location {
  id: string;
  name: string;
  address?: string; // Made optional
  city?: string; // Made optional
  state?: string; // Made optional
  country?: string; // Made optional
  postalCode?: string; // Made optional
  latitude?: number;
  longitude?: number;
  isPrimary?: boolean;
  code: string; // Code is required
}

// Updated Category interface with icon and slug properties
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string; // Added icon property
  count?: number;
}

// Add Review interface that was missing
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  userId?: string; // For backward compatibility
  userName?: string;
  text?: string; // For backward compatibility
  date?: string;
  helpful?: number;
}
