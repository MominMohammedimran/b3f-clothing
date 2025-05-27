
import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize admin setup on application startup
 */
export const initializeAdminSetup = async () => {
  try {
   
    // Check if Supabase is available
    if (!supabase) {
      return;
    }
    
    // Check if admin table exists by performing a safe query
    try {
      const { error: tableError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1)
        .maybeSingle();
      
      // If no error, table exists
    
    } catch (error) {
      console.log('Error checking admin table:', error);
    }
    
    console.log('Admin setup complete');
  } catch (error) {
    console.error('Error during admin setup:', error);
  }
};

/**
 * Create default admin user if none exists
 */
export const createDefaultAdminIfNeeded = async () => {
  try {
    // Skip if Supabase is not available
    if (!supabase) return;
    
    // Check if admin exists
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
    
    // If no admins exist, create a default one
    if (!error && (!data || data.length === 0)) {
      console.log('No admin users found, creating default admin');
      
      // Create an admin user account via auth
      const { data: userData, error: authError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'Admin@123',
      });
      
      if (authError) {
        console.error('Error creating admin user:', authError);
        return;
      }
      
      // Add to admin_users table
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userData?.user?.id,
          email: 'admin@example.com',
          role: 'admin',
          permissions: ['read', 'write', 'update', 'delete'],
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating admin record:', insertError);
      } else {
        console.log('Default admin created successfully');
      }
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

/**
 * Ensure the specified admin exists in the database
 */
export const ensureAdminExists = async () => {
  try {
    // Check if Supabase is not available
    if (!supabase) return false;
    
    // Check if the specific admin exists by email
    const adminEmail = 'b3fprintingsolutions@gmail.com';
    
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking specific admin:', checkError);
      return false;
    }
    
    // If admin exists, return true
    if (existingAdmin) {
     
      return true;
    }
    
    // Create the admin record if it doesn't exist
    console.log('Creating specific admin user...');
    
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ 
        email: adminEmail,
        role: 'admin',
        permissions: ['read', 'write', 'update', 'delete'],
        created_at: new Date().toISOString()
      });
      
    if (adminError) {
      console.error('Error creating specific admin record:', adminError);
      return false;
    }
    
    console.log('Specific admin user created successfully');
    return true;
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
    return false;
  }
};
