import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import CategorySelect from './CategorySelect';

interface ProductFormProps {
  product?: Product | null;
  onSave: (productData: Product) => void;
  onCancel: () => void;
  imagePreviewUrl: string;
  onImageSelected: (file: File, previewUrl: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  imagePreviewUrl,
  onImageSelected
}) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    product ? { ...product } : {
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      category: '',
      stock: 0,
      code: '',
      tags: [],
      sizes: [],
      image: '',
      additionalImages: []
    }
  );
  const [tagInput, setTagInput] = useState<string>('');
  const [sizeInput, setSizeInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<Array<{file: File, preview: string}>>([]);
  
  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        discountPercentage: 0,
        category: '',
        stock: 0,
        code: '',
        tags: [],
        sizes: [],
        image: '',
        additionalImages: []
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'originalPrice' || name === 'discountPercentage' || name === 'stock') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setImageFile(file);
      onImageSelected(file, previewUrl);
      setFormData({ ...formData, image: previewUrl });
    };
    reader.readAsDataURL(file);
  };
  
  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const newImages = [...additionalImages];
    const newAdditionalImages = [...(formData.additionalImages || [])];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        newImages.push({ file, preview: previewUrl });
        setAdditionalImages([...newImages]);
        
        // Update formData
        newAdditionalImages.push(previewUrl);
        setFormData({
          ...formData,
          additionalImages: newAdditionalImages
        });
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeAdditionalImage = (index: number) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
    
    // Update formData
    const updatedAdditionalImages = [...(formData.additionalImages || [])];
    updatedAdditionalImages.splice(index, 1);
    
    setFormData({
      ...formData,
      additionalImages: updatedAdditionalImages
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    });
  };

  const handleAddSize = () => {
    if (sizeInput.trim() && !formData.sizes?.includes(sizeInput.trim())) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), sizeInput.trim()]
      });
      setSizeInput('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter(s => s !== size)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name"
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description" 
                value={formData.description || ''} 
                onChange={handleChange} 
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input 
                  id="price"
                  name="price" 
                  type="number" 
                  value={formData.price || ''} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input 
                  id="originalPrice"
                  name="originalPrice" 
                  type="number" 
                  value={formData.originalPrice || formData.price || ''} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input 
                  id="discountPercentage"
                  name="discountPercentage" 
                  type="number" 
                  value={formData.discountPercentage || ''} 
                  onChange={handleChange} 
                  min="0" 
                  max="100" 
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input 
                  id="stock"
                  name="stock" 
                  type="number" 
                  value={formData.stock || ''} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="code">Product Code</Label>
              <Input 
                id="code"
                name="code" 
                value={formData.code || ''} 
                onChange={handleChange} 
                placeholder="e.g. PROD-001" 
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <CategorySelect
                value={formData.category || ''}
                onChange={(value) => setFormData({ ...formData, category: value })}
              />
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                    <span>{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                <Input 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="mr-2"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
            </div>
            
            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.sizes?.map((size, index) => (
                  <div key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center">
                    <span>{size}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSize(size)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                <Input 
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="Add a size"
                  className="mr-2"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                />
                <Button type="button" onClick={handleAddSize}>Add</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-4 pt-4">
          <div>
            <Label>Main Product Image</Label>
            <div className="mt-2 border rounded-lg p-4">
              {imagePreviewUrl ? (
                <div className="relative w-full">
                  <img 
                    src={imagePreviewUrl} 
                    alt="Product preview" 
                    className="h-[200px] w-full object-contain bg-gray-100 rounded mb-2" 
                  />
                </div>
              ) : (
                <div className="h-[200px] w-full flex items-center justify-center bg-gray-100 rounded mb-2 border-2 border-dashed">
                  <span className="text-gray-500">No image selected</span>
                </div>
              )}
              <Input 
                type="file" 
                onChange={handleImageChange} 
                accept="image/*" 
                className="mt-2" 
              />
            </div>
          </div>
          
          {/* Additional Images Section */}
          <div>
            <Label>Additional Images</Label>
            <div className="mt-2 border rounded-lg p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {additionalImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img.preview} 
                      alt={`Additional ${index}`} 
                      className="h-24 w-full object-cover bg-gray-100 rounded"
                    />
                    <button 
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {(!additionalImages || additionalImages.length === 0) && (
                  <div className="h-24 w-full flex items-center justify-center bg-gray-100 rounded border-2 border-dashed col-span-3">
                    <span className="text-gray-500">No additional images</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <Label htmlFor="additional-images" className="flex-1">
                  <div className="flex items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100">
                    <Upload size={16} className="mr-2 text-blue-600" />
                    <span className="text-blue-600">Upload Additional Images</span>
                  </div>
                  <Input 
                    id="additional-images"
                    type="file" 
                    onChange={handleAdditionalImageChange} 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                  />
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
