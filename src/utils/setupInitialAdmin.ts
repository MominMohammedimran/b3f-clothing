
import { supabase } from '@/integrations/supabase/client';
import { ADMIN_USERS } from '@/lib/admin-credentials';
import { toast } from 'sonner';

export const setupInitialAdmin = async () => {
  try {
   // Check if admin user already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', ADMIN_USERS[0].email)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking admin user:', checkError);
      toast.error('Failed to check if admin exists');
      return;
    }
    
    // Admin already exists, no need to create
    if (existingAdmin) {
     return;
    }
    
   
    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ADMIN_USERS[0].email,
      password: ADMIN_USERS[0].password,
      options: {
        data: {
          is_admin: true
        }
      }
    });
    
    if (authError) {
      console.error('Error creating admin auth user:', authError);
      toast.error('Failed to create admin account');
      return;
    }
    
   
    // Create admin record
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ 
        user_id: authData.user?.id,
        email: ADMIN_USERS[0].email,
        first_name: ADMIN_USERS[0].firstName,
        last_name: ADMIN_USERS[0].lastName,
        role: ADMIN_USERS[0].role,
        permissions: ["read", "write", "update", "delete"]
      });
      
    if (adminError) {
      console.error('Error creating admin record:', adminError);
      toast.error('Failed to create admin record');
      return;
    }
    
    toast.success('Admin user created successfully');
  } catch (error) {
    console.error('Error in setupInitialAdmin:', error);
    toast.error('An unexpected error occurred while setting up admin');
  }
};

// Function to ensure the specified admin exists in the database
export const ensureAdminExists = async () => {
  try {
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
    
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({ 
        email: adminEmail,
        role: 'admin',
        permissions: ["read", "write", "update", "delete"],
        created_at: new Date().toISOString()
      });
      
    if (adminError) {
      console.error('Error creating specific admin record:', adminError);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
    return false;
  }
};
