import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000); // Redirect after 5 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Thank You!</h1>
        <p className="text-lg text-gray-700">
          We’ve received your message. Our team will get back to you within 3–5 business days.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          You’ll be redirected to the homepage shortly...
        </p>

        <Button
          className="mt-6"
          onClick={() => navigate('/')}
        >
          Go to Homepage Now
        </Button>
      </div>
    </Layout>
  );
};

export default ThankYou;
