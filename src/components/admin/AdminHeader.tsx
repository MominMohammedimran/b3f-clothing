
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Bell, User } from 'lucide-react';
import { toast } from 'sonner';
import { signOutAdmin } from '@/utils/adminAuth';

interface AdminHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

const AdminHeader = ({ title, onMenuClick }: AdminHeaderProps) => {
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Title */}
          <div>
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
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
          
          {/* Mobile logout */}
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
