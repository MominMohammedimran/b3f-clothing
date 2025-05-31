
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbaseAIWidget from '../ui/ChatbaseAIWidget';
import StructuredData from '../seo/StructuredData';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const organizationData = {
    name: "B3F Prints",
    url: "https://b3f-prints.pages.dev",
    logo: "https://b3f-prints.pages.dev/logo.png",
    description: "Premium custom printing services for t-shirts, mugs, caps and more. Design your own products with our easy-to-use design tool.",
    contactPoint: {
      telephone: "+91-XXXXXXXXXX",
      contactType: "Customer Service",
      areaServed: "India"
    },
    sameAs: [
      "https://facebook.com/b3fprints",
      "https://instagram.com/b3fprints",
      "https://twitter.com/b3fprints"
    ]
  };

  const websiteData = {
    name: "B3F Prints",
    url: "https://b3f-prints.pages.dev",
    description: "Custom printing platform for personalized products",
    potentialAction: {
      target: "https://b3f-prints.pages.dev/search?q={search_term_string}",
      queryInput: "required name=search_term_string"
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <StructuredData type="organization" data={organizationData} />
      <StructuredData type="website" data={websiteData} />
      <Navbar />
      <main className="flex-grow pt-6 md:pt-16 pb-16">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <ChatbaseAIWidget />
    </div>
  );
};

export default Layout;
