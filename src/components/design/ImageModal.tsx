
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (imageUrl: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onAddImage }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  const handleAddImage = () => {
    if (selectedImage) {
      onAddImage(selectedImage);
      setSelectedImage(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Upload image in PNG, JPG, WebP
            </p>
           <p className="mt-2 text-sm text-gray-600 leading-relaxed">
  For best print results, please upload a high-quality image.
  <br />
  Recommended size: <span className="font-medium text-gray-800">150px height × 150px width</span>
</p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="mt-2"
            />
          </div>

          {selectedImage && (
            <div className="text-center">
              <img
                src={selectedImage}
                alt="Preview"
                className="mx-auto w-32 h-32 object-cover border rounded"
              />
              <p className="text-sm text-green-600 mt-2">✓ Image ready to add</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddImage} disabled={!selectedImage} className="flex-1">
              Add Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
