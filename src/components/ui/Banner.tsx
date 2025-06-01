import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerProps {
  images: string[];
  autoplaySpeed?: number;
}

const Banner = ({ images, autoplaySpeed = 3000 }: BannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [images.length, autoplaySpeed, isHovered]);

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
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-lg overflow-hidden banner-img 
        w-full sm:w-[100%] md:w-[80%] lg:w-[80%] xl:w-[80%] mx-auto
        h-[180px] sm:h-[250px] lg:h-[300px]"
    >
      <div
        className="flex transition-transform duration-500 ease-out w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              srcSet={`
                ${image}?w=400 400w,
                ${image}?w=800 800w,
                ${image}?w=1200 1200w
              `}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 80vw"
              alt={`Banner ${index + 1}`}
              className="w-full object-cover h-[180px] sm:h-[250px] lg:h-[300px]"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-1"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-1"
            aria-label="Next Slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'} transition-all`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Banner;
