
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  display_name?: string;
  reward_points?: number;
}

interface ProfileEditModalProps {
  profile: Profile;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ 
  profile, 
  onClose, 
  onSave
}) => {
  const [editedProfile, setEditedProfile] = useState<Profile>({...profile});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditedProfile({...editedProfile, [id]: value});
  };
  
  const handleSubmit = () => {
    onSave(editedProfile);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input 
              id="first_name"
              value={editedProfile.first_name || ''}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input 
              id="last_name"
              value={editedProfile.last_name || ''}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input 
              id="display_name"
              value={editedProfile.display_name || ''}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              value={editedProfile.email || ''}
              onChange={handleChange}
              disabled
            />
          </div>
          
          <div>
            <Label htmlFor="phone_number">Phone</Label>
            <Input 
              id="phone_number"
              value={editedProfile.phone_number || ''}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <Label htmlFor="reward_points">Reward Points</Label>
            <Input 
              id="reward_points"
              type="number"
              value={editedProfile.reward_points || 0}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
