
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsConditions = () => {
  return (
    <Layout>
      <div className="container-custom mt-10">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-2">
            <ArrowLeft size={20} className="text-blue-600 hover:text-blue-800" />
          </Link>
          <h1 className="text-2xl font-bold">Terms and Conditions</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            <p>Last Updated: April 27, 2025</p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Introduction</h2>
            <p>
              These Terms and Conditions ("Terms") govern your use of the B3F Prints & Men's Wear website
              and the purchase of products offered by B3F Prints & Men's Wear ("we," "our," or "us").
              By accessing our website or placing an order, you agree to be bound by these Terms.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Account Registration</h2>
            <p>
              To make purchases or access certain features, you may need to create an account. You are responsible
              for maintaining the confidentiality of your account credentials and for all activities that occur
              under your account. You must provide accurate and complete information during the registration
              process and keep your account information updated.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Products and Pricing</h2>
            <p>
              We strive to display accurate product information and pricing on our website. However, we do not
              warrant that product descriptions or prices are accurate, complete, reliable, or error-free. We
              reserve the right to correct any errors, inaccuracies, or omissions and to change or update
              information at any time without prior notice.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Orders and Payments</h2>
            <p>
              When you place an order, you make an offer to purchase the products you have selected. We reserve
              the right to accept or decline your order at our discretion. We accept various payment methods as
              indicated on our website. All payments must be made in full before we process your order.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Shipping and Delivery</h2>
            <p>
              We will make reasonable efforts to deliver your products within the estimated timeframe. However,
              delivery times are not guaranteed, and delays may occur due to factors beyond our control. Risk of
              loss and title for items purchased pass to you upon delivery of the items to the shipping carrier.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Returns and Refunds</h2>
            <p>
              Please refer to our separate Cancellation and Refund Policy for details on returns, exchanges,
              and refunds.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Intellectual Property</h2>
            <p>
              All content on our website, including text, graphics, logos, images, product designs, and software,
              is our property or the property of our licensors and is protected by copyright, trademark, and other
              intellectual property laws. You may not use, reproduce, distribute, or create derivative works from
              our content without our express written permission.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">User-Generated Content</h2>
            <p>
              If you submit designs, feedback, reviews, or other content to our website, you grant us a non-exclusive,
              royalty-free, perpetual, irrevocable right to use, reproduce, modify, adapt, publish, translate,
              create derivative works from, distribute, and display such content worldwide.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly
              or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your
              use of our website or purchase of our products.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. The updated version will be effective as of the date
              stated at the top of this page. We encourage you to review these Terms periodically to stay informed
              about our policies.
            </p>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at:
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

export default TermsConditions;
