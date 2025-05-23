
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 mt-10">
        <h1 className="text-3xl font-bold mb-6">Welcome to our Store</h1>
        <p className="text-xl mb-8">Check out our latest products and customize your own designs!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link to="/products" className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Browse Products</h2>
            <p>Explore our collection of customizable products</p>
          </Link>
          
          <Link to="/design-tool" className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700 transition-colors">
            <h2 className="text-2xl font-bold mb-2">Design Your Own</h2>
            <p>Create custom designs for t-shirts and more</p>
          </Link>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">About Us</h2>
          <p className="mb-4">We provide high-quality custom printed products that let you express your unique style.</p>
          <Link to="/about-us" className="text-blue-600 hover:underline">Learn more about us</Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
