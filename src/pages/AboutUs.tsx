
import React from 'react';
import Layout from '../components/layout/Layout';

const AboutUs = () => {
  return (
    <Layout>
      <div className="container-custom pt-2 pb-24 mt-10">
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
