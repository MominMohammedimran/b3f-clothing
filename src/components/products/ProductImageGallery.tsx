
import React, { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const displayImages = images && images.length > 0 ? images : ['/placeholder.svg'];

  return (
    <div className="space-y-3 ">
      <div className="aspect-square flex bg-black-500 rounded-lg overflow-hidden
      w-[85%]  ml-auto mr-auto mb-0">
        <img
          src={displayImages[currentImage]}
          alt={`${productName} - View ${currentImage + 1}`}
          className="w-full h-full  bg-black-500 object-contain object-center"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
         
        />
      </div>

      <div className="flex justify-evenly  bg-gray-100 rounded-square space-x-3 overflow-x-auto py-2 no-scrollbar"
           >
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`relative rounded-md overflow-hidden w-16 h-16 flex-shrink-0 border-2 ${
              currentImage === index ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover "
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
