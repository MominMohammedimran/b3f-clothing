
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { signOutAdmin } from '@/utils/adminAuth';

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Customers', path: '/admin/customers' }
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/admin/dashboard" className="text-xl font-bold">
            Admin Portal
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Admin dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors flex items-center">
                <span>Admin</span>
                <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-800">
            <div className="flex flex-col space-y-2 pb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              <Link to="/admin/profile" className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors">
                Profile
              </Link>
              
              <Link to="/admin/settings" className="px-3 py-2 rounded-md hover:bg-blue-800 transition-colors">
                Settings
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md hover:bg-blue-800 transition-colors text-left"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
