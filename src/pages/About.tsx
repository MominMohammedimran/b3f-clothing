
import React from 'react';
import Layout from '../components/layout/Layout';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="prose max-w-none">
            <p className="mb-4">
              Welcome to B3F Prints & Men's Wear, your premier destination for custom printed apparel and high-quality men's fashion. 
              Established with a passion for creative expression and style, we take pride in delivering exceptional products that help you 
              showcase your unique identity.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Our Story</h2>
            <p className="mb-4">
              Founded in 2020, B3F Prints & Men's Wear began as a small custom printing shop with a vision to provide personalized 
              clothing options to our local community. What started as a modest venture quickly grew into a comprehensive 
              fashion destination, serving customers nationwide with our expanded product line and innovative design tools.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Our Mission</h2>
            <p className="mb-4">
              Our mission is to empower individuals and businesses to express themselves through high-quality custom apparel 
              and accessories. We believe that what you wear tells your story, and we're here to help you tell it in style.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">What Sets Us Apart</h2>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Advanced online design tools that make customization easy and fun</li>
              <li className="mb-2">Premium quality materials sourced from trusted suppliers</li>
              <li className="mb-2">State-of-the-art printing technology for vibrant, long-lasting results</li>
              <li className="mb-2">Dedicated customer service team ready to assist you at every step</li>
              <li className="mb-2">Fast production and shipping times without compromising on quality</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Our Products</h2>
            <p className="mb-4">
              From custom t-shirts and caps to stylish mugs and accessories, our product range is designed to cater to diverse needs and preferences. 
              Whether you're looking for personalized gifts, promotional items for your business, or simply want to update your wardrobe with unique pieces, 
              we've got you covered.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">Our Commitment</h2>
            <p className="mb-4">
              At B3F Prints & Men's Wear, we're committed to sustainability, quality, and customer satisfaction. We continuously strive to reduce our 
              environmental footprint while delivering products that exceed expectations. Your trust in us drives our passion for excellence.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
