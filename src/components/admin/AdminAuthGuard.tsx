import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);

        if (!currentUser) {
          console.log('No current user, redirecting to admin login');
          navigate('/admin/login');
          return;
        }

        console.log('Checking admin status for user:', currentUser.email);

        // Correct usage: <ReturnType, ParamsType>
      const { data, error } = await supabase.rpc<boolean, { user_email: string }>(
  'is_admin',
  { user_email: currentUser.email || '' }
);



        if (error) {
          console.error('Error checking admin status:', error);
          throw error;
        }

        const isAdmin = !!data;

        if (!isAdmin) {
          console.log('User is not an admin, redirecting to admin login');
          toast.error('You do not have admin privileges');
          navigate('/admin/login');
          return;
        }

        console.log('Admin authentication successful');
        setIsAdmin(true);
      } catch (error) {
        console.error('Admin auth check error:', error);
        toast.error('Authentication error');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      checkAdminStatus();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Verifying admin access...</span>
          </div>
        </div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
};

export default AdminAuthGuard;
