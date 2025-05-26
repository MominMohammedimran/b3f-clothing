
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  UserCheck,
  Settings
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/users', icon: Users, label: 'Admin Users' },
    { path: '/admin/website-users', icon: UserCheck, label: 'Website Users' },
  ];

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-lg lg:text-xl font-bold text-white">Admin Panel</h2>
        <p className="text-xs text-gray-300 mt-1">B3F Prints Management</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 lg:px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-3 lg:px-4 py-3 text-sm lg:text-base font-medium rounded-lg transition-colors group
                ${isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className={`h-5 w-5 lg:h-6 lg:w-6 mr-3 flex-shrink-0 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">System Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
