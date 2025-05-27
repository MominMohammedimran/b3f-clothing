
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
}

export const useSEO = (customSEO?: Partial<SEOData>) => {
  const location = useLocation();
  const baseUrl = 'https://b3f-prints.pages.dev';
  
  const defaultSEO = useMemo(() => {
    const path = location.pathname;
    
    // Define SEO data for different routes
    const seoMap: Record<string, SEOData> = {
      '/': {
        title: 'B3F Prints - Custom T-Shirts, Mugs & More | Design Your Own Products',
        description: 'Create custom t-shirts, mugs, caps and more with our easy-to-use design tool. High-quality printing, fast delivery, and affordable prices.',
        keywords: 'custom t-shirts, personalized mugs, custom printing, design tool, promotional products'
      },
      '/products': {
        title: 'Custom Products - T-Shirts, Mugs, Caps | B3F Prints',
        description: 'Browse our collection of customizable products. Design your own t-shirts, mugs, caps and more with our premium quality materials.',
        keywords: 'custom products, t-shirts, mugs, caps, personalized items'
      },
      '/design-tool': {
        title: 'Design Tool - Create Custom Products Online | B3F Prints',
        description: 'Use our advanced design tool to create custom t-shirts, mugs, and caps. Add text, images, and graphics to make unique products.',
        keywords: 'design tool, custom design, t-shirt designer, mug designer, online design',
        type: 'website' as const
      },
      '/cart': {
        title: 'Shopping Cart | B3F Prints',
        description: 'Review your custom designed products and proceed to checkout. Secure payment and fast shipping available.',
        keywords: 'shopping cart, checkout, custom products'
      },
      '/orders': {
        title: 'Order History | B3F Prints',
        description: 'View your order history and track the status of your custom printed products.',
        keywords: 'order history, order tracking, my orders'
      },
      '/about-us': {
        title: 'About Us - Premium Custom Printing Services | B3F Prints',
        description: 'Learn about B3F Prints - your trusted partner for custom t-shirts, mugs, and promotional products with premium quality and fast delivery.',
        keywords: 'about us, custom printing company, premium quality printing'
      },
      '/contact-us': {
        title: 'Contact Us - Get Support | B3F Prints',
        description: 'Get in touch with B3F Prints for custom printing inquiries, support, or bulk orders. We\'re here to help with your printing needs.',
        keywords: 'contact us, customer support, bulk orders, printing inquiries'
      },
      '/signin': {
        title: 'Sign In to Your Account | B3F Prints',
        description: 'Sign in to your B3F Prints account to access your designs, order history, and manage your custom products.',
        keywords: 'sign in, login, account access'
      },
      '/signup': {
        title: 'Create Account - Join B3F Prints | B3F Prints',
        description: 'Create your B3F Prints account to start designing custom products, save your designs, and track your orders.',
        keywords: 'sign up, create account, register'
      }
    };

    // Handle dynamic routes
    if (path.startsWith('/track-order')) {
      return {
        title: 'Track Your Order | B3F Prints',
        description: 'Track the status and delivery progress of your custom printed products. Real-time order tracking available.',
        keywords: 'track order, order status, delivery tracking'
      };
    }

    if (path.startsWith('/product/')) {
      return {
        title: 'Custom Product Details | B3F Prints',
        description: 'View product details and start customizing with our design tool. High-quality printing on premium materials.',
        keywords: 'product details, custom product, design options',
        type: 'product' as const
      };
    }

    return seoMap[path] || seoMap['/'];
  }, [location.pathname]);

  return {
    ...defaultSEO,
    ...customSEO,
    url: `${baseUrl}${location.pathname}`,
    image: customSEO?.image || `${baseUrl}/og-image.jpg`
  };
};
