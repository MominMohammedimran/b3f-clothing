
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const AdminNotFound = () => {
  const navigate = useNavigate();
  
  // Auto-redirect after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin/dashboard');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist. Redirecting you to the dashboard...</p>
        <Button onClick={() => navigate('/admin/dashboard')}>
          Return to Dashboard Now
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminNotFound;
