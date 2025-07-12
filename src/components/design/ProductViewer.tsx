
import React from 'react';

interface ProductViewerProps {
  productType: string;
  view: string;
  designImage?: string;
}

const ProductViewer: React.FC<ProductViewerProps> = ({ productType, view, designImage }) => {
  const getImageSrc = () => {
    // Using Unsplash high-quality images for product previews
    if (productType === 'tshirt') {
      switch (view) {
        case 'front':
          return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-sub-images/tshirt-front.webp';
        case 'back':
          return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-sub-images/tshirt-back.webp';
        case 'left':
        case 'right':
          return 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500';
        default:
          return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500';
      }
    } else if (productType === 'mug') {
      return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/mug-sub-images/mug-plain.webp';
    } else if (productType === 'cap') {
      return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/cap-sub-images/cap-plain.webp';
    } else if (productType === 'photo_frame') {
      // Different frame images based on size view
      switch (view) {
        case '8X12inch':
          return 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600';
        case '12x16inch':
          return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=450&h=600';
        case '5x7 inch':
          return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=350&h=490';
        default:
          return 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600';
      }
    } else if (productType === 'pant') {
      return 'https://images.unsplash.com/photo-1604176424472-9e9468137a3c?w=500&h=500';
    } else if (productType === 'nightPant') {
      return 'https://images.unsplash.com/photo-1635526108184-28cb23767974?w=500&h=500';
    }
    
    // Fallback image
    return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=500';
  };
  
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Base product image */}
      <img
        src={getImageSrc()}
        alt={`${productType} ${view} view`}
        className="max-w-full max-h-full object-contain"
      />
      
      {/* Design overlay if available */}
      {designImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={designImage}
            alt="Design"
            className="max-w-full max-h-full object-contain opacity-90 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
};

export default ProductViewer;