
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerProps {
  images: string[];
  autoplaySpeed?: number;
}

const Banner = ({ images, autoplaySpeed = 5000 }: BannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, autoplaySpeed);
    
    return () => clearInterval(interval);
  }, [images.length, autoplaySpeed]);
  
  const goToPrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      (prevIndex + 1) % images.length
    );
  };
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  if (images.length === 0) return null;
  
  return (
   <div className="relative rounded-lg overflow-hidden banner-img 
   w-full sm:w-[100%] md:w-[80%] lg:w-[80%] xl:w-[80%] mx-auto
    h-[180px] sm:h-[250px] lg:h-[300px]">

      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` ,

        }}
      >
        {images.map((image, index) => (
          <img 
            key={index}
            src={image}
            alt={`Banner ${index + 1}`}
             className="w-full min-w-full object-fill h-[200px]
             sm:h-[250px] lg:h-[300px]" 
 
            loading="lazy"
          />
        ))}
      </div>
      
      {images.length > 1 && (
        <>
         
          <div className="absolute  bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </>
      )}
      
      <style>
        {`
          
          /* Add smooth transition for better user experience */
          .banner-img .transition-transform {
            transition: transform 0.5s ease-out;
          }
          
          /* Optimize for performance */
          .banner-img img {
            will-change: transform;
          }
        `}
      </style>
    </div>
  );
};

export default Banner;
