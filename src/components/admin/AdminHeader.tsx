import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Bell, User } from 'lucide-react';
import { toast } from 'sonner';
import { signOutAdmin } from '@/utils/adminAuth';

interface AdminHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  orderCount?: number;
}

const AdminHeader = ({ title, onMenuClick,orderCount }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };
  const Usersredirect=()=>{
    navigate('/admin/website-users')
  }
   const Orderredirect=()=>{
    navigate('/admin/orders')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
         {/* Hide menu icon on all screens */}
               {/* 
                    <Button
                     variant="ghost"
                     size="icon"
                     className="lg:hidden"
                     onClick={onMenuClick}
                     >
                  <Menu className="h-6 w-6" />
                  </Button> 
           */}
          {/* Title */}
          <div className='flex-1 text-center'>
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
              {title || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Manage your e-commerce operations
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
           onClick={Orderredirect}>
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {orderCount}
            </span>
          </Button>

          <Button
           variant="ghost"
           size="icon"
           onClick={Usersredirect}>
            <User className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="sm:hidden"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
