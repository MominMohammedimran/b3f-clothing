
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

    const img = new Image();
    img.onload = () => {
      if (img.width !== 150 || img.height !== 150) {
        toast.error('Image must be exactly 150x150 pixels', {
          description: `Your image is ${img.width}x${img.height}. Please resize it to 150x150 pixels.`
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSelectedImage(dataUrl);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      toast.error('Failed to load image. Please try again.');
    };

    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
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
              Upload image (150x150px required)
            </p>
            <input
              type="file"
              accept="image/*"
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
