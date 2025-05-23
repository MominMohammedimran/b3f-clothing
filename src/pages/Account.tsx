
import { useState, useEffect } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import ProfileSettings from '../components/account/ProfileSettings';
import OrdersHistory from '../components/account/OrdersHistory';
import AddressSettings from '../components/account/AddressSettings';
import AppSettings from '../components/account/AppSettings';
import RewardPoints from '../components/account/RewardPoints';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/auth/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const handleSignOut = async () => {
    try {
      // Clear cart before sign out
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
          console.error('Error clearing cart during sign out:', error);
        }
      }
      
      // Clear client-side cart
      clearCart();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Call context signOut
      await signOut();
      
      // Navigate immediately
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="container-custom mt-10">
        
          <h1 className="text-3xl font-bold mb-8 text-center">My Account</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium mb-2">Please sign in to view your account</h2>
              <p className="text-gray-500 mb-6">Sign in to view your orders, addresses, and profile settings</p>
            </div>
            
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <AuthForm initialMode="signin" redirectTo="/account" />
              </TabsContent>
              
              <TabsContent value="signup">
                <AuthForm initialMode="signup" redirectTo="/account" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom pt-6 mt-10">
           <div className="flex items-center  mt-4 animate-fade-in">
                    <Link to="/profile" className="mr-4">
                      <ArrowLeft size={30} className="back-arrow" />
                    </Link>
                    <h1 className="text-3xl font-bold">Back</h1>
                  </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">My Account</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="mt-4 md:mt-0"
              >
                Sign Out
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-2 w-full mb-8">
                <TabsTrigger value="profile"className='text-xl'>Profile</TabsTrigger>
               
                <TabsTrigger value="addresses" className='text-xl'>Addresses</TabsTrigger>
                </TabsList>
              <TabsContent value="profile">
                <ProfileSettings />
              </TabsContent>
              <TabsContent value="addresses">
                <AddressSettings />
              </TabsContent>
              
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
