
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ADMIN_PERMISSIONS } from "./adminAuth";

export const initializeAdmin = async (userId: string, email: string): Promise<void> => {
  try {
    // Check if the admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingAdmin) {
      console.log('Admin already exists', existingAdmin);
      return;
    }
    
    // Create a new admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email,
        role: 'admin',
        permissions: DEFAULT_ADMIN_PERMISSIONS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('Admin created successfully', data);
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};
