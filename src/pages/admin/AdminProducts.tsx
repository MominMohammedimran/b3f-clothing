
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react';
import ProductEditForm from '@/components/admin/ProductEditForm';
import { Product } from '@/lib/types';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched:', data);
      
      const transformedProducts: Product[] = data?.map((product: any) => ({
        id: product.id,
        code: product.code || `PROD-${product.id.slice(0, 8)}`,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.original_price || product.price,
        discountPercentage: product.discount_percentage || 0,
        category: product.category || 'general',
        stock: product.stock || 0,
        image: product.image || '',
        images: Array.isArray(product.images) 
          ? product.images.filter(img => typeof img === 'string')
          : [],
        sizes: Array.isArray(product.sizes) 
          ? product.sizes.filter(size => typeof size === 'string')
          : [],
        tags: Array.isArray(product.tags) 
          ? product.tags.filter(tag => typeof tag === 'string')
          : []
      })) || [];
      
      setProducts(transformedProducts);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData: Product) => {
    try {
      setLoading(true);
      console.log('Saving product data:', productData);

      const productPayload = {
        code: productData.code || `PROD-${Date.now()}`,
        name: productData.name,
        description: productData.description || '',
        price: Number(productData.price),
        original_price: Number(productData.originalPrice) || Number(productData.price),
        discount_percentage: Number(productData.discountPercentage) || 0,
        category: productData.category || 'general',
        stock: Number(productData.stock) || 0,
        image: productData.image || '',
        images: productData.images || [],
        sizes: productData.sizes || [],
        tags: productData.tags || [],
        updated_at: new Date().toISOString()
      };

      let result;
      if (editingProduct) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id)
          .select();
      } else {
        // Create new product
        result = await supabase
          .from('products')
          .insert([{
            ...productPayload,
            created_at: new Date().toISOString()
          }])
          .select();
      }

      if (result.error) {
        console.error('Error saving product:', result.error);
        throw result.error;
      }

      console.log('Product saved successfully:', result.data);
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      
      setShowAddForm(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      console.log('Deleting product:', productId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      toast.success('Product deleted successfully');
      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product: ' + error.message);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const emptyProduct: Product = {
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    image: '',
    images: [],
    code: '',
    category: '',
    tags: [],
    sizes: [],
    stock: 0
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <div className="flex gap-2">
          <Button onClick={fetchProducts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <ProductEditForm
            product={editingProduct || emptyProduct}
            onSave={handleSaveProduct}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Products ({products.length})</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No products found. Add your first product to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-32">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-sm">{product.code}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">₹{product.price}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (product.stock || 0) > 10 
                          ? 'bg-green-100 text-green-800' 
                          : (product.stock || 0) > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
