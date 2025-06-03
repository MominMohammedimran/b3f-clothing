
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/lib/types';

export const fetchAdminUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }

    return (data || []).map((user: any): UserProfile => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
      phone_number: user.phone_number,
    }));
  } catch (error) {
    console.error('Error in fetchAdminUsers:', error);
    throw error;
  }
};

export const fetchUserAccounts = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user accounts:', error);
      throw error;
    }

    return (data || []).map((user: any): UserProfile => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
      phone_number: user.phone_number,
    }));
  } catch (error) {
    console.error('Error in fetchUserAccounts:', error);
    throw error;
  }
};
