
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';

interface ProductImagesProps {
  mainImage: string;
  additionalImages: string[];
  onMainImageChange: (url: string) => void;
  onAdditionalImagesChange: (urls: string[]) => void;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  mainImage,
  additionalImages,
  onMainImageChange,
  onAdditionalImagesChange
}) => {
  
  const handleAddAdditionalImage = () => {
    onAdditionalImagesChange([...additionalImages, '']);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const updated = additionalImages.filter((_, i) => i !== index);
    onAdditionalImagesChange(updated);
  };

  const handleAdditionalImageChange = (index: number, url: string) => {
    const updated = [...additionalImages];
    updated[index] = url;
    onAdditionalImagesChange(updated);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Images</h3>
      
      {/* Main product image */}
      <div className="space-y-2">
        <Label htmlFor="mainImage">Main Product Image URL</Label>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt="Main product" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
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
              type="url"
              value={mainImage}
              onChange={(e) => onMainImageChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the URL for the main product image.
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional product images */}
      <div className="space-y-2">
        <Label>Additional Image URLs</Label>
        <div className="space-y-2">
          {additionalImages.map((imageUrl, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => handleAdditionalImageChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={() => handleRemoveAdditionalImage(index)}
                className="text-red-500 hover:text-red-700 px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAdditionalImage}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Another Image URL
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Enter URLs for additional product images.
        </p>
      </div>
    </div>
  );
};

export default ProductImages;
