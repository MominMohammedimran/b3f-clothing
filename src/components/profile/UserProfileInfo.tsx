
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import ProfileSettings from '../../components/account/ProfileSettings';
import OrdersHistory from '../../components/account/OrdersHistory';
import AddressSettings from '../../components/account/AddressSettings';
import AppSettings from '../../components/account/AppSettings';
import RewardPoints from '../../components/account/RewardPoints';
import ChangePasswordForm from './ChangePasswordForm';

interface UserProfileInfoProps {
  profile: any;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    phoneNumber: profile?.phone_number || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
   const [activeTab, setActiveTab] = useState("settings");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='pb-8'>
              <TabsList
  className="grid grid-cols-3 gap-2 w-full sm:w-[90%] md:w-[70%] mx-auto mb-8 bg-gray-100 rounded-xl p-1 shadow-sm"
>
   <TabsTrigger
    value="profile"
    className="text-sm sm:text-base py-1 px-4 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
  >
    👤 Profile
  </TabsTrigger>
  <TabsTrigger
    value="rewards"
    className="text-sm  sm:text-base py-1 px-4 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
  >
    🎁 Rewards
  </TabsTrigger>
 
  <TabsTrigger
    value="security"
    className="text-sm sm:text-base py-2 px-4 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600"
  >
    🔐 Security
  </TabsTrigger>
</TabsList>

           
                <TabsContent value="rewards">
                <RewardPoints />
              </TabsContent>
              <TabsContent value="profile">
                <ProfileSettings />
              </TabsContent>
              <TabsContent value="security">
                <ChangePasswordForm />
              </TabsContent>
            </Tabs>
  );
};

export default UserProfileInfo;
