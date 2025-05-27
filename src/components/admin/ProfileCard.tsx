
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar_url?: string;
}

interface ProfileCardProps {
  profile: Profile;
  onView: () => void;
  onDelete: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onView, onDelete }) => {
  return (
    <Card key={profile.id} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${profile.first_name || 'User'}'s avatar`} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="ml-4">
            <h3 className="font-medium">
              {profile.first_name} {profile.last_name || ''}
              {!profile.first_name && !profile.last_name && 'Unnamed User'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" /> {profile.email || 'No email'}
            </p>
            {profile.phone_number && (
              <p className="text-sm text-gray-500 flex items-center">
                <Phone className="h-3 w-3 mr-1" /> {profile.phone_number}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={onView}
        >
          View Details
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default ProfileCard;
