import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import UserOrderHistory from '@/components/admin/users/UserOrderHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define an explicit type for profile data
interface UserProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  [key: string]: any; // Allow for additional properties
}

const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    // Create a safe profile data object with fallbacks
    return {
      id: data?.id || userId,
      first_name: data?.first_name || null,
      last_name: data?.last_name || null,
      email: data?.email || null
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

const AdminUserOrderHistory = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId || ''),
    enabled: !!userId,
    staleTime: 60000 // 1 minute
  });
  
  const getUserDisplayName = () => {
    if (!userProfile) return 'User';
    
    if (userProfile.first_name || userProfile.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    }
    
    return userProfile.email || 'User';
  };
  
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-4" 
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <h1 className="text-2xl font-bold">Order History: {getUserDisplayName()}</h1>
        </div>
        
        {userId && <UserOrderHistory userId={userId} />}
      </div>
    </AdminLayout>
  );
};

export default AdminUserOrderHistory;
