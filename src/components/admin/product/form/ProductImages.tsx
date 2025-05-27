import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XCircle, Plus, ImagePlus } from 'lucide-react';

interface ProductImagesProps {
  mainImage: string;
  additionalImages: string[];
  onMainImageChange: (file: File) => void;
  onAdditionalImagesChange: (files: File[]) => void;
  onRemoveAdditionalImage: (index: number) => void;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  mainImage,
  additionalImages,
  onMainImageChange,
  onAdditionalImagesChange,
  onRemoveAdditionalImage
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>(additionalImages || []);
  
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onMainImageChange(file);
    }
  };
  
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onAdditionalImagesChange(files);
      
      // Generate preview URLs for the new images
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    onRemoveAdditionalImage(index);
    
    setPreviewUrls(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Images</h3>
      
      {/* Main product image */}
      <div className="space-y-2">
        <Label htmlFor="mainImage">Main Product Image</Label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt="Main product" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImagePlus className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Input
              id="mainImage"
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the primary image shown for your product.
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional product images */}
      <div className="space-y-2">
        <Label htmlFor="additionalImages">Additional Images</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing additional images */}
          {previewUrls.map((imageUrl, index) => (
            <div 
              key={`additional-image-${index}`}
              className="relative w-full pt-[100%] bg-gray-100 rounded-md overflow-hidden"
            >
              <img 
                src={imageUrl} 
                alt={`Product view ${index + 1}`} 
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full p-0"
                onClick={() => handleRemoveImage(index)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {/* Add more images button */}
          <label 
            htmlFor="additionalImages" 
            className="cursor-pointer flex items-center justify-center w-full pt-[100%] bg-gray-50 border-2 border-dashed border-gray-200 rounded-md relative hover:bg-gray-100 transition-colors"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Plus className="h-8 w-8 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Add Images</span>
            </div>
            <Input
              id="additionalImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="sr-only"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Add up to 5 additional images to show different views of your product.
        </p>
      </div>
    </div>
  );
};

export default ProductImages;
