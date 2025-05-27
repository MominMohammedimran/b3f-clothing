
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
              when you visit our website and use our services, including authentication services such as Google Sign-In.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Information We Collect</h2>
            <p>We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Data:</strong> Name, email address, phone number, billing/shipping address, 
                and other identifiers provided during checkout, registration, or via Google OAuth login.
              </li>
              <li>
                <strong>Google Account Information:</strong> If you use Google Sign-In, we may receive your 
                basic profile information (name, email, profile picture) as permitted by your Google account settings.
              </li>
              <li>
                <strong>Order Information:</strong> Product details, purchase history, and preferences.
              </li>
              <li>
                <strong>Usage Data:</strong> Browsing behavior, device information, IP address, and interactions with our services.
              </li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">Use of Google User Data</h2>
            <p>
              If you choose to sign in with Google, we will access and use your Google profile information only 
              to facilitate authentication and provide a personalized experience. We do not share your Google data 
              with third parties except as necessary to operate our services or comply with legal obligations.
            </p>
            <p>
              We comply with Google API Services User Data Policy, including the Limited Use requirements. Your data 
              will not be used for advertising or transferred to third parties outside of allowed use cases.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">How We Use Your Information</h2>
            <p>We may use your information for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To authenticate your identity (e.g., via Google Sign-In)</li>
              <li>To process and fulfill your orders</li>
              <li>To manage your account and provide customer support</li>
              <li>To improve our website, products, and services</li>
              <li>To comply with legal obligations and protect our platform</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational safeguards to protect your data. 
              However, no system is completely secure. We encourage you to use strong passwords and log 
              out after each session.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Third-Party Services</h2>
            <p>
              We may use third-party services, such as Supabase for database management and Google Cloud 
              services for authentication or storage. These providers are contractually bound to protect your data 
              and use it only as necessary to support our services.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Your Rights</h2>
            <p>
              Depending on your location and applicable laws, you may have the right to access, modify, or delete 
              your personal data, or object to certain uses of it.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and update your personal data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Contact us to exercise your rights</li>
            </ul>

            <h2 className="text-xl font-bold mt-6 mb-4">Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 13. We do not knowingly collect 
              personal data from children. If we learn that we have inadvertently collected such data, 
              we will take steps to delete it.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              through our website or via email.
            </p>

            <h2 className="text-xl font-bold mt-6 mb-4">Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or the use of your data,
              please contact us:
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
