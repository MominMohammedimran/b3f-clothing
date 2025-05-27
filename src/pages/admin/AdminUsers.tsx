
import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { fetchUserAccounts } from '@/utils/adminUtils';
import { Loader2, RefreshCw } from 'lucide-react';
import UserAccountsTable from '@/components/admin/users/UserAccountsTable';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '@/lib/types';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const { 
    data: usersData = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchUserAccounts,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });

  // Cast the fetched data to the required UserProfile type
  const users = usersData as unknown as UserProfile[];

  const handleRefresh = () => {
    refetch();
    toast.success('Refreshing user data');
  };

  const handleViewOrderHistory = (userId: string) => {
    setSelectedUserId(userId);
    navigate(`/admin/users/${userId}/orders`);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading user accounts...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading user accounts.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Accounts</h1>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <UserAccountsTable 
          users={users} 
          onViewOrderHistory={handleViewOrderHistory}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
