
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container-custom mt-10">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-2">
            <ArrowLeft size={20} className="text-blue-600 hover:text-blue-800" />
          </Link>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            <p>Last Updated: April 27, 2025</p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Introduction</h2>
            <p>
              B3F Prints & Men's Wear ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website and use our services.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Information We Collect</h2>
            <p>We may collect information about you in a variety of ways including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Data:</strong> Name, email address, phone number, billing address, shipping address,
                payment information, and other details you provide when ordering products, creating an account,
                or contacting us.
              </li>
              <li>
                <strong>Order Information:</strong> Details about the products you purchase, order history,
                and preferences.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our website, including your browsing 
                history, search queries, and interaction with our features.
              </li>
              <li>
                <strong>Device Information:</strong> Information about your device, including IP address, browser type,
                operating system, and device identifiers.
              </li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-4">How We Use Your Information</h2>
            <p>We may use your information for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To manage your account and provide customer support</li>
              <li>To communicate with you about your orders, account, or our services</li>
              <li>To personalize your experience and improve our services</li>
              <li>To analyze usage trends and optimize our website performance</li>
              <li>To detect, prevent, and address technical issues or fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission
              over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Third-Party Disclosure</h2>
            <p>
              We may share your information with third parties only in the ways described in this Privacy Policy,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who help us operate our business</li>
              <li>Payment processors to complete transactions</li>
              <li>Shipping partners to deliver your orders</li>
              <li>When required by law or to protect our legal rights</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to correct or update your personal information</li>
              <li>The right to delete your personal information</li>
              <li>The right to object to or restrict processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> b3fprintingsolutions@gmail.com<br />
              <strong>Phone:</strong> 7672080881
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
