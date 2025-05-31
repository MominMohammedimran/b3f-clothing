import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const displayImages = images && images.length > 0 ? images : ['/placeholder.svg'];

  const goToPrevious = () => {
    setCurrentImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Wrapper for image + arrows */}
      <div className="relative w-full sm:w-[85%] mx-auto aspect-[4/5] sm:aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={displayImages[currentImage]}
          alt={`${productName} - View ${currentImage + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Left Arrow */}
        {displayImages.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-1 -translate-y-1/2 bg-white/70 hover:bg-white p-1 sm:p-2 rounded-full shadow"
            aria-label="Previous image"
          >
            <ChevronLeft size={25} />
          </button>
        )}

        {/* Right Arrow */}
        {displayImages.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-1 -translate-y-1/2 bg-white/70 hover:bg-white p-1 sm:p-2 rounded-full shadow"
            aria-label="Next image"
          >
            <ChevronRight size={25} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex justify-center bg-gray-100 rounded-md space-x-3 overflow-x-auto py-2 no-scrollbar px-1 sm:px-3">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`relative rounded-md overflow-hidden w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 border-2 ${
              currentImage === index ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
