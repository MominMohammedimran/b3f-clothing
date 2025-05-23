
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, Edit } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cleanupAuthState } from '@/context/AuthContext';

interface UserProfileHeaderProps {
  name?: string;
  email?: string;
  createdAt?: string;
  onEdit?: () => void;
  onSignOut?: () => Promise<void>;
  signingOut?: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  email,
  createdAt,
  onEdit,
  onSignOut, 
  signingOut = false 
}) => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [localSigningOut, setLocalSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    if (signingOut || localSigningOut) return; // Prevent multiple clicks
    
    setLocalSigningOut(true);
    
    if (onSignOut) {
      // Use provided onSignOut if available
      await onSignOut();
      return;
    }
    
    try {
      console.log('Signing out user...');
      
      // Clean up auth state
      cleanupAuthState();
      
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
      
      // First sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        throw error;
      }
      
      // Then call the context signOut function
      if (signOut) {
        await signOut();
      }
      
      toast.success('Signed out successfully');
      
      // Force full page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
      
      // Clean up state anyway as best effort
      cleanupAuthState();
      window.location.href = '/signin';
    } finally {
      setLocalSigningOut(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return 'N/A';
    }
  };
  const reroute=()=>{
  navigate(`/account`)
  }
  
  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">{name || 'User'}</h1>
            <p className="text-gray-600">{email || 'No email provided'}</p>
            <p className="text-sm text-gray-500">
              Member since {formatDate(createdAt || currentUser?.created_at)}
            </p>
          </div>
        </div>
        
        
      </div>
      <div className="flex space-x-5 w-full justify-center mt-6  md:w-auto">
          {onEdit && (
            <Button 
              variant="outline"
              onClick={reroute}
              className="flex items-center text-xl"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
          
          <Button 
            variant="destructive"
            onClick={handleSignOut}
            className="flex items-center text-xl"
            disabled={signingOut || localSigningOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {signingOut || localSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
    </div>
  );
};

export default UserProfileHeader;
