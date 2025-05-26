
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { isAdminAuthenticated } from '@/utils/adminAuth';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setCheckingAuth(true);
        
        if (!currentUser) {
          console.log('No current user, redirecting to admin login');
          navigate('/admin/login');
          return;
        }
        
        console.log('Verifying admin status for user:', currentUser.email);
        
        const adminAuthorized = await isAdminAuthenticated();
        
        if (!adminAuthorized) {
          console.log('User is not an admin, redirecting to admin login');
          toast.error('You do not have admin privileges');
          navigate('/admin/login');
          return;
        }
        
        console.log('Admin authorization confirmed');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        toast.error('Error verifying admin status');
        navigate('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    verifyAdmin();
  }, [currentUser, navigate]);
  
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <AdminSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        <AdminHeader 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
