
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { isAdminAuthenticated } from '@/utils/adminAuth';
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
        
        // First check for current user
        if (!currentUser) {
          console.log('No current user, redirecting to admin login');
          navigate('/admin/login');
          return;
        }
        
        console.log('Checking admin status for user:', currentUser.email);
        
        // Check if user is an admin in database
        const isAdmin = await isAdminAuthenticated();
        
        // If not admin, redirect to login
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
    
    // Add small delay to ensure we have latest auth state
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
  
  // Only render children if user is an admin
  return isAdmin ? <>{children}</> : null;
};

export default AdminAuthGuard;
