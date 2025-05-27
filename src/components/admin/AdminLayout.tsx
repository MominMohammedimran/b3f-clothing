
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { isAdminAuthenticated } from '@/utils/adminAuth';
import { Loader2, Home, ShoppingCart, Package, Users, Settings } from 'lucide-react';
import { Database } from "@/lib/database.types"; // adjust path to your actual types file

type OrderType = Database["public"]["Tables"]["orders"]["Row"];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  orderCount?: number;
}

const AdminLayout = ({ children, title,orderCount }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([]);

useEffect(() => {
  supabase.from("orders").select("*").then(({ data }) => {
    if (data) setOrders(data);
  });
}, []);

  useEffect(() => {
    if (title) {
      document.title = `${title} - B3F Prints Admin`;
    } else {
      document.title = 'B3F Prints Admin';
    }
  }, [title]);
  
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setCheckingAuth(true);
        
        if (!currentUser) {
          navigate('/admin/login');
          return;
        }
        
      
        
        const adminAuthorized = await isAdminAuthenticated();
        
        if (!adminAuthorized) {
          toast.error('You do not have admin privileges');
          navigate('/admin/login');
          return;
        }
        
       setIsAuthorized(true);
      } catch (error) {
        toast.error('Error verifying admin status');
        navigate('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    
    verifyAdmin();
  }, [currentUser, navigate]);

  const bottomNavItems = [
    { path: '/admin', icon: Home, label: 'Dashboard', isActive: location.pathname === '/admin' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', isActive: location.pathname === '/admin/orders' },
    { path: '/admin/products', icon: Package, label: 'Products', isActive: location.pathname === '/admin/products' },
    { path: '/admin/website-users', icon: Users, label: 'Website users', isActive: location.pathname === '/admin/website-users' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', isActive: location.pathname === '/admin/settings' },
  ];
  
  
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <AdminHeader 
            title={title} 
            onMenuClick={() => setSidebarOpen(true)}
             orderCount={orders.length||0}
            
          />
        </div>
        
        {/* Mobile Header */}
        {/* Mobile Header */}
         <div className="lg:hidden">
               <AdminHeader
                title={title} 
               onMenuClick={() => setSidebarOpen(true)}
               orderCount={orders.length||0}
                />
            </div>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around py-2">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    item.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
