
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import { UserProfile } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Pencil, Trash2, RefreshCw } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<UserProfile | null>(null);
  const [editCustomer, setEditCustomer] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<UserProfile | null>(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
    // Get profiles from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching customer profiles:', error);
        throw error;
      }
      
      // If we have data, map it to match the UserProfile type
      if (data && data.length > 0) {
        const mappedCustomers: UserProfile[] = data.map(profile => ({
          id: profile.id,
          user_id: profile.id, // Using id as user_id since it's required in the type
          email: profile.email,
          first_name: profile.first_name || undefined,
          last_name: profile.last_name || undefined,
          phone: profile.phone_number || undefined,
          avatar_url: profile.avatar_url || undefined,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          display_name: profile.display_name || undefined,
          phone_number: profile.phone_number || undefined,
          reward_points: profile.reward_points || 0
        }));
        
        setCustomers(mappedCustomers);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer: UserProfile) => {
    setViewCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer: UserProfile) => {
    setEditCustomer(customer);
    setEditForm({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone_number: customer.phone_number || '',
      display_name: customer.display_name || '',
      reward_points: customer.reward_points || 0
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: UserProfile) => {
    setCustomerToDelete(customer);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerToDelete.id);
        
      if (error) throw error;
      
      toast.success('Customer profile deleted successfully');
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      setIsConfirmDeleteOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer profile');
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'reward_points' ? Number(value) : value
    });
  };

  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          display_name: editForm.display_name,
          phone_number: editForm.phone_number,
          reward_points: editForm.reward_points,
          updated_at: new Date().toISOString()
        })
        .eq('id', editCustomer.id);
        
      if (error) throw error;
      
      // Update the customer in local state
      setCustomers(customers.map(c => 
        c.id === editCustomer.id 
          ? { ...c, ...editForm, updated_at: new Date().toISOString() } 
          : c
      ));
      
      toast.success('Customer profile updated successfully');
      setIsEditModalOpen(false);
      setEditCustomer(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer profile');
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6 pt-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customers</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchCustomers}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <Table>
          <TableCaption>List of all customers</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Reward Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        {customer.first_name ? customer.first_name[0] : (customer.email ? customer.email[0].toUpperCase() : 'U')}
                      </div>
                      <span className="font-medium">
                        {customer.display_name || (customer.first_name && customer.last_name ? 
                          `${customer.first_name} ${customer.last_name}` : 
                          'User')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.created_at ? formatDate(customer.created_at) : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      {customer.reward_points || 0} points
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                        <Pencil size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCustomer(customer)}>
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Customer Modal */}
      {viewCustomer && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl">
                  {viewCustomer.first_name ? viewCustomer.first_name[0] : (viewCustomer.email ? viewCustomer.email[0].toUpperCase() : 'U')}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {viewCustomer.display_name || (viewCustomer.first_name && viewCustomer.last_name ? 
                      `${viewCustomer.first_name} ${viewCustomer.last_name}` : 
                      'User')}
                  </h3>
                  <p className="text-gray-600">{viewCustomer.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">First Name</p>
                  <p>{viewCustomer.first_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Name</p>
                  <p>{viewCustomer.last_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{viewCustomer.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reward Points</p>
                  <p>{viewCustomer.reward_points || 0} points</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined</p>
                  <p>{formatDate(viewCustomer.created_at || '')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p>{viewCustomer.updated_at ? formatDate(viewCustomer.updated_at) : 'Never'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button className="w-full" variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Customer Modal */}
      {editCustomer && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  value={editForm.display_name}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={editForm.phone_number}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="reward_points">Reward Points</Label>
                <Input
                  id="reward_points"
                  name="reward_points"
                  type="number"
                  value={editForm.reward_points}
                  onChange={handleEditFormChange}
                  min="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Confirm Delete Modal */}
      {customerToDelete && (
        <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this customer profile?</p>
              <p className="font-medium mt-2">
                {customerToDelete.display_name || `${customerToDelete.first_name || ''} ${customerToDelete.last_name || ''}`.trim() || customerToDelete.email}
              </p>
              <p className="text-sm text-gray-500 mt-1">{customerToDelete.email}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteCustomer}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;
