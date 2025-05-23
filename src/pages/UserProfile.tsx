
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, cleanupAuthState } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import UserProfileInfo from '../components/profile/UserProfileInfo';
import { useCart } from '@/context/CartContext';
import { User } from '@supabase/supabase-js';

const UserProfile = () => {
  const { currentUser, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  
  const { clearCart } = useCart();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    fetchUserProfile();
  }, [currentUser, navigate]);
  
  const fetchUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        // Create default profile data if none exists
        setProfile(createDefaultProfile(currentUser));
      } else {
        setProfile(data || createDefaultProfile(currentUser));
      }
    } catch (error) {
      // Create default profile on error
      setProfile(createDefaultProfile(currentUser));
    }
  };
  
  // Create default profile data with user email
  const createDefaultProfile = (user: User) => {
    return {
      id: user.id,
      email: user.email,
      first_name: '',
      last_name: '',
      display_name: user.email?.split('@')[0] || 'User',
      avatar_url: null,
      phone_number: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reward_points: 0
    };
  };
  
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      
      // Clean auth state first
      cleanupAuthState();
      
      // Clear cart in Supabase
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
          // Continue with sign out even if cart clearing fails
        }
      }
      
      // Clear client-side cart
      clearCart();
      
      // Sign out from auth with global scope
      await supabase.auth.signOut({ scope: 'global' });
      
      // Navigate after signOut is called
      toast.success({ title: 'Signed out successfully' });
      
      // Force a full page refresh to ensure clean state
      window.location.href = '/signin';
    } catch (error) {
      toast.error({ title: 'Failed to sign out' });
      
      // Force clean state anyway on error
      cleanupAuthState();
      window.location.href = '/signin';
    } finally {
      setSigningOut(false);
    }
  };
  
  // If no profile yet, create a default one
  if (!profile && currentUser) {
    const defaultProfile = createDefaultProfile(currentUser);
    return (
      <Layout>
        <div className="container-custom py-8 mt-10">
          <UserProfileHeader 
            name={defaultProfile.display_name}
            email={defaultProfile.email}
            createdAt={defaultProfile.created_at}
            onEdit={() => {}}
            onSignOut={handleSignOut}
            signingOut={signingOut}
          />
          
          <div className="mt-6">
            <UserProfileInfo profile={defaultProfile} />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container-custom py-8 mt-10">
        {currentUser ? (
          <>
            <UserProfileHeader 
              name={profile?.display_name || profile?.first_name}
              email={profile?.email}
              createdAt={profile?.created_at}
              onEdit={() => {}}
              onSignOut={handleSignOut}
              signingOut={signingOut}
            />
            
            <div className="mt-6">
              <UserProfileInfo profile={profile || createDefaultProfile(currentUser as User)} />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Please sign in to view your profile</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;
