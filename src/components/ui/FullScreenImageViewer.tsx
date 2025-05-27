
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface FullScreenImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialImageIndex?: number;
}

const FullScreenImageViewer = ({
  isOpen,
  onClose,
  images,
  initialImageIndex = 0
}: FullScreenImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === '+') handleZoomIn();
    if (e.key === '-') handleZoomOut();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X size={32} />
      </button>

      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex flex-col space-y-4">
        <button
          onClick={handleZoomIn}
          className="bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
        >
          <ZoomOut size={20} />
        </button>
      </div>

      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
      >
        <ChevronLeft size={24} />
      </button>

      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
      >
        <img
          src={images[currentIndex]}
          alt="Full Screen"
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        />
      </div>

      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
      >
        <ChevronRight size={24} />
      </button>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setZoomLevel(1);
              }}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FullScreenImageViewer;
