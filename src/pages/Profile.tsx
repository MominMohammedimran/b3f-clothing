
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import ProfileSettings from '../components/account/ProfileSettings';
import RewardPoints from '../components/account/RewardPoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center mb-4 mt-4">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-2xl font-bold text-green-600">Back</h1>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        {currentUser ? (
          <div className="w-full">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
                <TabsTrigger value="rewards" className="text-sm">Rewards</TabsTrigger>
                <TabsTrigger value="security" className="text-sm">Security</TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="profile" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProfileSettings />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="rewards" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reward Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RewardPoints />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChangePasswordForm />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <p className="text-amber-800">Please sign in to view your profile information.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
