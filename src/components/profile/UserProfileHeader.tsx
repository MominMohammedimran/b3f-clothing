import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cleanupAuthState } from '@/context/AuthContext';

interface UserProfileHeaderProps {
  name?: string;
  email?: string;
  createdAt?: string;
  onSignOut?: () => Promise<void>;
  signingOut?: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  email,
  createdAt,
  onSignOut, 
  signingOut = false 
}) => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [localSigningOut, setLocalSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut || localSigningOut) return;
    setLocalSigningOut(true);

    if (onSignOut) {
      await onSignOut();
      return;
    }

    try {
      cleanupAuthState();
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      }

      clearCart();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      if (signOut) await signOut();

      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      cleanupAuthState();
      window.location.href = '/signin';
    } finally {
      setLocalSigningOut(false);
    }
  };

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

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
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

        <div className="mt-4 md:mt-0">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="flex items-center text-sm md:text-base"
            disabled={signingOut || localSigningOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {signingOut || localSigningOut ? 'Signing Out...' : 'Log Out'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
