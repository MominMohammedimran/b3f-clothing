
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Edit, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  display_name?: string;
  avatar_url?: string;
  reward_points?: number;
  created_at: string;
  updated_at?: string;
}

const AdminWebsiteUsers = () => {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['websiteUsers'],
    queryFn: async () => {
      console.log('Fetching website users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Users fetched:', data);
      return data as UserProfile[];
    },
    staleTime: 60000
  });

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || user.phone_number || '',
      address: user.address || '',
      display_name: user.display_name || '',
      date_of_birth: user.date_of_birth || '',
      reward_points: user.reward_points || 0
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      console.log('Updating user:', editingUser.id, formData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          display_name: formData.display_name,
          date_of_birth: formData.date_of_birth,
          reward_points: formData.reward_points,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)
        .select();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      console.log('User updated successfully:', data);
      toast.success('User profile updated successfully');
      setShowEditDialog(false);
      setEditingUser(null);
      refetch();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const handleViewOrderHistory = (userId: string) => {
    // Navigate to user order history
    window.open(`/admin/users/${userId}/orders`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error loading users.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Website Users</h1>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Registered Users ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No registered users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Reward Points</th>
                  <th className="px-4 py-2 text-left">Joined</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : user.display_name || 'No name provided'
                          }
                        </div>
                        {user.address && (
                          <div className="text-sm text-gray-500 truncate max-w-32">
                            {user.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">{user.email || 'No email'}</td>
                    <td className="px-4 py-2">{user.phone || user.phone_number || 'Not provided'}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {user.reward_points || 0} pts
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrderHistory(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="rewardPoints">Reward Points</Label>
              <Input
                id="rewardPoints"
                type="number"
                value={formData.reward_points || 0}
                onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWebsiteUsers;
