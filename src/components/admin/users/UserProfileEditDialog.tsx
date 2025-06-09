
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface UserProfileEditDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: UserProfile) => void;
}

const UserProfileEditDialog: React.FC<UserProfileEditDialogProps> = ({ 
  user, 
  open, 
  onOpenChange,
  onSave
}) => {
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    ...user,
    address: user.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(userData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 text-lg">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="address">Address Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={userData.first_name || ''}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={userData.last_name || ''}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={userData.email || ''}
                  readOnly
                  className="col-span-3 bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={userData.phone || ''}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Created</Label>
                <span className="col-span-3 text-sm text-gray-500">
                  {formatDate(userData.created_at)}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="address" className="pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="street" className="text-right">Street</Label>
                <Input
                  id="street"
                  name="street"
                  value={userData.address?.street || ''}
                  onChange={handleAddressChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={userData.address?.city || ''}
                  onChange={handleAddressChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={userData.address?.state || ''}
                  onChange={handleAddressChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zipCode" className="text-right">Zip Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={userData.address?.zipCode || ''}
                  onChange={handleAddressChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={userData.address?.country || 'India'}
                  onChange={handleAddressChange}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileEditDialog;
