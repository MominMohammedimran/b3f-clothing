
import React, { useState } from 'react';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOutAdmin } from '../../utils/adminAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      toast.success("Signed out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  // Get admin user data from Supabase
  const [adminUser, setAdminUser] = useState({ name: 'Admin User', email: 'admin@example.com' });
  
  React.useEffect(() => {
    const getAdminUserData = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setAdminUser({
            name: data.user.user_metadata?.name || 'Admin User',
            email: data.user.email || 'admin@example.com'
          });
        }
      } catch (error) {
        console.error('Error getting admin user data:', error);
      }
    };
    
    getAdminUserData();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {title || 'Admin Dashboard'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1.5 rounded-full hover:bg-gray-100" aria-label="Notifications">
            <Bell size={20} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1.5">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {adminUser.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
