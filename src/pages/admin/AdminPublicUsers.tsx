
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import PublicUserTable from '@/components/admin/users/PublicUserTable';
import UserDetailsDialog from '@/components/admin/users/UserDetailsDialog';

// Interface that extends UserProfile with auth-specific fields
interface PublicUserWithAuth extends UserProfile {
  last_sign_in_at?: string;
  role?: string;
  user_metadata?: any;
}

const AdminPublicUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        setError(error.message);
      } else {
        // Transform auth users to UserProfile format
        const publicUsers: UserProfile[] = data.users.map(user => ({
          id: user.id,
          email: user.email || 'N/A',
          created_at: user.created_at,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          // Attach the auth data for reference
          auth_user: {
            id: user.id,
            email: user.email || 'N/A'
          }
        }));
        setUsers(publicUsers);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleViewOrderHistory = (userId: string) => {
    // Implement order history viewing functionality
    console.log("View order history for user:", userId);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">Public Users</h1>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            {/* <TabsTrigger value="roles">Roles</TabsTrigger> */}
          </TabsList>
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search className="h-5 w-5 text-gray-500" />
            </div>

            {loading ? (
              <div>Loading users...</div>
            ) : error ? (
              <div>Error: {error}</div>
            ) : (
              <PublicUserTable
                users={filteredUsers}
                onEditUser={handleViewDetails}
                onViewOrderHistory={handleViewOrderHistory}
              />
            )}
          </TabsContent>
        </Tabs>

        {selectedUser && (
          <UserDetailsDialog
            open={showUserDetails}
            onOpenChange={setShowUserDetails}
            user={selectedUser}
            onViewOrderHistory={handleViewOrderHistory}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPublicUsers;
