import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/lib/types";

/**
 * Fetch all user accounts from the database
 */
export const fetchUserAccounts = async (): Promise<UserProfile[]> => {
  try {
    // First attempt to get users with profile data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*, user_id')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    // Format the user data with safe fallbacks
    const users = (profiles || []).map((profile: any) => {
      return {
        id: profile.id || '',
        email: profile.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
        avatar_url: profile.avatar_url || '',
        created_at: profile.created_at || new Date().toISOString(),
        phone_number: profile.phone_number || '',
        user_id: profile.user_id || profile.id || '',
      };
    });
    
    // If no users found, try another method or return empty array
    if (users.length === 0) {
     // Note: This might not work due to permissions, but leaving as fallback
      return [];
    }
    
    return users;
  } catch (error) {
    console.error('Failed to load user accounts:', error);
    // Return empty array as fallback
    return [];
  }
};

/**
 * Admin utility functions for products
 */
export const fetchAdminProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Define a type for order data
interface OrderData {
  id: string;
  user_id: string;
  order_number?: string;
  status: string;
  total: number;
  items: any;
  created_at: string;
  updated_at?: string;
  payment_method?: string;
  shipping_address?: any;
  delivery_fee?: number;
  user_email?: string;
  [key: string]: any;
}

/**
 * Admin utility functions for orders
 */
export const fetchAdminOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, user_id')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Format the orders with user information, use type assertion for safety
    const formattedOrders = (data || []).map((order: any) => {
      const typedOrder = order as OrderData;
      return {
        ...typedOrder,
        // Use safe defaults if needed
        user_email: typedOrder.user_email || 'customer@example.com'
      };
    });
    
    return formattedOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const fetchUserProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
