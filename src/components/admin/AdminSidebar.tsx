
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  MapPin,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { signOutAdmin } from '@/utils/adminAuth';
import { toast } from 'sonner';

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      toast.success('Successfully logged out');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <aside className="bg-white border-r min-h-screen w-64 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <Link
              to="/admin"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/products"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/products') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="mr-3 h-5 w-5" />
              <span>Products</span>
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/product-inventory"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/product-inventory') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <Package className="mr-3 h-5 w-5" />
              <span>Inventory</span>
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/orders"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/orders') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <Package className="mr-3 h-5 w-5" />
              <span>Orders</span>
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/users"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/users') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              <span>Admin Users</span>
            </Link>
          </li>

          <li>
            <Link
              to="/admin/public-users"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/public-users') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <User className="mr-3 h-5 w-5" />
              <span>Customers</span>
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/locations"
              className={`flex items-center p-2 rounded-lg ${
                isActive('/admin/locations') ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <MapPin className="mr-3 h-5 w-5" />
              <span>Locations</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <ul className="space-y-1">
          <li>
            <Link
              to="#"
              className="flex items-center p-2 rounded-lg hover:bg-gray-100"
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </Link>
          </li>
          
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 rounded-lg hover:bg-gray-100 text-left"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default AdminSidebar;
