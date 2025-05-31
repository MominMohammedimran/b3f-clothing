
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsappCommunityWidget from '../ui/WhatsappCommunityWidget';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen"
   >
      <Navbar />
      <main className="flex-grow pt-6 md:pt-16 pb-16" >
        {children}
      </main>
      {!hideFooter && <Footer />}
      <WhatsappCommunityWidget />
    </div>
  );
};

export default Layout;
