
import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import ProductList from '@/components/admin/product/ProductList';
import ProductDialogs from '@/components/admin/product/ProductDialogs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const queryClient = useQueryClient();

  // Use React Query to fetch products
  const { 
    data: products = [], 
    isLoading,
    refetch,
    error 
  } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: fetchProducts,
    retry: 3,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false
  });

  async function fetchProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Parse JSON fields with proper type casting
        const parsedProducts = data.map(product => ({
          id: product.id,
          code: product.code || '',
          name: product.name || '',
          description: product.description || '',
          price: product.price || 0,
          originalPrice: product.original_price || product.price || 0,
          discountPercentage: product.discount_percentage || 0,
          image: product.image || '',
          rating: product.rating || 0,
          category: product.category || '',
          tags: Array.isArray(product.tags) ? product.tags : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          images: Array.isArray(product.images) ? product.images : [],
          stock: product.stock || 0
        } as Product));
        
        return parsedProducts;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
    if (product.image) {
      setImagePreviewUrl(product.image);
    } else {
      setImagePreviewUrl('');
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowAddDialog(true);
    setImagePreviewUrl('');
    setImageFile(null);
  };

  const handleDelete = async (product: Product) => {
    try {
      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) {
        throw error;
      }
      
      // Update UI state by refetching
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      refetch();
      toast.success({ title: `Product "${product.name}" deleted successfully` });
    } catch (error: any) {
      toast.error({ title: 'Failed to delete product', description: error.message });
    }
  };

  const handleImageSelected = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
  };

  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('public')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      throw error;
    }
  };

  // Helper function to upload multiple images
  const uploadMultipleImages = async (files: File[]) => {
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      let imageUrl = productData.image;
      let imageUrls = productData.images || [];
      
      // Upload main image if available
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // Upload additional images if available
      if (productData.additionalImageFiles && productData.additionalImageFiles.length > 0) {
        const additionalImageUrls = await uploadMultipleImages(productData.additionalImageFiles);
        imageUrls = [...imageUrls, ...additionalImageUrls];
      }

      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            code: productData.code,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.originalPrice,
            discount_percentage: productData.discountPercentage,
            image: imageUrl,
            images: imageUrls || [],
            tags: productData.tags || [],
            sizes: productData.sizes || [],
            stock: productData.stock || 0,
            category: productData.category,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedProduct.id);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        refetch();
        toast.success({ title: 'Product updated successfully' });
        setShowEditDialog(false);
      } else {
        // Add new product
        const { data, error } = await supabase
          .from('products')
          .insert([{
            code: productData.code || Math.random().toString(36).substring(2, 10),
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.originalPrice,
            discount_percentage: productData.discountPercentage,
            image: imageUrl,
            images: imageUrls || [],
            tags: productData.tags || [],
            sizes: productData.sizes || [],
            stock: productData.stock || 0,
            category: productData.category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        refetch();
        toast.success({ title: 'Product added successfully' });
        setShowAddDialog(false);
      }
      
      // Reset image state
      setImageFile(null);
      setImagePreviewUrl('');
    } catch (error: any) {
      toast.error({ title: 'Failed to save product', description: error.message });
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6 pt-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
            <Button onClick={handleAdd}>
              <Plus size={16} className="mr-1" />
              Add Product
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading products. Please try refreshing the page.
          </div>
        ) : (
          <ProductList 
            products={products as Product[]} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </div>

      <ProductDialogs
        showEditDialog={showEditDialog}
        showAddDialog={showAddDialog}
        selectedProduct={selectedProduct}
        imagePreviewUrl={imagePreviewUrl}
        onEditDialogChange={setShowEditDialog}
        onAddDialogChange={setShowAddDialog}
        onImageSelected={handleImageSelected}
        onSaveProduct={handleSaveProduct}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
