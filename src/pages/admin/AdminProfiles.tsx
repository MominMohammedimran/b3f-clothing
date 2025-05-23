
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileCard from '@/components/admin/ProfileCard';
import ProfileEditModal from '@/components/admin/ProfileEditModal';
import ProfileSearchBar from '@/components/admin/ProfileSearchBar';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  display_name?: string;
  reward_points?: number;
  updated_at: string;
}

const AdminProfiles = () => {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Use React Query for better data fetching
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminProfiles'],
    queryFn: fetchProfiles,
    retry: 2,
    staleTime: 1000 * 60, // 1 minute
  });

  async function fetchProfiles(): Promise<Profile[]> {
    try {
      console.log('Fetching profiles from database...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      console.log('Profiles fetched:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log('No profiles found in database');
        return [];
      } else {
        console.log('Loaded profiles:', data.length);
        return data as Profile[];
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
      return [];
    }
  }

  const handleViewProfile = (profile: Profile) => {
    console.log('Viewing profile:', profile.email);
    setSelectedProfile(profile);
  };

  const handleCloseModal = () => {
    setSelectedProfile(null);
  };

  const handleSaveProfile = async (updatedProfile: Profile) => {
    try {
      console.log('Updating profile:', updatedProfile.id);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          phone_number: updatedProfile.phone_number,
          display_name: updatedProfile.display_name,
          reward_points: updatedProfile.reward_points,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedProfile.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Update the local profiles list
      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
      refetch();
      
      toast.success('Profile updated successfully');
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      console.log('Deleting profile:', profileId);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        console.error('Error deleting profile:', error);
        throw error;
      }
      
      // Remove from local profiles list
      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
      refetch();
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.first_name + ' ' + profile.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Profiles</h1>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => refetch()}>
            <Shield size={16} />
            <span>Refresh Profiles</span>
          </Button>
        </div>
        
        <ProfileSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading profiles. Please try refreshing the page.
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No profiles match your search.' : 'No profiles found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredProfiles.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onView={() => handleViewProfile(profile)}
                onDelete={() => handleDeleteProfile(profile.id)}
              />
            ))}
          </div>
        )}

        {selectedProfile && (
          <ProfileEditModal
            profile={selectedProfile}
            onClose={handleCloseModal}
            onSave={handleSaveProfile}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfiles;
