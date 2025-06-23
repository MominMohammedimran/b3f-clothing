
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useImage } from '@/context/ImageContext';

const ImageUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSelectedImage } = useImage();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create an image element to resize
    const img = new Image();
    img.onload = () => {
      // Create canvas to resize image to 150x150
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error('Failed to process image');
        return;
      }

      // Set canvas dimensions to 150x150
      canvas.width = 150;
      canvas.height = 150;

      // Draw and resize image to fit 150x150
      ctx.drawImage(img, 0, 0, 150, 150);

      // Convert to data URL
      const resizedDataUrl = canvas.toDataURL('image/png', 0.9);
      setSelectedImage(resizedDataUrl);
      toast.success('Image processed and ready to use!');
    };

    img.onerror = () => {
      toast.error('Failed to load image. Please try again.');
    };

    // Create object URL to load the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    // Clean up
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-3">Upload Image</h3>
      
      <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Image Requirements:</p>
          <p>• Format: JPG, PNG, GIF, WebP</p>
          <p>• File size: Under 5MB</p>
          <p>• Images will be automatically resized for optimal printing</p>
        </div>
      </div>

      <Button 
        onClick={triggerFileInput}
        className="w-full mb-2"
        variant="outline"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Image
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Images are automatically optimized for design printing
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
