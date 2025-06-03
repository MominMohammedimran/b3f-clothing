
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

    // Create an image element to check dimensions
    const img = new Image();
    img.onload = () => {
      // Check image dimensions
      if (img.width !== 150 || img.height !== 150) {
        toast.error('Image must be exactly 150x150 pixels', {
          description: `Your image is ${img.width}x${img.height}. Please resize it to 150x150 pixels.`,
          action: {
            label: 'Learn More',
            onClick: () => {
              toast.info('Use any image editor to resize your image to 150x150 pixels for best results');
            }
          }
        });
        return;
      }

      // Convert to data URL for use in canvas
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSelectedImage(dataUrl);
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
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
          <p>• Dimensions: Exactly 150x150 pixels</p>
          <p>• Format: JPG, PNG, GIF, WebP</p>
          <p>• File size: Under 5MB</p>
        </div>
      </div>

      <Button 
        onClick={triggerFileInput}
        className="w-full mb-2"
        variant="outline"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Image (150x150px)
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Please upload image with dimensions 150x150px
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
