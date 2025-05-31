
import React from 'react';
import{Link} from 'react-router-dom'
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import {ArrowLeft } from 'lucide-react'

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
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl font-bold">
                  {currentUser.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentUser.email}</h2>
                <p className="text-gray-600">Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-2">Personal Information</h3>
              <p className="text-gray-700">Email: {currentUser.email}</p>
              <p className="text-gray-700">User ID: {currentUser.id}</p>
            </div>
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
