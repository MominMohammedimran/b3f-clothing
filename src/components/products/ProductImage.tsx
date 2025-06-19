
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageProps {
  image: string;
  name: string;
  additionalImages?: string[];
}

const ProductImage = ({ image, name, additionalImages = [] }: ProductImageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combine main image with additional images
  const images = [image, ...(additionalImages || [])].filter(Boolean);
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  return (
    <div className="bg-white p-4 pt-0rounded-lg shadow ">
      <div className="relative mb-4 align-middle"
>
        <img 
          src={images[currentImageIndex] || '/placeholder.svg'} 
          alt={name} 
          className="w-full h-auto object-cover rounded-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full ${
                    i === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="flex overflow-x-auto justify-evenly gap-4 py-2 no-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`flex-shrink-0 w-16 h-16 border-2 rounded-md overflow-hidden ${
                i === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
              }`}
            >
              <img 
                src={img || '/placeholder.svg'} 
                alt={`${name} view ${i + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImage;
