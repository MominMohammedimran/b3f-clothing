
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPayments from '@/components/admin/AdminPayments';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
const AdminPaymentsPage = () => {
  return (
    <AdminLayout>
      <AdminPayments />
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
