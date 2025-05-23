
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import CategoryItem from '../components/ui/CategoryItem';
import Banner from '../components/ui/Banner';
import { ScrollArea } from '../components/ui/scroll-area';
import { products, categories } from '../lib/data';
import { Product } from '../lib/types';
import { useIsMobile } from '../hooks/use-mobile';
import { useLocation } from '../context/LocationContext';
import { useWishlist } from '../context/WishlistContext';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { currentLocation } = useLocation();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [visibleCategories, setVisibleCategories] = useState<number>(4);
  const [startIndex, setStartIndex] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setVisibleCategories(4);
      } else if (window.innerWidth <= 1024) {
        setVisibleCategories(4);
      } else {
        setVisibleCategories(6);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentLocation]);

  const handlePrevCategory = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextCategory = () => {
    setStartIndex(prev => Math.min(categories.length - visibleCategories, prev + 1));
  };
  
  const handleProductClick = (product: Product) => {
    if (product.code.includes('TSHIRT-PRINT') || product.code.includes('MUG-PRINT')) {
      navigate(`/design-tool`);
    } else {
      navigate(`/product/details/${product.productId}`);
    }
  };

  const bannerImages = [
    '/lovable-uploads/banner-images/tshirt-banner.png',
    '/lovable-uploads/banner-images/mug-banner.png',
    '/lovable-uploads/banner-images/cap-banner.png'
  ];

  return (
    <Layout >
      <div className="container-custom mt-10">
        <div className="mt-8 mb-6 animate-fade-in" >
          <ScrollArea className="w-full">
            <Banner images={bannerImages} />
          </ScrollArea>
        </div>
        
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Hero Categories</h2>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrevCategory}
                className={`bg-black text-white rounded-full p-1.5 hover:bg-opacity-80 transition-colors ${startIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={startIndex === 0}
              >
                <ChevronLeft size={isMobile ? 16 : 20} />
              </button>
              <button 
                onClick={handleNextCategory}
                className={`bg-black text-white rounded-full p-1.5 hover:bg-opacity-80 transition-colors ${startIndex + visibleCategories >= categories.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={startIndex + visibleCategories >= categories.length}
              >
                <ChevronRight size={isMobile ? 16 : 20} />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div 
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div 
                ref={categoriesRef} 
                className="flex space-x-3 md:space-x-4 py-2 overflow-x-auto"
                style={{ width: 'max-content', scrollSnapType: 'x mandatory' }}
              >
                {categories.slice(startIndex, startIndex + visibleCategories).map(category => (
                  <div key={category.id} className="w-[100px] sm:w-[180px] md:w-[220px] lg:w-[250px]  flex-shrink-0 scroll-snap-align-start">
                    <CategoryItem category={category} /> 
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-5 text-left">Hero Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          
          {products.map((product, index) => (
            <div key={product.id} className={`animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
              <ProductCard 
                product={product}
                onClick={() => handleProductClick(product)}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
