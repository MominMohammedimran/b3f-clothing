
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  mainImage?: string;
  additionalImages?: string[];
  onMainImageChange: (url: string) => void;
  onAdditionalImagesChange: (urls: string[]) => void;
  productId?: string;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  mainImage,
  additionalImages = [],
  onMainImageChange,
  onAdditionalImagesChange,
  productId
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      onMainImageChange(url);
      toast.success('Main image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = files.map(uploadImage);
      const urls = await Promise.all(uploadPromises);
      onAdditionalImagesChange([...additionalImages, ...urls]);
      toast.success('Additional images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    onAdditionalImagesChange(newImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Product Images</Label>
        <p className="text-sm text-gray-500 mb-4">Upload high-quality images for your product</p>
      </div>

      {/* Main Image */}
      <div className="space-y-2">
        <Label htmlFor="mainImage">Main Product Image</Label>
        <div className="flex items-start gap-4">
          <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt="Main product" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImagePlus className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              id="mainImage"
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={uploading}
            />
            <p className="text-xs text-gray-500">
              This will be the primary image shown for your product. Recommended size: 800x800px
            </p>
          </div>
        </div>
      </div>

      {/* Additional Images */}
      <div className="space-y-2">
        <Label htmlFor="additionalImages">Additional Images</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {additionalImages.map((imageUrl, index) => (
            <div key={index} className="relative">
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Product view ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => removeAdditionalImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Upload Button */}
          <label className="cursor-pointer flex items-center justify-center w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-center">
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Add Images</span>
            </div>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImageUpload}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Add up to 6 additional images to show different views of your product.
        </p>
      </div>

      {uploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Uploading images...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
