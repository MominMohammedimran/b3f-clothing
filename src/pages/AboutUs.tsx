import React from 'react';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import{ArrowLeft} from 'lucide-react'
const AboutUs = () => {
  const seoData = useSEO({
    title: 'About Us - Premium Custom Printing Services',
    description: 'Learn about B3F Prints - your trusted partner for custom t-shirts, mugs, and promotional products with premium quality and fast delivery.',
    keywords: 'about us, custom printing company, premium quality printing, promotional products'
  });

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container-custom pt-2 pb-24 mt-10">
        <div className="flex items-center mb-4 mt-4">
                  <Link to="/" className="mr-2">
                    <ArrowLeft size={24} className="back-arrow" />
                  </Link>
                  <h1 className="text-2xl font-bold text-green-600">Back</h1>
                </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center ">About Us</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 pb-0">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="mb-1">
              Founded in 2023, our company was born out of a passion for creating custom apparel and 
              products that help individuals and businesses express their unique identity.
            </p>
            <p>
              We believe that everyone deserves the opportunity to wear and use products that truly 
              represent who they are. That's why we've built an easy-to-use platform that puts the 
              power of design in your hands.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 pb-0">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p>
              Our mission is to provide high-quality customizable products with exceptional 
              customer service. We strive to make the design process simple and enjoyable, 
              while delivering products that exceed our customers' expectations.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              We'd love to hear from you! Whether you have questions about our products, 
              need help with an order, or want to discuss a business opportunity, we're here to help.
            </p>
            <p>
              <a 
                href="/contact" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Visit our Contact page →
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
