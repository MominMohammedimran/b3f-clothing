
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const AdminNavbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    window.location.href = '/admin/login';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="lg:hidden w-8"></div> {/* Spacer for mobile menu button */}
            <Link to="/admin" className="text-xl font-bold text-gray-900">
              B3F Admin Panel
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              target="_blank"
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
            >
              View Site
            </Link>
            
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700 hidden sm:block">Admin</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;