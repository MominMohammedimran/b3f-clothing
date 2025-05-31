
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/lib/types';
import { DEFAULT_ADMIN_PERMISSIONS } from '@/utils/adminAuth';

// Define a specific type for admin data records from the database
interface AdminRecord {
  id: string;
  email: string;
  role?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  permissions?: string[];
}

// Use concrete type definition instead of recursive type inference
interface AdminData {
  id: string;
  email: string;
  role?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  permissions?: string[];
}

const AdminLogin = () => {
  const { currentUser } = useAuth();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          // Use explicit typing to avoid deep instantiation
          const { data, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (adminError) {
            console.error('Error fetching admin data:', adminError);
            setAdmin(null);
          } else if (data) {
            // Explicitly cast to our concrete type
            const adminData = data as AdminData;
            
            // Create AdminUser from safe data with fallbacks
            setAdmin({
              id: adminData.id || '',
              email: adminData.email || '',
              role: adminData.role || 'admin',
              created_at: adminData.created_at || '',
              updated_at: adminData.updated_at || undefined,
              user_id: adminData.user_id || currentUser.id,
              permissions: adminData.permissions || []
            });
            
            // Redirect to admin dashboard if already logged in
            navigate('/admin/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
    };

    checkAdminStatus();
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Get user ID from authentication result
      const userId = data.user?.id;
      
      if (!userId) {
        throw new Error('Authentication successful but user ID is missing');
      }

      console.log("User authenticated, checking admin status");

      // Check if user's email is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError) {
        console.error("Admin check error:", adminError);
        
        // Special case for our specific admin
        if (email === 'b3fprintingsolutions@gmail.com') {
          // Create admin record if it doesn't exist
          const { error: createError } = await supabase
            .from('admin_users')
            .insert({ 
              email: email,
              user_id: userId,
              role: 'admin',
              created_at: new Date().toISOString(),
              permissions: DEFAULT_ADMIN_PERMISSIONS
            });
            
          if (createError) {
            console.error("Error creating admin record:", createError);
            setError('Error creating admin account.');
            toast.error('Error creating admin account.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          
          // Set admin state with the newly created record
          setAdmin({
            id: userId,
            email: email,
            role: 'admin',
            created_at: new Date().toISOString(),
            user_id: userId,
            permissions: DEFAULT_ADMIN_PERMISSIONS
          });
          
          toast.success('Admin login successful');
          navigate('/admin/dashboard');
          return;
        } else {
          // For other users who aren't recognized admins
          setError('You are not authorized as an admin.');
          toast.error('You are not authorized as an admin.');
          await supabase.auth.signOut(); // Sign out if not an admin
          setLoading(false);
          return;
        }
      }

      // Explicitly cast to our concrete type
      const adminRecord = adminData as AdminData;
      
      // Successfully found admin record
      console.log("Admin record found:", adminRecord);
      
      // Create the admin user object with fallbacks
      setAdmin({
        id: adminRecord.id || '',
        email: adminRecord.email || '',
        role: adminRecord.role || 'admin',
        created_at: adminRecord.created_at || '',
        updated_at: adminRecord.updated_at || undefined,
        user_id: adminRecord.user_id || userId,
        permissions: adminRecord.permissions || DEFAULT_ADMIN_PERMISSIONS
      });
      
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  if (admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">You are already logged in as admin.</h1>
          <Button onClick={() => navigate('/admin/dashboard')}>Go to Admin Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
