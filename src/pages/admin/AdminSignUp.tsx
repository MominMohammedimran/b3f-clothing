
import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSignUpForm from '../../components/admin/AdminSignUpForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminSignUp = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Registration</CardTitle>
            <CardDescription>
              Create a new admin account with custom permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSignUpForm />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSignUp;
