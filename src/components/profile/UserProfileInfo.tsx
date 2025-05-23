
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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-2 w-full mb-8">
               <TabsTrigger value="settings" className="  text-xl md:block">Settings</TabsTrigger>
               <TabsTrigger value="rewards" className=" text-xl md:block">Rewards</TabsTrigger>
                
              </TabsList>
           
            
              <TabsContent value="settings">
                <AppSettings />
              </TabsContent>
                <TabsContent value="rewards">
                <RewardPoints />
              </TabsContent>
            </Tabs>
  );
};

export default UserProfileInfo;
