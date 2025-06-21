import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from '@/lib/types';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
const AdminPublicUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminPublicUsers', searchTerm],
    queryFn: async () => {
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          created_at,
          first_name,
          last_name,
          phone,
          auth_user:id (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      const transformedUsers: UserProfile[] = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        auth_user: {
          id: user.auth_user?.id,
          email: user.auth_user?.email
        }
      }));

      return transformedUsers;
    }
  });

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <ModernAdminLayout title="Users">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
       </ModernAdminLayout>
    );
  }

  if (error) {
    return (
     <ModernAdminLayout title="Users">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading users.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
       </ModernAdminLayout>
    );
  }
  
  return (
    <ModernAdminLayout title="Users">
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'No name'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email || 'No email'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone || 'Not provided'}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
     </ModernAdminLayout>
  );
};

export default AdminPublicUsers;
