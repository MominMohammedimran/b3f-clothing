
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  reward_points?: number;
}

interface ProfileEditModalProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  open,
  onOpenChange,
  onProfileUpdated
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    reward_points: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        reward_points: profile.reward_points || 0
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const rewardPoints = parseInt(formData.reward_points.toString()) || 0;
      
      console.log('Updating profile with ID:', profile.id);
      console.log('New reward points value:', rewardPoints);

      // Update the profile directly using Supabase client
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          phone_number: formData.phone_number || null,
          reward_points: rewardPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)
        .select('*');

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile update successful:', data);

      // Verify the update by fetching the profile again
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('reward_points')
        .eq('id', profile.id)
        .single();

      if (verifyError) {
        console.error('Verification error:', verifyError);
      } else {
        console.log('Verified reward points in database:', verifyData.reward_points);
      }

      toast.success('Profile updated successfully');
      onProfileUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="reward_points">Reward Points</Label>
            <Input
              id="reward_points"
              type="number"
              min="0"
              step="1"
              value={formData.reward_points}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                reward_points: parseInt(e.target.value) || 0 
              }))}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
