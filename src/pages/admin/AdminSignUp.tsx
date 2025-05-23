
import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSignUpForm from '../../components/admin/AdminSignUpForm';

const AdminSignUp = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Registration</h1>
        <AdminSignUpForm />
      </div>
    </AdminLayout>
  );
};

export default AdminSignUp;
